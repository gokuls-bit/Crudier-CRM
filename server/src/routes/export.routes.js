/**
 * ============================================================
 * Crudier CRM — Exporter Routes
 * ============================================================
 */

const { Router } = require('express');
const exportController = require('../controllers/export.controller');
const { protectRoute } = require('../middlewares/auth.middleware');
const asyncWrapper = require('../utils/asyncWrapper');

const router = Router();

// Protect all routes globally
router.use(protectRoute);

router.get('/tasks', asyncWrapper(exportController.exportTasks));
router.get('/leads', asyncWrapper(exportController.exportLeads));

module.exports = router;
