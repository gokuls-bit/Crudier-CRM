/**
 * ============================================================
 * Crudier CRM — Sales Service
 * ============================================================
 */

const ApiError = require('../../utils/apiError');
const salesRepository = require('./sales.repository');

const salesService = {
  /**
   * Create lead.
   */
  createLead: async (leadData, actor) => {
    return salesRepository.createLead({
      ...leadData,
      workspaceId: actor.workspaceId,
    });
  },

  /**
   * Get single lead.
   */
  getById: async (id) => {
    const lead = await salesRepository.findById(id);
    if (!lead) throw new ApiError('Lead not found.', 404);
    return lead;
  },

  /**
   * List workspace leads with filtering, searching, pagination.
   */
  listLeads: async (workspaceId, filters, search, limit, skip) => {
    return salesRepository.findLeads(workspaceId, filters, search, limit, skip);
  },

  /**
   * Update lead fields.
   */
  updateLead: async (id, updateData) => {
    const lead = await salesRepository.findById(id);
    if (!lead) throw new ApiError('Lead not found.', 404);

    return salesRepository.updateLead(id, updateData);
  },

  /**
   * Add a note.
   */
  addNote: async (leadId, text, creatorId) => {
    const lead = await salesRepository.findById(leadId);
    if (!lead) throw new ApiError('Lead not found.', 404);

    return salesRepository.addNote(leadId, text, creatorId);
  },

  /**
   * Update lead status.
   */
  updateStatus: async (leadId, status) => {
    const lead = await salesRepository.findById(leadId);
    if (!lead) throw new ApiError('Lead not found.', 404);

    const validStatuses = [
      'New Lead',
      'Contacted',
      'Meeting Scheduled',
      'Negotiation',
      'Closed Won',
      'Closed Lost',
    ];
    if (!validStatuses.includes(status)) {
      throw new ApiError('Invalid lead status.', 400);
    }

    return salesRepository.updateLead(leadId, { status });
  },

  /**
   * Delete lead.
   */
  deleteLead: async (id) => {
    const success = await salesRepository.deleteLead(id);
    if (!success) throw new ApiError('Failed to delete lead.', 500);
    return true;
  },

  /**
   * Get pipeline stages.
   */
  getPipeline: async (workspaceId) => {
    return salesRepository.getPipelineData(workspaceId);
  },

  /**
   * Get CRM analytics.
   */
  getAnalytics: async (workspaceId) => {
    return salesRepository.getCRMAnalytics(workspaceId);
  },

  /**
   * Get upcoming follow-ups.
   */
  getFollowUps: async (workspaceId) => {
    return salesRepository.getUpcomingFollowUps(workspaceId);
  },
};

module.exports = salesService;
