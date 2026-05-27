/**
 * ============================================================
 * Crudier CRM — Database Config Adapter
 * ============================================================
 * Redirects connection requests to the main global database
 * connection singleton in server/config/db.js to prevent
 * duplicate connection pools.
 */

const globalDb = require('../../config/db');

module.exports = globalDb;
