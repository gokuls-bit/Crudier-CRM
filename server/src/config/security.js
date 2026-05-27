/**
 * ============================================================
 * Crudier CRM — Security Configuration
 * ============================================================
 * Configures variables for network security, password rules,
 * rate limit boundaries, and token issuer definitions.
 */

const env = require('./index');

module.exports = {
  cors: {
    origin: env.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  },
  rateLimit: {
    maxRequests: env.rateLimitMax,
    windowMinutes: env.rateLimitWindowMin,
    message: 'Too many requests from this IP. Please try again later.',
  },
  tokens: {
    accessExpiry: env.jwtExpiresIn,
    refreshExpiry: env.jwtRefreshExpiresIn,
    issuer: 'crudier-crm-authority',
  },
  passwordPolicy: {
    minLength: 6,
    requireNumbers: true,
    requireSpecialChars: false,
  },
};
