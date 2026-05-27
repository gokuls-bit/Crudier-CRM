/**
 * ============================================================
 * Crudier CRM — Request Logger Middleware
 * ============================================================
 * Intercepts incoming HTTP requests and logs their execution time,
 * client IP, HTTP verbs, routes, and final status codes via Winston.
 */

const logger = require('../../config/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ip: req.ip || req.connection.remoteAddress,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent') || '',
    };

    const message = `HTTP ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`;

    if (res.statusCode >= 500) {
      logger.error(message, logData);
    } else if (res.statusCode >= 400) {
      logger.warn(message, logData);
    } else {
      logger.info(message, logData);
    }
  });

  next();
};

module.exports = requestLogger;
