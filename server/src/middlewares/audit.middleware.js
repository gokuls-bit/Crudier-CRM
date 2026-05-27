/**
 * ============================================================
 * Crudier CRM — Audit Logger Middleware
 * ============================================================
 * Intercepts successful requests (2xx status codes) to log action
 * names, target payloads, client IP, and UA metadata to the AuditLog collection.
 */

const AuditLog = require('../models/auditLog.model');

const audit = (actionName) => {
  return (req, res, next) => {
    res.on('finish', async () => {
      // Only audit successful operations to keep logs clean
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const userId = req.user ? req.user._id : null;
          const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
          const userAgent = req.get('user-agent') || '';

          // Avoid logging passwords or tokens
          const cleanBody = req.body ? { ...req.body } : {};
          if (cleanBody.password) cleanBody.password = '[REDACTED]';
          if (cleanBody.token) cleanBody.token = '[REDACTED]';

          await AuditLog.create({
            userId,
            action: actionName,
            ipAddress,
            userAgent,
            details: {
              method: req.method,
              url: req.originalUrl,
              params: req.params,
              query: req.query,
              body: cleanBody,
            },
          });
        } catch (err) {
          // Fail-safe: log locally to ensure the user request completes even if logging fails
          console.error('[AuditLog] Failed to record audit log:', err.message);
        }
      }
    });
    next();
  };
};

module.exports = audit;
