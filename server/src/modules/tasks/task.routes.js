/**
 * ============================================================
 * Crudier CRM — Task Routes
 * ============================================================
 */

const { Router } = require('express');
const taskController = require('./task.controller');
const { protectRoute } = require('../../middlewares/auth.middleware');
const authorizeRoles = require('../../middlewares/rbac.middleware');
const upload = require('../../middlewares/upload.middleware');
const validate = require('../../middlewares/validate.middleware');
const asyncWrapper = require('../../utils/asyncWrapper');

const router = Router();

// Validation Rules
const createValidation = validate({
  body: {
    title: (val) => (val && val.trim().length > 0) || 'Task title is required.',
    priority: (val) => (!val || ['Low', 'Medium', 'High', 'Critical'].includes(val)) || 'Invalid priority.',
  },
});

const commentValidation = validate({
  body: {
    text: (val) => (val && val.trim().length > 0) || 'Comment text cannot be empty.',
  },
});

const statusValidation = validate({
  body: {
    status: (val) => (val && ['Pending', 'In Progress', 'Submitted', 'Review', 'Approved', 'Rejected', 'Blocked'].includes(val)) || 'Invalid task status.',
  },
});

// Protect all routes
router.use(protectRoute);

// Task CRUD
router.post('/', createValidation, asyncWrapper(taskController.create));
router.get('/', asyncWrapper(taskController.list));
router.get('/:id', asyncWrapper(taskController.getById));
router.patch('/:id', asyncWrapper(taskController.update));
router.delete('/:id', authorizeRoles('Founder', 'Admin'), asyncWrapper(taskController.delete));

// Status & History
router.patch('/:id/status', statusValidation, asyncWrapper(taskController.updateStatus));
router.get('/:id/history', asyncWrapper(taskController.getHistory));

// Comments
router.post('/:id/comments', commentValidation, asyncWrapper(taskController.addComment));
router.delete('/:id/comments/:cid', asyncWrapper(taskController.deleteComment));

// Attachments (Multer)
router.post('/:id/attachments', upload.single('attachment'), asyncWrapper(taskController.uploadAttachment));

module.exports = router;
