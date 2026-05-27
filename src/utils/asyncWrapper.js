/**
 * ============================================================
 * asyncWrapper — eliminates repetitive try/catch in controllers
 * ============================================================
 * Wrap any async route handler so rejected promises are
 * forwarded to Express's centralized error handler.
 *
 * Usage:
 *   const { asyncWrapper } = require('../utils/asyncWrapper');
 *   router.get('/items', asyncWrapper(async (req, res) => { … }));
 * ============================================================
 */

const asyncWrapper = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncWrapper };
