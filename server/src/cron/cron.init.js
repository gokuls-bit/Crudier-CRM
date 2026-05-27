/**
 * ============================================================
 * Crudier CRM — Scheduled Cron Jobs
 * ============================================================
 * Schedules recurring background tasks:
 * 1. Daily attendance check-ins summary (at 8:00 PM)
 * 2. Task due date email reminders (at 9:00 AM)
 * 3. Weekly log file truncation/cleanup (at Sunday midnight)
 */

const cron = require('node-cron');
const logger = require('../../config/logger');
const { getDb } = require('../../config/db');
const { queueEmail } = require('../queues/queue.manager');
const fs = require('fs');
const path = require('path');

const initCronJobs = () => {
  logger.info('[Cron] Initializing scheduled tasks...');

  // ── 1. Daily Attendance Summary (Runs daily at 8:00 PM: '0 20 * * *')
  cron.schedule('0 20 * * *', async () => {
    logger.info('[Cron] Running daily attendance summary job...');
    try {
      const db = getDb();
      const todayString = new Date().toISOString().split('T')[0];

      // Query database logs directly for today
      const logs = await db.collection('attendance').find({ date: todayString }).toArray();
      const present = logs.filter((l) => l.status === 'Present').length;
      const late = logs.filter((l) => l.status === 'Late').length;
      const halfDay = logs.filter((l) => l.status === 'Half Day').length;
      const absent = logs.filter((l) => l.status === 'Absent').length;

      logger.info(`[Cron] Attendance logs counted for ${todayString}: Present: ${present}, Late: ${late}, Half Day: ${halfDay}, Absent: ${absent}`);

      // Dispatch daily summaries to Founders and Admins
      const administrators = await db.collection('users').find({ role: { $in: ['Founder', 'Admin'] } }).toArray();

      for (const admin of administrators) {
        queueEmail({
          to: admin.email,
          subject: `Daily Attendance Summary — ${todayString}`,
          text: `Hello ${admin.name},\n\nHere is the attendance summary for today (${todayString}):\n\nPresent: ${present}\nLate: ${late}\nHalf Day: ${halfDay}\nAbsent: ${absent}\n\nTotal Check-ins: ${logs.length}\n\nBest regards,\nCrudier CRM Service`,
          html: `<p>Hello ${admin.name},</p><p>Here is the workspace attendance summary for today (<strong>${todayString}</strong>):</p><ul><li><strong>Present:</strong> ${present}</li><li><strong>Late:</strong> ${late}</li><li><strong>Half Day:</strong> ${halfDay}</li><li><strong>Absent:</strong> ${absent}</li></ul><p>Total Check-ins recorded: <strong>${logs.length}</strong></p><p>Best regards,<br>Crudier CRM Service</p>`,
        });
      }
    } catch (err) {
      logger.error('[Cron] Daily attendance summary job failed:', err);
    }
  });

  // ── 2. Task Due Reminders (Runs daily at 9:00 AM: '0 9 * * *')
  cron.schedule('0 9 * * *', async () => {
    logger.info('[Cron] Running task due date reminders job...');
    try {
      const db = getDb();
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Find active tasks due today
      const activeDueTasks = await db.collection('tasks').find({
        dueDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $nin: ['Approved', 'Completed'] },
      }).toArray();

      logger.info(`[Cron] Found ${activeDueTasks.length} active tasks due today.`);

      for (const task of activeDueTasks) {
        if (task.assignedTo) {
          const assignee = await db.collection('users').findOne({ _id: task.assignedTo });
          if (assignee && assignee.email) {
            queueEmail({
              to: assignee.email,
              subject: `Task Due Reminder: ${task.title}`,
              text: `Hi ${assignee.name},\n\nThis is a friendly reminder that task "${task.title}" is due today.\nPriority: ${task.priority}\n\nPlease update the task status in the CRM dashboard.\n\nBest,\nWorkspace Administrator`,
              html: `<p>Hi ${assignee.name},</p><p>This is a friendly reminder that the task <strong>"${task.title}"</strong> is due today.</p><p><strong>Priority:</strong> ${task.priority}</p><p>Please update the task status in the CRM dashboard.</p><p>Best,<br>Workspace Administrator</p>`,
            });
          }
        }
      }
    } catch (err) {
      logger.error('[Cron] Task reminders job failed:', err);
    }
  });

  // ── 3. Weekly Log Archival/Cleanup (Runs Sunday at midnight: '0 0 * * 0')
  cron.schedule('0 0 * * 0', async () => {
    logger.info('[Cron] Running weekly log archival cleanup...');
    try {
      const logDir = path.join(__dirname, '../../logs');
      const targetFiles = ['access.log', 'error.log', 'exceptions.log', 'rejections.log', 'combined.log'];

      for (const filename of targetFiles) {
        const filePath = path.join(logDir, filename);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          // Truncate logs if they exceed 10MB to save disk space
          if (stats.size > 10 * 1024 * 1024) {
            fs.writeFileSync(filePath, '');
            logger.info(`[Cron] Truncated large log file: ${filename}`);
          }
        }
      }
    } catch (err) {
      logger.error('[Cron] Weekly log cleanup failed:', err);
    }
  });
};

module.exports = initCronJobs;
