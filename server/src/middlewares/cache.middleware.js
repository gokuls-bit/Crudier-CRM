/**
 * ============================================================
 * Crudier CRM — Redis Cache Middleware
 * ============================================================
 * Stores GET responses in Redis for a configurable duration.
 * Automatically bypasses cache if Redis is down or unavailable.
 */

const redisClient = require('../../config/redis');
const logger = require('../../config/logger');

const cache = (ttlSeconds = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache if Redis client is not initialized or connected
    if (!redisClient || !redisClient.isOpen) {
      return next();
    }

    // Key format incorporates user identity (if logged in) to prevent cross-user leak
    const userId = req.user ? req.user._id || req.user.id : 'anonymous';
    const key = `crudier:cache:${userId}:${req.originalUrl}`;

    try {
      const data = await redisClient.get(key);
      if (data) {
        logger.info(`[Cache] GET Hit: ${key}`);
        return res.status(200).json(JSON.parse(data));
      }

      // Intercept response write to cache it
      const originalJson = res.json;
      res.json = function (body) {
        res.json = originalJson;

        // Cache only successful operations
        if (res.statusCode >= 200 && res.statusCode < 300 && redisClient.isOpen) {
          redisClient.setEx(key, ttlSeconds, JSON.stringify(body))
            .catch((err) => logger.error(`[Cache] Failed to store key ${key}:`, err));
        }

        return res.json(body);
      };

      next();
    } catch (err) {
      logger.error(`[Cache] Error processing key ${key}:`, err);
      next();
    }
  };
};

module.exports = cache;
