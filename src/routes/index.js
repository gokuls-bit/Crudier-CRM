/**
 * ============================================================
 * Crudier CRM — Central Router / Router Index
 * ============================================================
 */

const { Router } = require('express');
const { getConnectionStatus } = require('../../config/db');

// Import sub-routers
const authRoutes = require('../modules/auth/auth.routes');
const workspaceRoutes = require('../modules/workspace/workspace.routes');
const teamRoutes = require('../modules/team/team.routes');
const taskRoutes = require('../modules/tasks/task.routes');
const attendanceRoutes = require('../modules/attendance/attendance.routes');
const notesRoutes = require('../modules/notes/notes.routes');
const meetingRoutes = require('../modules/meetings/meeting.routes');
const notificationRoutes = require('../modules/notifications/notification.routes');
const salesRoutes = require('../modules/sales/sales.routes');

const router = Router();

// Health check endpoint directly on root level (GET /api/v1/health)
router.get('/health', (_req, res) => {
  const dbConnected = getConnectionStatus();
  return res.status(200).json({
    success: true,
    status: 'ok',
    data: {
      service: 'crudier-crm-api',
      version: '1.0.0',
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        status: dbConnected ? 'healthy' : 'disconnected',
      },
      memory: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      },
    },
  });
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/team', teamRoutes);
router.use('/tasks', taskRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/notes', notesRoutes);
router.use('/meetings', meetingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/sales', salesRoutes);

module.exports = router;
