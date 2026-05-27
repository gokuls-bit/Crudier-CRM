/**
 * ============================================================
 * Crudier CRM — Configuration Index
 * ============================================================
 * Central place to read and export validated environment vars.
 * Every module should import config values from here instead
 * of calling process.env directly.
 * ============================================================
 */

require('dotenv').config();

const config = {
  // ── Server ──────────────────────────────────────────────
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // ── MongoDB ─────────────────────────────────────────────
  mongoUri: process.env.MONGO_URI,
  mongoDbName: process.env.MONGO_DB_NAME || 'crudier',

  // ── JWT ─────────────────────────────────────────────────
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // ── CORS ────────────────────────────────────────────────
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000'],

  // ── Rate Limiting ───────────────────────────────────────
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  rateLimitWindowMin: parseInt(process.env.RATE_LIMIT_WINDOW_MIN, 10) || 15,
};

module.exports = config;
