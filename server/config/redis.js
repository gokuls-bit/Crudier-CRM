/**
 * ============================================================
 * Crudier CRM — Mock Redis Client (Redis Removed)
 * ============================================================
 */

const logger = require('./logger');

// Completely mock the Redis client to run in offline standalone mode
const redisClient = {
  isOpen: false,
  connect: async () => {
    logger.info('[Redis] Running in standalone mode (Redis bypassed).');
  },
  disconnect: async () => {},
  on: (event, handler) => {},
  get: async () => null,
  set: async () => null,
  setEx: async () => null,
  publish: async () => null,
  duplicate: () => redisClient,
};

// Auto-run mock initialization message
(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;
