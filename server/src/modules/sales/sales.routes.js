/**
 * ============================================================
 * Crudier CRM — Sales Routes
 * ============================================================
 */

const { Router } = require('express');
const salesController = require('./sales.controller');
const { protectRoute } = require('../../middlewares/auth.middleware');
const authorizeRoles = require('../../middlewares/rbac.middleware');
const validate = require('../../middlewares/validate.middleware');
const asyncWrapper = require('../../utils/asyncWrapper');

const router = Router();

// Validation Rules
const createValidation = validate({
  body: {
    companyName: (val) => (val && val.trim().length > 0) || 'Company name is required.',
    contactPerson: (val) => (val && val.trim().length > 0) || 'Contact person is required.',
  },
});

const noteValidation = validate({
  body: {
    text: (val) => (val && val.trim().length > 0) || 'Note text cannot be empty.',
  },
});

const statusValidation = validate({
  body: {
    status: (val) => (val && ['New Lead', 'Contacted', 'Meeting Scheduled', 'Negotiation', 'Closed Won', 'Closed Lost'].includes(val)) || 'Invalid lead status.',
  },
});

// Protect all routes + Restrict to Sales role and above
router.use(protectRoute);
router.use(authorizeRoles('Founder', 'Admin', 'Team Lead', 'Sales'));

// Pipeline, Analytics, and Follow-ups (placed before parameter routes)
router.get('/pipeline', asyncWrapper(salesController.pipeline));
router.get('/analytics', asyncWrapper(salesController.analytics));
router.get('/follow-ups', asyncWrapper(salesController.followUps));

// Lead CRUD
router.post('/leads', createValidation, asyncWrapper(salesController.createLead));
router.get('/leads', asyncWrapper(salesController.listLeads));
router.get('/leads/:id', asyncWrapper(salesController.getById));
router.patch('/leads/:id', asyncWrapper(salesController.updateLead));
router.delete('/leads/:id', authorizeRoles('Founder', 'Admin'), asyncWrapper(salesController.deleteLead));

// Status & Notes
router.patch('/leads/:id/status', statusValidation, asyncWrapper(salesController.updateStatus));
router.post('/leads/:id/notes', noteValidation, asyncWrapper(salesController.addNote));

module.exports = router;
