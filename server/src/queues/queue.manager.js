/**
 * ============================================================
 * Crudier CRM — Bull Queue Manager
 * ============================================================
 * Sets up Redis-backed job queues via Bull to process resource-heavy
 * tasks (such as sending emails, dispatching alerts, or processing
 * bulk exports) asynchronously.
 */

const Queue = require('bull');
const logger = require('../../config/logger');
const sendEmail = require('../utils/sendEmail');

// Get Redis configurations
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// ── 1. Create the Email Queue ────────────────────────────────
const emailQueue = new Queue('email-queue', redisUrl);

// Process email delivery jobs asynchronously
emailQueue.process(async (job) => {
  const { to, subject, text, html } = job.data;
  logger.info(`[Queue Worker] Dispatching email job ${job.id} targeting ${to}...`);
  return await sendEmail({ to, subject, text, html });
});

// Listener events
emailQueue.on('completed', (job) => {
  logger.info(`[Queue Worker] Job ${job.id} completed successfully.`);
});

emailQueue.on('failed', (job, err) => {
  logger.error(`[Queue Worker] Job ${job.id} failed with error:`, err);
});

/**
 * Queue an email delivery task helper.
 * @param {Object} emailOpts – { to, subject, text, html }
 */
const queueEmail = (emailOpts) => {
  emailQueue.add(emailOpts, {
    attempts: 3, // Retry up to 3 times on failure
    backoff: {
      type: 'exponential',
      delay: 5000, // Wait 5 seconds, then 10 seconds, etc.
    },
    removeOnComplete: true, // Clean up finished job metadata from Redis
  });
};

module.exports = {
  emailQueue,
  queueEmail,
};
