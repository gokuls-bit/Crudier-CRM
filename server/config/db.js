/**
 * ============================================================
 * Crudier CRM — Database Utility (Mongoose)
 * ============================================================
 * Configures the Mongoose connection to MongoDB Atlas,
 * offering auto-reconnect logic and exporting helper
 * methods to retrieve the raw database/client objects.
 */

const mongoose = require('mongoose');
const config = require('./env');
const logger = require('./logger');

let isConnected = false;

/**
 * Connect to MongoDB Atlas via Mongoose with exponential backoff retry.
 */
async function connectDB(maxRetries = 5, baseDelay = 3000) {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection.db;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`[MongoDB] Connection attempt ${attempt}/${maxRetries}...`);
      await mongoose.connect(config.mongoUri, {
        dbName: config.mongoDbName,
      });

      isConnected = true;
      logger.info(`[MongoDB] ✓ Connected to "${config.mongoDbName}" database.`);

      // Listen for connection status changes
      mongoose.connection.on('disconnected', () => {
        isConnected = false;
        logger.warn('[MongoDB] ✗ Connection disconnected.');
      });

      mongoose.connection.on('reconnected', () => {
        isConnected = true;
        logger.info('[MongoDB] ↻ Reconnected.');
      });

      mongoose.connection.on('error', (err) => {
        logger.error('[MongoDB] Connection error:', err);
      });

      return mongoose.connection.db;
    } catch (err) {
      logger.error(`[MongoDB] Attempt ${attempt} failed: ${err.message}`);
      if (attempt === maxRetries) {
        logger.error('[MongoDB] All retry attempts exhausted.');
        process.exit(1);
      }
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Get the active raw MongoDB database handle.
 */
function getDb() {
  if (!mongoose.connection || mongoose.connection.readyState !== 1) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return mongoose.connection.db;
}

/**
 * Get the active raw MongoClient.
 */
function getClient() {
  if (!mongoose.connection || mongoose.connection.readyState !== 1) {
    throw new Error('MongoClient not initialized. Call connectDB() first.');
  }
  return mongoose.connection.getClient();
}

/**
 * Check if the database is currently connected.
 */
function getConnectionStatus() {
  return mongoose.connection.readyState === 1;
}

/**
 * Close the Mongoose connection cleanly.
 */
async function closeDB() {
  if (mongoose.connection) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('[MongoDB] Connection closed.');
  }
}

module.exports = {
  connectDB,
  getDb,
  getClient,
  getConnectionStatus,
  closeDB,
};
