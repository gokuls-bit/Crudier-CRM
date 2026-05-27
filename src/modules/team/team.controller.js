/**
 * ============================================================
 * Crudier CRM — Team Controller
 * ============================================================
 */

const teamService = require('./team.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const { getPaginationOptions, formatPaginatedResponse } = require('../../utils/paginate');

const teamController = {
  /**
   * List members of a workspace.
   */
  list: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing. Switch workspace first.', 400);

    const { role, department, isActive, search, sortBy, sortOrder } = req.query;
    const filters = {};
    if (role) filters.role = role;
    if (department) filters.department = department;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const sort = {
      field: sortBy === 'name' ? 'name' : 'createdAt',
      order: sortOrder === 'desc' ? 'desc' : 'asc',
    };

    const { limit, skip, page } = getPaginationOptions(req.query);

    const { members, totalCount } = await teamService.listMembers(workspaceId, filters, search, sort, limit, skip);
    const paginated = formatPaginatedResponse(members, totalCount, page, limit);

    return ApiResponse.success(res, 'Team members fetched successfully.', paginated);
  },

  /**
   * Get user profile.
   */
  getProfile: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const user = await teamService.getProfile(workspaceId, req.params.userId);
    return ApiResponse.success(res, 'User profile fetched successfully.', user);
  },

  /**
   * Update profile.
   */
  updateProfile: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const user = await teamService.updateProfile(workspaceId, req.params.userId, req.user._id, req.body);
    return ApiResponse.success(res, 'Profile updated successfully.', user);
  },

  /**
   * Reassign member role.
   */
  updateRole: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const { role } = req.body;
    const user = await teamService.updateRole(workspaceId, req.params.userId, req.user._id, role);
    return ApiResponse.success(res, 'User role updated successfully.', {
      userId: user._id,
      name: user.name,
      role: user.role,
    });
  },

  /**
   * Update department.
   */
  updateDepartment: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const { department } = req.body;
    const user = await teamService.updateDepartment(workspaceId, req.params.userId, req.user._id, department);
    return ApiResponse.success(res, 'User department updated successfully.', {
      userId: user._id,
      name: user.name,
      department: user.department,
    });
  },

  /**
   * Deactivate member.
   */
  deactivate: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    await teamService.deactivateMember(workspaceId, req.params.userId, req.user._id);
    return ApiResponse.success(res, 'Member deactivated successfully.');
  },

  /**
   * Upload user avatar.
   */
  uploadAvatar: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    if (!req.file) throw new ApiError('No file uploaded or file type is invalid.', 400);

    const user = await teamService.updateAvatar(workspaceId, req.params.userId, req.user._id, req.file.filename);
    return ApiResponse.success(res, 'Avatar uploaded successfully.', {
      userId: user._id,
      avatar: user.avatar,
    });
  },

  /**
   * Get user activities.
   */
  activity: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const { limit, skip, page } = getPaginationOptions(req.query);
    const { logs, totalCount } = await teamService.getUserActivityLogs(workspaceId, req.params.userId, limit, skip);
    const paginated = formatPaginatedResponse(logs, totalCount, page, limit);

    return ApiResponse.success(res, 'User activities fetched successfully.', paginated);
  },
};

module.exports = teamController;
