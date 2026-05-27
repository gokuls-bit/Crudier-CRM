/**
 * ============================================================
 * Crudier CRM — Authentication Middleware
 * ============================================================
 */

const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const ApiError = require('../utils/apiError');
const asyncWrapper = require('../utils/asyncWrapper');
const authRepository = require('../modules/auth/auth.repository');

const protectRoute = asyncWrapper(async (req, res, next) => {
  let token = null;

  // 1. Extract from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. Fallback to cookies
  else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new ApiError('Access denied: Authentication token is missing.', 401));
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await authRepository.findById(decoded.id);

    if (!user) {
      return next(new ApiError('Authentication failed: User no longer exists.', 401));
    }

    if (!user.isActive) {
      return next(new ApiError('Authentication failed: User account is inactive.', 403));
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError('Authentication failed: Token has expired.', 401));
    }
    return next(new ApiError('Authentication failed: Invalid token.', 401));
  }
});

module.exports = {
  protectRoute,
};
