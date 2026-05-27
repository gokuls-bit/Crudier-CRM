/**
 * ============================================================
 * Crudier CRM — Team Service
 * ============================================================
 */

const ApiError = require('../../utils/apiError');
const teamRepository = require('./team.repository');
const authRepository = require('../auth/auth.repository');
const workspaceRepository = require('../workspace/workspace.repository');

const teamService = {
  /**
   * List workspace members with filters, search, and pagination.
   */
  listMembers: async (workspaceId, filters, search, sort, limit, skip) => {
    return teamRepository.findWorkspaceMembers(workspaceId, filters, search, sort, limit, skip);
  },

  /**
   * Get user profile.
   */
  getProfile: async (workspaceId, userId) => {
    const isMember = await teamRepository.isMember(workspaceId, userId);
    if (!isMember) {
      throw new ApiError('Access denied: User is not a member of this workspace.', 403);
    }

    const user = await authRepository.findById(userId);
    if (!user) throw new ApiError('User not found.', 404);

    delete user.password;
    return user;
  },

  /**
   * Update profile (name, skills array).
   */
  updateProfile: async (workspaceId, targetUserId, actorId, updateData) => {
    // Only the user themselves can update their own profile
    if (targetUserId.toString() !== actorId.toString()) {
      throw new ApiError('Access denied: You can only update your own profile.', 403);
    }

    const cleanUpdate = {};
    if (updateData.name) cleanUpdate.name = updateData.name.trim();
    if (updateData.skills) {
      if (!Array.isArray(updateData.skills)) {
        throw new ApiError('Skills must be an array of strings.', 400);
      }
      cleanUpdate.skills = updateData.skills.map((s) => String(s).trim());
    }

    const user = await authRepository.updateProfile(targetUserId, cleanUpdate);
    delete user.password;

    await workspaceRepository.logActivity(workspaceId, actorId, 'profile_updated', targetUserId);
    return user;
  },

  /**
   * Update role. Admin / Founder only.
   */
  updateRole: async (workspaceId, targetUserId, actorId, role) => {
    // We can reuse workspace role updater as it handles all checks
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) throw new ApiError('Workspace not found.', 404);

    const validRoles = ['Founder', 'Admin', 'Team Lead', 'Developer', 'Designer', 'Sales', 'Intern'];
    if (!validRoles.includes(role)) {
      throw new ApiError('Invalid role specified.', 400);
    }

    // Update in workspace members array
    const success = await workspaceRepository.updateMemberRole(workspaceId, targetUserId, role);
    if (!success) {
      throw new ApiError('Failed to update member role. Is the user a member of this workspace?', 400);
    }

    // Update in user profile
    const user = await authRepository.updateProfile(targetUserId, { role });
    
    await workspaceRepository.logActivity(workspaceId, actorId, 'member_role_updated', targetUserId);
    return user;
  },

  /**
   * Update department.
   */
  updateDepartment: async (workspaceId, targetUserId, actorId, department) => {
    // Validate target is a workspace member
    const isMember = await teamRepository.isMember(workspaceId, targetUserId);
    if (!isMember) {
      throw new ApiError('User is not a member of this workspace.', 400);
    }

    const user = await authRepository.updateProfile(targetUserId, { department: department.trim() });
    
    await workspaceRepository.logActivity(workspaceId, actorId, 'member_department_updated', targetUserId);
    return user;
  },

  /**
   * Deactivate member. Admin / Founder only.
   */
  deactivateMember: async (workspaceId, targetUserId, actorId) => {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) throw new ApiError('Workspace not found.', 404);

    // Prevent deactivating the owner
    if (workspace.ownerId.toString() === targetUserId.toString()) {
      throw new ApiError('Access denied: Cannot deactivate the workspace owner.', 400);
    }

    // Check membership
    const isMember = await teamRepository.isMember(workspaceId, targetUserId);
    if (!isMember) {
      throw new ApiError('User is not a member of this workspace.', 400);
    }

    // Set user as inactive and log deactivatedAt
    const user = await authRepository.updateProfile(targetUserId, {
      isActive: false,
      deactivatedAt: new Date(),
    });

    await workspaceRepository.logActivity(workspaceId, actorId, 'member_deactivated', targetUserId);
    return user;
  },

  /**
   * Upload user avatar.
   */
  updateAvatar: async (workspaceId, targetUserId, actorId, filename) => {
    if (targetUserId.toString() !== actorId.toString()) {
      throw new ApiError('Access denied: You can only upload your own avatar.', 403);
    }

    const avatarUrl = `/uploads/avatars/${filename}`;
    const user = await authRepository.updateProfile(targetUserId, { avatar: avatarUrl });
    delete user.password;

    await workspaceRepository.logActivity(workspaceId, actorId, 'avatar_uploaded', targetUserId);
    return user;
  },

  /**
   * Get user activities within a workspace.
   */
  getUserActivityLogs: async (workspaceId, targetUserId, limit, skip) => {
    return teamRepository.getUserActivity(workspaceId, targetUserId, limit, skip);
  },
};

module.exports = teamService;
