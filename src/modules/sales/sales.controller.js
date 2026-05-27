/**
 * ============================================================
 * Crudier CRM — Sales Controller
 * ============================================================
 */

const salesService = require('./sales.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const { getPaginationOptions, formatPaginatedResponse } = require('../../utils/paginate');

const salesController = {
  /**
   * Create lead.
   */
  createLead: async (req, res) => {
    const lead = await salesService.createLead(req.body, req.user);
    return ApiResponse.success(res, 'Lead created successfully.', lead, 201);
  },

  /**
   * Get single lead details.
   */
  getById: async (req, res) => {
    const lead = await salesService.getById(req.params.id);
    return ApiResponse.success(res, 'Lead details fetched.', lead);
  },

  /**
   * List leads.
   */
  listLeads: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const { status, assignedTo, search } = req.query;
    const filters = { status, assignedTo };

    const { limit, skip, page } = getPaginationOptions(req.query);

    const { leads, totalCount } = await salesService.listLeads(workspaceId, filters, search, limit, skip);
    const paginated = formatPaginatedResponse(leads, totalCount, page, limit);

    return ApiResponse.success(res, 'Leads fetched successfully.', paginated);
  },

  /**
   * Update lead fields.
   */
  updateLead: async (req, res) => {
    const lead = await salesService.updateLead(req.params.id, req.body);
    return ApiResponse.success(res, 'Lead updated successfully.', lead);
  },

  /**
   * Add note.
   */
  addNote: async (req, res) => {
    const { text } = req.body;
    if (!text) throw new ApiError('Note text is required.', 400);

    const note = await salesService.addNote(req.params.id, text, req.user._id);
    return ApiResponse.success(res, 'Note added to lead successfully.', note, 201);
  },

  /**
   * Update status.
   */
  updateStatus: async (req, res) => {
    const { status } = req.body;
    if (!status) throw new ApiError('Status field is required.', 400);

    const lead = await salesService.updateStatus(req.params.id, status);
    return ApiResponse.success(res, 'Lead status updated successfully.', {
      leadId: lead._id,
      status: lead.status,
    });
  },

  /**
   * Delete lead.
   */
  deleteLead: async (req, res) => {
    await salesService.deleteLead(req.params.id);
    return ApiResponse.success(res, 'Lead deleted successfully.');
  },

  /**
   * Get pipeline stages aggregation.
   */
  pipeline: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const data = await salesService.getPipeline(workspaceId);
    return ApiResponse.success(res, 'Pipeline metrics fetched.', data);
  },

  /**
   * Get CRM analytics.
   */
  analytics: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const data = await salesService.getAnalytics(workspaceId);
    return ApiResponse.success(res, 'Sales CRM analytics fetched.', data);
  },

  /**
   * Get upcoming follow-ups.
   */
  followUps: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const data = await salesService.getFollowUps(workspaceId);
    return ApiResponse.success(res, 'Upcoming follow-ups fetched.', data);
  },
};

module.exports = salesController;
