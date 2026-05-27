/**
 * ============================================================
 * Crudier CRM — CSRF Protection Middleware
 * ============================================================
 * Protects mutation endpoints (POST, PUT, PATCH, DELETE) by enforcing
 * Double-Submit Cookie validation of the X-CSRF-Token header.
 */

const ApiError = require('../utils/apiError');

const csrf = (req, res, next) => {
  // Safe HTTP verbs do not alter database state and do not require verification
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Allow bypassing CSRF during test environments
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const tokenFromCookie = req.cookies ? req.cookies['x-csrf-token'] : null;
  const tokenFromHeader = req.headers['x-csrf-token'];

  if (!tokenFromCookie || !tokenFromHeader || tokenFromCookie !== tokenFromHeader) {
    return next(new ApiError('CSRF validation failed: Missing or mismatched token.', 403));
  }

  next();
};

module.exports = csrf;
