/**
 * ============================================================
 * Crudier CRM — In-Memory Queue Manager (Redis Bypassed)
 * ============================================================
 * Processes tasks asynchronously in memory, removing the dependency
 * on Redis-backed Bull queues.
 */

const logger = require('../../config/logger');
const sendEmail = require('../utils/sendEmail');

// Mock email queue structure for compatibility
const emailQueue = {
  process: (fn) => {
    logger.info('[Queue Worker] Standalone mock processor active.');
  },
  on: (event, handler) => {},
};

/**
 * Queue an email delivery task helper (in-memory async execution).
 * @param {Object} emailOpts – { to, subject, text, html }
 */
const queueEmail = (emailOpts) => {
  logger.info(`[Queue Worker] Adding email to queue for: ${emailOpts.to}`);
  
  // Dispatch asynchronously using setImmediate to avoid blocking the request loop
  setImmediate(async () => {
    try {
      logger.info(`[Queue Worker] Asynchronously dispatching email targeting ${emailOpts.to}...`);
      await sendEmail(emailOpts);
      logger.info(`[Queue Worker] Mock email job for ${emailOpts.to} completed successfully.`);
    } catch (err) {
      logger.error(`[Queue Worker] Mock email job for ${emailOpts.to} failed:`, err);
    }
  });
};

module.exports = {
  emailQueue,
  queueEmail,
};
