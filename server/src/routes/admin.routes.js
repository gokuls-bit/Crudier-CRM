/**
 * ============================================================
 * Crudier CRM — Admin Routes
 * ============================================================
 */

const { Router } = require('express');
const adminController = require('../controllers/admin.controller');
const { protectRoute } = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/rbac.middleware');
const asyncWrapper = require('../utils/asyncWrapper');

const router = Router();

// Protect all routes globally and restrict access to Founders or Admins only
router.use(protectRoute);
router.use(authorizeRoles('Founder', 'Admin'));

router.get('/stats', asyncWrapper(adminController.getSystemStats));
router.get('/audit-logs', asyncWrapper(adminController.getAuditLogs));
router.patch('/users/:userId/status', asyncWrapper(adminController.manageUserStatus));
router.get('/workspaces', asyncWrapper(adminController.listAllWorkspaces));

module.exports = router;
