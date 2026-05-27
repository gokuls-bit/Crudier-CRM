/**
 * ============================================================
 * Centralized Error Handler Middleware
 * ============================================================
 * This is the LAST middleware in the Express pipeline.
 * It catches every error (thrown or passed via next(err)) and
 * returns a consistent JSON envelope.
 *
 * Response shape:
 * {
 *   "success": false,
 *   "status":  "fail" | "error",
 *   "message": "Human-readable description",
 *   "stack":   "…"  // only in development
 * }
 * ============================================================
 */

const config = require('../config');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Default to 500 if no statusCode was set
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const response = {
    success: false,
    status: err.status,
    message: err.message || 'Internal Server Error',
  };

  // Include stack trace only in development
  if (config.nodeEnv === 'development') {
    response.stack = err.stack;
  }

  // Log the error for server-side observability
  console.error(`[Error] ${err.statusCode} — ${err.message}`);
  if (config.nodeEnv === 'development') {
    console.error(err.stack);
  }

  res.status(err.statusCode).json(response);
};

module.exports = { errorHandler };
