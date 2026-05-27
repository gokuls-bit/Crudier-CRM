/**
 * ============================================================
 * 404 — Not Found Handler
 * ============================================================
 * Placed AFTER all route definitions so any unmatched request
 * falls through here.
 * ============================================================
 */

const { AppError } = require('../utils/AppError');

const notFoundHandler = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

module.exports = { notFoundHandler };
