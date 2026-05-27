/**
 * ============================================================
 * Health Route
 * ============================================================
 * GET /api/v1/health
 * ============================================================
 */

const { Router } = require('express');
const { asyncWrapper } = require('../utils/asyncWrapper');
const { healthCheck } = require('../controllers/health.controller');

const router = Router();

router.get('/', asyncWrapper(healthCheck));

module.exports = router;
