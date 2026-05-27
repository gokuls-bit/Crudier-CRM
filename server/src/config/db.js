/**
 * ============================================================
 * Crudier CRM — MongoDB Connection Utility
 * ============================================================
 * Uses the official `mongodb` driver (NOT Mongoose).
 * - Handles initial connection & automatic reconnection
 * - Logs connection lifecycle events
 * - Exports a reusable `getDb()` helper and raw `client`
 * ============================================================
 */

const { MongoClient } = require('mongodb');
const config = require('./index');

/** @type {MongoClient | null} */
let client = null;

/** @type {import('mongodb').Db | null} */
let db = null;

/** Track connectivity for the health endpoint */
let isConnected = false;

/**
 * Connect to MongoDB Atlas.
 * Retries up to `maxRetries` times with exponential back-off.
 *
 * @param {number} maxRetries  – number of retry attempts (default 5)
 * @param {number} baseDelay   – initial delay in ms (default 3 000)
 * @returns {Promise<import('mongodb').Db>}
 */
async function connectDB(maxRetries = 5, baseDelay = 3000) {
  if (db) return db;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[MongoDB] Connection attempt ${attempt}/${maxRetries} …`
      );

      client = new MongoClient(config.mongoUri, {
        // Recommended production options
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await client.connect();
      db = client.db(config.mongoDbName);

      // Verify the connection with a quick ping
      await db.command({ ping: 1 });
      isConnected = true;

      console.log(
        `[MongoDB] ✓ Connected to "${config.mongoDbName}" on Atlas`
      );

      // ── Lifecycle listeners ──────────────────────────────
      client.on('close', () => {
        isConnected = false;
        console.warn('[MongoDB] ✗ Connection closed');
      });

      client.on('reconnected', () => {
        isConnected = true;
        console.log('[MongoDB] ↻ Reconnected');
      });

      client.on('error', (err) => {
        isConnected = false;
        console.error('[MongoDB] Connection error:', err.message);
      });

      return db;
    } catch (err) {
      console.error(
        `[MongoDB] Attempt ${attempt} failed: ${err.message}`
      );

      if (attempt === maxRetries) {
        console.error('[MongoDB] All retry attempts exhausted. Exiting.');
        process.exit(1);
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`[MongoDB] Retrying in ${delay / 1000}s …`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Returns the active Db instance.
 * Throws if called before `connectDB()`.
 */
function getDb() {
  if (!db) {
    throw new Error(
      'Database not initialised. Call connectDB() first.'
    );
  }
  return db;
}

/**
 * Returns the raw MongoClient (useful for transactions).
 */
function getClient() {
  if (!client) {
    throw new Error(
      'MongoClient not initialised. Call connectDB() first.'
    );
  }
  return client;
}

/**
 * Returns true when the driver believes it is connected.
 */
function getConnectionStatus() {
  return isConnected;
}

/**
 * Gracefully close the connection (used during shutdown).
 */
async function closeDB() {
  if (client) {
    await client.close();
    isConnected = false;
    db = null;
    client = null;
    console.log('[MongoDB] Connection closed gracefully');
  }
}

module.exports = {
  connectDB,
  getDb,
  getClient,
  getConnectionStatus,
  closeDB,
};
