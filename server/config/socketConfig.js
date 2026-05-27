/**
 * ============================================================
 * Crudier CRM — Socket.IO Transport Configuration
 * ============================================================
 */

const env = require('./env');

const socketConfig = {
  cors: {
    origin: env.corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
};

module.exports = socketConfig;
