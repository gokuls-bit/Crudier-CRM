/**
 * ============================================================
 * Crudier CRM — Socket.IO Redis Clustering Sync Adapter
 * ============================================================
 * Synchronizes websocket events across multiple server processes
 * using native Redis Pub/Sub commands.
 */

const redisClient = require('../../config/redis');
const logger = require('../../config/logger');

let subClient = null;
const CHANNEL_NAME = 'crudier:socket:sync';

/**
 * Initialize clustering listeners for Socket.IO.
 * @param {Object} io – Socket.IO Server Instance
 */
const initSocketRedis = async (io) => {
  // If Redis is not running/available, bypass clustering sync
  if (!redisClient || !redisClient.isOpen) {
    logger.warn('[Socket Redis] Redis is offline. Running socket server in standalone mode.');
    return;
  }

  try {
    // Redis v4 client requires duplicating the client for subscription states
    subClient = redisClient.duplicate();
    await subClient.connect();
    
    logger.info('[Socket Redis] ✓ Sync subscriber client connected.');

    await subClient.subscribe(CHANNEL_NAME, (message) => {
      try {
        const { event, room, payload } = JSON.parse(message);
        logger.debug(`[Socket Redis] Syncing event "${event}" to local room "${room || 'all'}"`);
        
        if (room) {
          io.to(room).emit(event, payload);
        } else {
          io.emit(event, payload);
        }
      } catch (err) {
        logger.error('[Socket Redis] Failed to parse sync message payload:', err);
      }
    });
  } catch (err) {
    logger.error('[Socket Redis] Failed to initialize clustering sync adapter:', err);
  }
};

/**
 * Publish websocket event to Redis channel for multi-server synchronization.
 * @param {string} room – socket room name (can be null for global broadcast)
 * @param {string} event – socket event name
 * @param {Object} payload – message payload data
 */
const publishEvent = async (room, event, payload) => {
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.publish(
        CHANNEL_NAME,
        JSON.stringify({ room, event, payload })
      );
    } catch (err) {
      logger.error('[Socket Redis] Failed to publish socket event to cluster:', err.message);
    }
  }
};

module.exports = {
  initSocketRedis,
  publishEvent,
};
