/**
 * ============================================================
 * Crudier CRM — Mailer Setup (Nodemailer)
 * ============================================================
 * Configures the SMTP transporter for sending notifications,
 * invite links, and OTP codes. Falls back to a mock logger
 * in development/testing if credentials are not provided.
 */

const nodemailer = require('nodemailer');
const logger = require('./logger');

const mailConfig = {
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || null,
    pass: process.env.SMTP_PASS || null,
  },
};

let transporter;

if (mailConfig.auth.user && mailConfig.auth.pass) {
  transporter = nodemailer.createTransport(mailConfig);
  logger.info('[Mailer] SMTP Transporter configured.');
} else {
  // Development / Test Mock Transporter
  transporter = {
    sendMail: async (options) => {
      logger.info('--- [Mailer Mock] Sending Email ---');
      logger.info(`To:      ${options.to}`);
      logger.info(`Subject: ${options.subject}`);
      logger.info(`Text:    ${options.text}`);
      if (options.html) {
        logger.info(`HTML:    ${options.html.substring(0, 200)}...`);
      }
      logger.info('------------------------------------');
      return { 
        messageId: `mock-msg-${Date.now()}`,
        envelope: { from: options.from, to: [options.to] },
        accepted: [options.to],
        rejected: []
      };
    }
  };
  logger.info('[Mailer] SMTP credentials missing. Configured logger mock transporter.');
}

module.exports = transporter;
