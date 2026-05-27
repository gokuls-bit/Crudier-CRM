/**
 * ============================================================
 * Crudier CRM — Error Middleware
 * ============================================================
 */

const env = require('../../config/env');
const ApiResponse = require('../utils/apiResponse');

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const message = err.message || 'Internal Server Error';
  const responseData = {};

  if (env.nodeEnv === 'development') {
    responseData.stack = err.stack;
  }

  // Log error message
  console.error(`[Error] ${err.statusCode} - ${message}`);
  if (env.nodeEnv === 'development' && err.stack) {
    console.error(err.stack);
  }

  return res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message,
    ...responseData,
  });
};

module.exports = errorMiddleware;
