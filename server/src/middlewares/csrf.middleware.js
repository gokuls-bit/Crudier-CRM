/**
 * ============================================================
 * Crudier CRM — CSRF Protection Middleware
 * ============================================================
 * Protects mutation endpoints (POST, PUT, PATCH, DELETE) by enforcing
 * Double-Submit Cookie validation of the X-CSRF-Token header.
 */

const crypto = require('crypto');
const ApiError = require('../utils/apiError');

const csrf = (req, res, next) => {
  // 1. If CSRF cookie doesn't exist, generate and set it (httpOnly: false so client JS can read it)
  if (!req.cookies || !req.cookies['x-csrf-token']) {
    const csrfToken = crypto.randomBytes(24).toString('hex');
    res.cookie('x-csrf-token', csrfToken, {
      httpOnly: false, // Must be readable by client JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    // Inject into req.cookies so that subsequent handlers or validations in this request can see it
    req.cookies = req.cookies || {};
    req.cookies['x-csrf-token'] = csrfToken;
  }

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
