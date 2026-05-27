/**
 * ============================================================
 * AppError — custom operational error class
 * ============================================================
 * Throw an AppError anywhere in your controllers/services and
 * the centralized error handler will serialise it into a clean
 * JSON response with the correct HTTP status code.
 *
 * Usage:
 *   throw new AppError('Resource not found', 404);
 * ============================================================
 */

class AppError extends Error {
  /**
   * @param {string} message  – human-readable error description
   * @param {number} statusCode – HTTP status code (default 500)
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Capture a clean stack trace (omits the constructor frame)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { AppError };
