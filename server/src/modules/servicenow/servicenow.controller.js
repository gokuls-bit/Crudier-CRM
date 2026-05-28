/**
 * ============================================================
 * Crudier CRM — ServiceNow Module Controller
 * ============================================================
 */

const servicenowRepository = require('./servicenow.repository');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');

const servicenowController = {
  /**
   * Global Search
   */
  search: async (req, res) => {
    const { q } = req.query;
    if (!q) {
      throw new ApiError('Search query parameter q is required.', 400);
    }
    const results = await servicenowRepository.searchEverything(q);
    return ApiResponse.success(res, 'Search completed.', results);
  },

  /**
   * Workflows
   */
  getWorkflows: async (req, res) => {
    const workflows = await servicenowRepository.getWorkflows();
    return ApiResponse.success(res, 'Workflows fetched.', workflows);
  },

  createWorkflow: async (req, res) => {
    const wf = await servicenowRepository.createWorkflow(req.body);
    await servicenowRepository.writeAuditLog(req.user?._id, 'Workflow Created', { workflowId: wf._id, name: wf.name });
    return ApiResponse.success(res, 'Workflow created.', wf, 201);
  },

  getWorkflowRuns: async (req, res) => {
    const runs = await servicenowRepository.getWorkflowRuns();
    return ApiResponse.success(res, 'Workflow runs fetched.', runs);
  },

  runWorkflow: async (req, res) => {
    const run = await servicenowRepository.createWorkflowRun(req.body);
    await servicenowRepository.writeAuditLog(req.user?._id, 'Workflow Triggered', { workflowId: req.body.workflowId, runState: req.body.status });
    return ApiResponse.success(res, 'Workflow executed.', run);
  },

  /**
   * Form Customization
   */
  getForms: async (req, res) => {
    const definitions = await servicenowRepository.getFormDefinitions();
    return ApiResponse.success(res, 'Form definitions fetched.', definitions);
  },

  saveForm: async (req, res) => {
    const { module } = req.params;
    const form = await servicenowRepository.saveFormDefinition(module, req.body);
    await servicenowRepository.writeAuditLog(req.user?._id, 'Form Structure Saved', { module });
    return ApiResponse.success(res, 'Form custom fields saved.', form);
  },

  /**
   * SLAs
   */
  getSLAs: async (req, res) => {
    const slas = await servicenowRepository.getSLAs();
    return ApiResponse.success(res, 'SLA rules fetched.', slas);
  },

  saveSLA: async (req, res) => {
    const sla = await servicenowRepository.saveSLA(req.body);
    await servicenowRepository.writeAuditLog(req.user?._id, 'SLA Policy Configured', { priority: req.body.priority, duration: req.body.duration });
    return ApiResponse.success(res, 'SLA policy saved.', sla);
  },

  /**
   * Approvals
   */
  getApprovals: async (req, res) => {
    const approvals = await servicenowRepository.getApprovals(req.user._id);
    return ApiResponse.success(res, 'Approvals fetched.', approvals);
  },

  createApproval: async (req, res) => {
    const approval = await servicenowRepository.createApproval(req.body);
    await servicenowRepository.writeAuditLog(req.user?._id, 'Approval Cycle Generated', { approvalId: approval._id, targetType: req.body.targetType });
    return ApiResponse.success(res, 'Approval created.', approval, 201);
  },

  decideApproval: async (req, res) => {
    const { id } = req.params;
    const { action, comment } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      throw new ApiError('Action must be approve or reject.', 400);
    }
    const updated = await servicenowRepository.updateApprovalStatus(id, req.user._id, action, comment);
    await servicenowRepository.writeAuditLog(req.user?._id, `Approval ${action.toUpperCase()}`, { approvalId: id });
    return ApiResponse.success(res, `Approval ${action}d successfully.`, updated);
  },

  /**
   * Incidents
   */
  getIncidents: async (req, res) => {
    const incidents = await servicenowRepository.getIncidents();
    return ApiResponse.success(res, 'Incidents retrieved.', incidents);
  },

  getIncidentById: async (req, res) => {
    const { id } = req.params;
    const inc = await servicenowRepository.getIncidentById(id);
    if (!inc) {
      throw new ApiError('Incident not found.', 404);
    }
    return ApiResponse.success(res, 'Incident fetched.', inc);
  },

  createIncident: async (req, res) => {
    const inc = await servicenowRepository.createIncident(req.user._id, req.body);
    await servicenowRepository.writeAuditLog(req.user?._id, 'Incident Opened', { incidentId: inc._id, severity: inc.severity });
    
    // Auto notify Founder+Admin immediately for P1 incidents
    if (inc.severity === 'P1') {
      await dbNotifyP1(inc);
    }

    return ApiResponse.success(res, 'Incident created.', inc, 201);
  },

  updateIncident: async (req, res) => {
    const { id } = req.params;
    const updated = await servicenowRepository.updateIncident(id, req.body, req.user._id);
    await servicenowRepository.writeAuditLog(req.user?._id, 'Incident Updated', { incidentId: id, fields: Object.keys(req.body) });
    return ApiResponse.success(res, 'Incident updated.', updated);
  },

  /**
   * Knowledge Base
   */
  getArticles: async (req, res) => {
    const articles = await servicenowRepository.getArticles();
    return ApiResponse.success(res, 'Knowledge base articles fetched.', articles);
  },

  getArticle: async (req, res) => {
    const { slug } = req.params;
    const article = await servicenowRepository.getArticleBySlug(slug);
    if (!article) {
      throw new ApiError('Knowledge article not found.', 404);
    }
    // Update view count
    await servicenowRepository.updateArticle(article._id, { views: (article.views || 0) + 1 });
    return ApiResponse.success(res, 'Knowledge article fetched.', article);
  },

  createArticle: async (req, res) => {
    const art = await servicenowRepository.createArticle(req.body);
    await servicenowRepository.writeAuditLog(req.user?._id, 'KB Article Authored', { articleId: art._id, title: art.title });
    return ApiResponse.success(res, 'Knowledge article authored.', art, 201);
  },

  updateArticle: async (req, res) => {
    const { id } = req.params;
    const updated = await servicenowRepository.updateArticle(id, req.body);
    await servicenowRepository.writeAuditLog(req.user?._id, 'KB Article Edited', { articleId: id });
    return ApiResponse.success(res, 'Knowledge article updated.', updated);
  },

  rateArticle: async (req, res) => {
    const { id } = req.params;
    const { helpful } = req.body; // boolean
    const updated = await servicenowRepository.submitKBFeedback(id, helpful);
    return ApiResponse.success(res, 'Feedback submitted.', updated);
  },

  /**
   * Change Management
   */
  getChanges: async (req, res) => {
    const changes = await servicenowRepository.getChanges();
    return ApiResponse.success(res, 'Change request tickets fetched.', changes);
  },

  createChange: async (req, res) => {
    const chg = await servicenowRepository.createChange(req.user._id, req.body);
    await servicenowRepository.writeAuditLog(req.user?._id, 'Change Submitted', { changeId: chg._id, type: chg.type });
    return ApiResponse.success(res, 'Change request submitted.', chg, 201);
  },

  updateChangeStatus: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await servicenowRepository.updateChangeStatus(id, status);
    await servicenowRepository.writeAuditLog(req.user?._id, `Change Status ➔ ${status}`, { changeId: id });
    return ApiResponse.success(res, 'Change status updated.', updated);
  },

  /**
   * Service Catalog
   */
  getCatalogItems: async (req, res) => {
    const items = await servicenowRepository.getCatalogItems();
    return ApiResponse.success(res, 'Catalog items retrieved.', items);
  },

  requestCatalogItem: async (req, res) => {
    const order = await servicenowRepository.createCatalogRequest(req.user._id, req.body);
    await servicenowRepository.writeAuditLog(req.user?._id, 'Catalog Item Ordered', { orderId: order._id, itemId: req.body.itemId });
    return ApiResponse.success(res, 'Catalog request submitted.', order, 201);
  },

  getCatalogRequests: async (req, res) => {
    const userOnly = req.user?.role !== 'Admin' && req.user?.role !== 'Founder';
    const orders = await servicenowRepository.getCatalogRequests(userOnly ? req.user._id : null);
    return ApiResponse.success(res, 'Catalog orders retrieved.', orders);
  },

  /**
   * Reports
   */
  getReports: async (req, res) => {
    const reports = await servicenowRepository.getReports();
    return ApiResponse.success(res, 'Reports list fetched.', reports);
  },

  saveReport: async (req, res) => {
    const rpt = await servicenowRepository.saveReport(req.user._id, req.body);
    await servicenowRepository.writeAuditLog(req.user?._id, 'Report Saved', { reportId: rpt._id, title: rpt.title });
    return ApiResponse.success(res, 'Report saved.', rpt, 201);
  },

  /**
   * Audits
   */
  getAuditLogs: async (req, res) => {
    const logs = await servicenowRepository.getAuditLogs();
    return ApiResponse.success(res, 'System logs fetched.', logs);
  }
};

// Internal notification trigger simulator for emergency P1 issues
const dbNotifyP1 = async (incident) => {
  try {
    const db = require('../../../config/db').getDb();
    const systemNotice = {
      title: `CRITICAL OUTAGE: Emergency P1 Incident Opened!`,
      description: `Ticket: ${incident.title}. Assigned to Workspace Managers for resolution.`,
      type: 'Incident',
      createdAt: new Date()
    };
    await db.collection('notifications').insertOne(systemNotice);
  } catch (err) {
    // Ignored in test stub mock runtime environments
  }
};

module.exports = servicenowController;
