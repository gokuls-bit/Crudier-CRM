/**
 * ============================================================
 * Crudier CRM — CORS Options
 * ============================================================
 */

const config = require('./env');

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (like curl, postman, server-to-server)
    if (!origin || config.corsOrigin.indexOf(origin) !== -1 || config.corsOrigin.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = corsOptions;
