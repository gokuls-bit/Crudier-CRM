/**
 * ============================================================
 * Crudier CRM — Redis Client configuration
 * ============================================================
 */

const { createClient } = require('redis');
const logger = require('./logger');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisClient = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      // Reconnect strategy: exponential delay up to 3000ms
      const delay = Math.min(retries * 50, 3000);
      logger.warn(`[Redis] Connection failed. Retrying in ${delay}ms...`);
      return delay;
    }
  }
});

redisClient.on('connect', () => logger.info('[Redis] Connecting...'));
redisClient.on('ready', () => logger.info('[Redis] ✓ Client connected and ready.'));
redisClient.on('error', (err) => logger.error('[Redis] Client Error:', err));
redisClient.on('end', () => logger.warn('[Redis] Connection closed.'));

// Async self-connect block
(async () => {
  try {
    // In test environments we can mock or choose not to connect automatically
    if (process.env.NODE_ENV !== 'test') {
      await redisClient.connect();
    }
  } catch (err) {
    logger.error('[Redis] Connection failed to establish:', err);
  }
})();

module.exports = redisClient;
