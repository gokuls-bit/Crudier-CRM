/**
 * ============================================================
 * Crudier CRM — SMS Sender Helper
 * ============================================================
 * Sends notification SMS via Twilio if configured, else mocks to logger.
 */

const logger = require('../../config/logger');

/**
 * Sends an SMS text message to the target recipient.
 * @param {string} to – phone number (e.g. +1234567890)
 * @param {string} message – text message content
 * @returns {Promise<Object>}
 */
const sendSMS = async (to, message) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (accountSid && authToken && from) {
    try {
      // Lazy load twilio to avoid crash if not installed/desired
      const twilio = require('twilio');
      const client = twilio(accountSid, authToken);
      
      const response = await client.messages.create({
        body: message,
        from,
        to,
      });

      logger.info(`[SMS] Message dispatched to ${to} via Twilio. ID: ${response.sid}`);
      return response;
    } catch (err) {
      logger.error(`[SMS] Dispatch to ${to} failed:`, err);
      throw err;
    }
  } else {
    // Log message for local development
    logger.info('--- [SMS Mock] Sending SMS ---');
    logger.info(`To:      ${to}`);
    logger.info(`Message: ${message}`);
    logger.info('------------------------------');
    return { 
      sid: `mock-sms-sid-${Date.now()}`,
      status: 'queued'
    };
  }
};

module.exports = sendSMS;
