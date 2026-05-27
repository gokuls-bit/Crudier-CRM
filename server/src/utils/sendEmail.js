/**
 * ============================================================
 * Crudier CRM — Email Sender Helper
 * ============================================================
 * Wraps nodemailer to send system invitations, reset codes, and alerts.
 */

const transporter = require('../../config/mailer');
const logger = require('../../config/logger');

/**
 * Sends an email using the configured SMTP transporter.
 * @param {Object} options – { to, subject, text, html }
 * @returns {Promise<Object>}
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const from = process.env.EMAIL_FROM || '"Crudier CRM" <no-reply@crudier-crm.local>';
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    logger.info(`[Mailer] Email delivered successfully to ${to}. ID: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error(`[Mailer] Email delivery to ${to} failed:`, err);
    throw err;
  }
};

module.exports = sendEmail;
