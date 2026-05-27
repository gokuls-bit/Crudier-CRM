/**
 * ============================================================
 * Crudier CRM — Analytics Routes
 * ============================================================
 */

const { Router } = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { protectRoute } = require('../middlewares/auth.middleware');
const asyncWrapper = require('../utils/asyncWrapper');

const router = Router();

// Protect all routes globally
router.use(protectRoute);

router.get('/dashboard', asyncWrapper(analyticsController.getWorkspaceDashboardStats));

module.exports = router;
