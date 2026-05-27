/**
 * ============================================================
 * Health Controller
 * ============================================================
 * Returns server status, uptime, and DB connectivity.
 * ============================================================
 */

const { getConnectionStatus } = require('../config/db');

const healthCheck = async (_req, res) => {
  const dbConnected = getConnectionStatus();

  res.status(200).json({
    success: true,
    status: 'ok',
    data: {
      service: 'crudier-crm-api',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        status: dbConnected ? 'healthy' : 'disconnected',
      },
      memory: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      },
    },
  });
};

module.exports = { healthCheck };
