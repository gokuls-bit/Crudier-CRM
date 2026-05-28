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

  const fs = require('fs');
  const path = require('path');
  const logDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const errorLogStream = fs.createWriteStream(path.join(logDir, 'error.log'), { flags: 'a' });

  // Log error message to file
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [Error] ${err.statusCode} - ${message}\n${err.stack || ''}\n\n`;
  errorLogStream.write(logMessage);

  // Log error message to console
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
