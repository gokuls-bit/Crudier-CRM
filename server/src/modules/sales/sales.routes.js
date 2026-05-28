/**
 * ============================================================
 * Crudier CRM — Sales & Salesforce Routes
 * ============================================================
 */

const { Router } = require('express');
const salesController = require('./sales.controller');
const salesforceController = require('./salesforce.controller');
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

// ==========================================
// PUBLIC UNPROTECTED ROUTES
// ==========================================
router.get('/emails/track/:pixelId', asyncWrapper(salesforceController.trackPixel));

// ==========================================
// PROTECTED ROUTES (Sales role & above)
// ==========================================
router.use(protectRoute);
router.use(authorizeRoles('Founder', 'Admin', 'Team Lead', 'Sales'));

// Pipeline, Analytics, and Follow-ups
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

// Salesforce Accounts
router.post('/accounts', asyncWrapper(salesforceController.createAccount));
router.get('/accounts', asyncWrapper(salesforceController.listAccounts));
router.get('/accounts/:id', asyncWrapper(salesforceController.getAccountById));
router.patch('/accounts/:id', asyncWrapper(salesforceController.updateAccount));
router.delete('/accounts/:id', asyncWrapper(salesforceController.deleteAccount));

// Salesforce Contacts
router.post('/contacts', asyncWrapper(salesforceController.createContact));
router.get('/contacts', asyncWrapper(salesforceController.listContacts));
router.post('/contacts/merge', asyncWrapper(salesforceController.mergeContacts));
router.post('/leads/:id/convert', asyncWrapper(salesforceController.convertLead));
router.get('/contacts/:id', asyncWrapper(salesforceController.getContactById));
router.patch('/contacts/:id', asyncWrapper(salesforceController.updateContact));
router.delete('/contacts/:id', asyncWrapper(salesforceController.deleteContact));

// Salesforce Opportunities
router.post('/opportunities', asyncWrapper(salesforceController.createOpportunity));
router.get('/opportunities', asyncWrapper(salesforceController.listOpportunities));
router.get('/opportunities/:id', asyncWrapper(salesforceController.getOpportunityById));
router.patch('/opportunities/:id', asyncWrapper(salesforceController.updateOpportunity));
router.delete('/opportunities/:id', asyncWrapper(salesforceController.deleteOpportunity));
router.post('/opportunities/:id/products', asyncWrapper(salesforceController.addOpportunityProduct));
router.delete('/opportunities/:id/products/:lineItemId', asyncWrapper(salesforceController.removeOpportunityProduct));
router.get('/opportunities/:id/quote', asyncWrapper(salesforceController.getOpportunityQuote));

// Salesforce Forecasting
router.get('/forecasts', asyncWrapper(salesforceController.getForecasts));
router.post('/quotas', asyncWrapper(salesforceController.updateQuota));

// Salesforce Cases
router.post('/cases', asyncWrapper(salesforceController.createCase));
router.get('/cases', asyncWrapper(salesforceController.listCases));
router.post('/cases/merge', asyncWrapper(salesforceController.mergeCases));
router.post('/cases/webhook', asyncWrapper(salesforceController.processWebhook));
router.get('/cases/:id', asyncWrapper(salesforceController.getCaseById));
router.patch('/cases/:id', asyncWrapper(salesforceController.updateCase));
router.delete('/cases/:id', asyncWrapper(salesforceController.deleteCase));

// Salesforce Products & Price Books
router.post('/products', asyncWrapper(salesforceController.createProduct));
router.get('/products', asyncWrapper(salesforceController.listProducts));
router.post('/pricebooks', asyncWrapper(salesforceController.createPriceBook));
router.get('/pricebooks', asyncWrapper(salesforceController.listPriceBooks));

// Salesforce Territories
router.post('/territories', asyncWrapper(salesforceController.createTerritory));
router.get('/territories', asyncWrapper(salesforceController.listTerritories));

// Salesforce Emails
router.post('/emails/send', asyncWrapper(salesforceController.sendEmail));
router.post('/emails/templates', asyncWrapper(salesforceController.createTemplate));
router.get('/emails/templates', asyncWrapper(salesforceController.listTemplates));

module.exports = router;
