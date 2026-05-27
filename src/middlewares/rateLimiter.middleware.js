/**
 * ============================================================
 * Crudier CRM — Rate Limiter Middleware
 * ============================================================
 */

const rateLimit = require('express-rate-limit');
const env = require('../../config/env');

const globalRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMin * 60 * 1000,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: 'fail',
    message: 'Too many requests — please try again later.',
  },
});

module.exports = {
  globalRateLimiter,
};
