/**
 * ============================================================
 * Crudier CRM — MongoDB Connection Utility
 * ============================================================
 * Reusable DB client using raw driver.
 * ============================================================
 */

const { MongoClient } = require('mongodb');
const config = require('./env');

/** @type {MongoClient | null} */
let client = null;
/** @type {import('mongodb').Db | null} */
let db = null;
let isConnected = false;

async function connectDB(maxRetries = 5, baseDelay = 3000) {
  if (db) return db;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[MongoDB] Connection attempt ${attempt}/${maxRetries}...`);
      client = new MongoClient(config.mongoUri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await client.connect();
      db = client.db(config.mongoDbName);
      
      // Ping check
      await db.command({ ping: 1 });
      isConnected = true;
      console.log(`[MongoDB] ✓ Connected to "${config.mongoDbName}" database.`);

      client.on('close', () => {
        isConnected = false;
        console.warn('[MongoDB] ✗ Connection closed');
      });

      client.on('reconnected', () => {
        isConnected = true;
        console.log('[MongoDB] ↻ Reconnected');
      });

      return db;
    } catch (err) {
      console.error(`[MongoDB] Attempt ${attempt} failed: ${err.message}`);
      if (attempt === maxRetries) {
        console.error('[MongoDB] All retry attempts exhausted.');
        process.exit(1);
      }
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

function getDb() {
  if (!db) throw new Error('Database not initialized. Call connectDB() first.');
  return db;
}

function getClient() {
  if (!client) throw new Error('MongoClient not initialized. Call connectDB() first.');
  return client;
}

function getConnectionStatus() {
  return isConnected;
}

async function closeDB() {
  if (client) {
    await client.close();
    isConnected = false;
    db = null;
    client = null;
    console.log('[MongoDB] Connection closed.');
  }
}

module.exports = {
  connectDB,
  getDb,
  getClient,
  getConnectionStatus,
  closeDB,
};
