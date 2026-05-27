/**
 * ============================================================
 * Crudier CRM — Role-Based Access Control Middleware
 * ============================================================
 */

const ApiError = require('../utils/apiError');

/**
 * Factory middleware to authorize users based on their roles.
 * 
 * Allowed roles: Founder, Admin, Team Lead, Developer, Designer, Sales, Intern
 * 
 * @param {...string} roles - Approved roles for the route
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError('Access denied: User is not authenticated.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError('Access denied: You do not have permission to perform this action.', 403));
    }

    next();
  };
};

module.exports = authorizeRoles;
