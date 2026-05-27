/**
 * ============================================================
 * Crudier CRM — Notes Routes
 * ============================================================
 */

const { Router } = require('express');
const notesController = require('./notes.controller');
const { protectRoute } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const asyncWrapper = require('../../utils/asyncWrapper');

const router = Router();

// Validation Rules
const createValidation = validate({
  body: {
    title: (val) => (val && val.trim().length > 0) || 'Note title is required.',
    visibility: (val) => (!val || ['private', 'workspace', 'team'].includes(val)) || 'Invalid visibility mode.',
  },
});

const commentValidation = validate({
  body: {
    text: (val) => (val && val.trim().length > 0) || 'Comment text cannot be empty.',
  },
});

// Protect all routes
router.use(protectRoute);

// Text search (placed before GET /:id so it matches first)
router.get('/search', asyncWrapper(notesController.search));

// Notes CRUD
router.post('/', createValidation, asyncWrapper(notesController.create));
router.get('/', asyncWrapper(notesController.list));
router.get('/:id', asyncWrapper(notesController.getById));
router.patch('/:id', asyncWrapper(notesController.update));
router.delete('/:id', asyncWrapper(notesController.delete));

// Archive / Restore
router.post('/:id/archive', asyncWrapper(notesController.archive));
router.post('/:id/restore', asyncWrapper(notesController.restore));

// Comments
router.post('/:id/comments', commentValidation, asyncWrapper(notesController.addComment));
router.delete('/:id/comments/:cid', asyncWrapper(notesController.deleteComment));

module.exports = router;
