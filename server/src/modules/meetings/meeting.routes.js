/**
 * ============================================================
 * Crudier CRM — Meeting Routes
 * ============================================================
 */

const { Router } = require('express');
const meetingController = require('./meeting.controller');
const { protectRoute } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const asyncWrapper = require('../../utils/asyncWrapper');

const router = Router();

// Validation Rules
const createValidation = validate({
  body: {
    title: (val) => (val && val.trim().length > 0) || 'Meeting title is required.',
    startTime: (val) => (val && val.trim().length > 0) || 'Start time is required.',
    endTime: (val) => (val && val.trim().length > 0) || 'End time is required.',
  },
});

const rsvpValidation = validate({
  body: {
    status: (val) => (val && ['Pending', 'Accepted', 'Declined', 'Tentative'].includes(val)) || 'Invalid RSVP status.',
  },
});

const notesValidation = validate({
  body: {
    notes: (val) => (val && val.trim().length > 0) || 'Notes content cannot be empty.',
  },
});

// Protect all routes
router.use(protectRoute);

// Upcoming (must be placed before GET /:id)
router.get('/upcoming', asyncWrapper(meetingController.upcoming));

// Meeting CRUD
router.post('/', createValidation, asyncWrapper(meetingController.create));
router.get('/', asyncWrapper(meetingController.list));
router.get('/:id', asyncWrapper(meetingController.getById));
router.patch('/:id', asyncWrapper(meetingController.update));
router.delete('/:id', asyncWrapper(meetingController.cancel)); // cancels meeting (DELETE is soft cancellation)

// RSVP & Notes
router.post('/:id/rsvp', rsvpValidation, asyncWrapper(meetingController.rsvp));
router.post('/:id/notes', notesValidation, asyncWrapper(meetingController.notes));
router.get('/:id/attendance', asyncWrapper(meetingController.attendance));

module.exports = router;
