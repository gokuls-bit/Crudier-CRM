/**
 * ============================================================
 * Crudier CRM — Environment Variables
 * ============================================================
 * Validates and exports all env vars for the application.
 * ============================================================
 */

require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  mongoDbName: process.env.MONGO_DB_NAME || 'crudier',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_replace_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_replace_in_production',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000'],
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  rateLimitWindowMin: parseInt(process.env.RATE_LIMIT_WINDOW_MIN, 10) || 15,
};

// Simple validations
if (!config.mongoUri) {
  console.warn('[Warning] MONGO_URI environment variable is missing.');
}

module.exports = config;
