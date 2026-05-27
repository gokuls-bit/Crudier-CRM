/**
 * ============================================================
 * Crudier CRM — Workspace Controller
 * ============================================================
 */

const workspaceService = require('./workspace.service');
const ApiResponse = require('../../utils/apiResponse');
const { getPaginationOptions, formatPaginatedResponse } = require('../../utils/paginate');

const workspaceController = {
  /**
   * Create workspace.
   */
  create: async (req, res) => {
    const { name, description, logo } = req.body;
    const workspace = await workspaceService.create(name, description, logo, req.user._id);
    return ApiResponse.success(res, 'Workspace created successfully.', workspace, 201);
  },

  /**
   * Get workspace details.
   */
  getById: async (req, res) => {
    const workspace = await workspaceService.getById(req.params.id);
    return ApiResponse.success(res, 'Workspace details fetched.', workspace);
  },

  /**
   * Update workspace details.
   */
  update: async (req, res) => {
    const workspace = await workspaceService.update(req.params.id, req.body, req.user._id);
    return ApiResponse.success(res, 'Workspace updated successfully.', workspace);
  },

  /**
   * Delete workspace.
   */
  delete: async (req, res) => {
    await workspaceService.delete(req.params.id, req.user._id);
    return ApiResponse.success(res, 'Workspace deleted successfully.');
  },

  /**
   * Invite member to workspace.
   */
  invite: async (req, res) => {
    const { email, role } = req.body;
    const user = await workspaceService.inviteMember(req.params.id, email, role, req.user._id);
    return ApiResponse.success(res, 'Member invited and added successfully.', {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: role || 'Intern',
    });
  },

  /**
   * Reassign member role.
   */
  updateMemberRole: async (req, res) => {
    const { role } = req.body;
    const { userId } = req.params;
    await workspaceService.updateRole(req.params.id, userId, role, req.user._id);
    return ApiResponse.success(res, 'Member role updated successfully.');
  },

  /**
   * Remove member from workspace.
   */
  removeMember: async (req, res) => {
    const { userId } = req.params;
    await workspaceService.removeMember(req.params.id, userId, req.user._id);
    return ApiResponse.success(res, 'Member removed from workspace successfully.');
  },

  /**
   * Switch user workspace.
   */
  switchWorkspace: async (req, res) => {
    const { workspaceId } = req.body;
    const result = await workspaceService.switchWorkspace(req.user._id, workspaceId);
    return ApiResponse.success(res, 'Switched workspace context successfully.', result);
  },

  /**
   * Get activity logs.
   */
  activity: async (req, res) => {
    const { limit, skip, page } = getPaginationOptions(req.query);
    const { logs, totalCount } = await workspaceService.getActivity(req.params.id, limit, skip);
    const paginated = formatPaginatedResponse(logs, totalCount, page, limit);
    return ApiResponse.success(res, 'Activity logs fetched successfully.', paginated);
  },
};

module.exports = workspaceController;
