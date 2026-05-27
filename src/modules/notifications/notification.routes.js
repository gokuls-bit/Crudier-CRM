/**
 * ============================================================
 * Crudier CRM — Notification Routes
 * ============================================================
 */

const { Router } = require('express');
const notificationController = require('./notification.controller');
const { protectRoute } = require('../../middlewares/auth.middleware');
const asyncWrapper = require('../../utils/asyncWrapper');

const router = Router();

// Protect all routes
router.use(protectRoute);

// Bulk operations (must be placed before parameter routes)
router.get('/unread-count', asyncWrapper(notificationController.unreadCount));
router.patch('/read-all', asyncWrapper(notificationController.markAllRead));
router.delete('/clear-all', asyncWrapper(notificationController.clearAll));

// Individual CRUD
router.get('/', asyncWrapper(notificationController.list));
router.patch('/:id/read', asyncWrapper(notificationController.markRead));
router.delete('/:id', asyncWrapper(notificationController.delete));

module.exports = router;
