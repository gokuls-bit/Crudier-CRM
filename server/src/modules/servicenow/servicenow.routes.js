/**
 * ============================================================
 * Crudier CRM — ServiceNow Router
 * ============================================================
 */

const { Router } = require('express');
const servicenowController = require('./servicenow.controller');
const { protectRoute } = require('../../middlewares/auth.middleware');
const authorizeRoles = require('../../middlewares/rbac.middleware');
const asyncWrapper = require('../../utils/asyncWrapper');

const router = Router();

// Gated behind full authentication sessions
router.use(protectRoute);

// Unified global search
router.get('/search', asyncWrapper(servicenowController.search));

// Workflow visual builder
router.get('/workflows', asyncWrapper(servicenowController.getWorkflows));
router.post('/workflows', asyncWrapper(servicenowController.createWorkflow));
router.get('/workflows/runs', asyncWrapper(servicenowController.getWorkflowRuns));
router.post('/workflows/runs', asyncWrapper(servicenowController.runWorkflow));

// Custom Form Layout customization
router.get('/forms', asyncWrapper(servicenowController.getForms));
router.post('/forms/:module', asyncWrapper(servicenowController.saveForm));

// SLA Management definitions
router.get('/slas', asyncWrapper(servicenowController.getSLAs));
router.post('/slas', asyncWrapper(servicenowController.saveSLA));

// Approvals Engine inbox
router.get('/approvals', asyncWrapper(servicenowController.getApprovals));
router.post('/approvals', asyncWrapper(servicenowController.createApproval));
router.post('/approvals/:id/decide', asyncWrapper(servicenowController.decideApproval));

// Incident Management tickets queue
router.get('/incidents', asyncWrapper(servicenowController.getIncidents));
router.get('/incidents/:id', asyncWrapper(servicenowController.getIncidentById));
router.post('/incidents', asyncWrapper(servicenowController.createIncident));
router.patch('/incidents/:id', asyncWrapper(servicenowController.updateIncident));

// Knowledge Base articles library
router.get('/knowledge', asyncWrapper(servicenowController.getArticles));
router.get('/knowledge/:slug', asyncWrapper(servicenowController.getArticle));
router.post('/knowledge', asyncWrapper(servicenowController.createArticle));
router.patch('/knowledge/:id', asyncWrapper(servicenowController.updateArticle));
router.post('/knowledge/:id/rate', asyncWrapper(servicenowController.rateArticle));

// Change Request records
router.get('/changes', asyncWrapper(servicenowController.getChanges));
router.post('/changes', asyncWrapper(servicenowController.createChange));
router.patch('/changes/:id/status', asyncWrapper(servicenowController.updateChangeStatus));

// Service Catalog procurement
router.get('/catalog', asyncWrapper(servicenowController.getCatalogItems));
router.post('/catalog/request', asyncWrapper(servicenowController.requestCatalogItem));
router.get('/catalog/requests', asyncWrapper(servicenowController.getCatalogRequests));

// Reports metrics dashboards
router.get('/reports', asyncWrapper(servicenowController.getReports));
router.post('/reports', asyncWrapper(servicenowController.saveReport));

// Core Audit Logging (Restricted strictly to Workspace Founder & Administrators)
router.get('/audit', authorizeRoles('Founder', 'Admin'), asyncWrapper(servicenowController.getAuditLogs));

module.exports = router;
