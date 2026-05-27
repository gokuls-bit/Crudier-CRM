/**
 * ============================================================
 * Crudier CRM — Timeout Middleware
 * ============================================================
 * Aborts requests and returns 503 Service Unavailable if they
 * exceed a specific processing threshold (default 15 seconds).
 */

const ApiError = require('../utils/apiError');

const timeout = (limitMs = 15000) => {
  return (req, res, next) => {
    // Set response timeout
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        next(new ApiError('Request timeout — the server took too long to respond.', 503));
      }
    }, limitMs);

    // Clear timeout timer when the request finishes successfully
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
};

module.exports = timeout;
