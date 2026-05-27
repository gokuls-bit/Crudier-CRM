/**
 * ============================================================
 * Crudier CRM — Workspace Service
 * ============================================================
 */

const { ObjectId } = require('mongodb');
const ApiError = require('../../utils/apiError');
const workspaceRepository = require('./workspace.repository');
const authRepository = require('../auth/auth.repository');

const workspaceService = {
  /**
   * Create a new workspace.
   */
  create: async (name, description, logo, ownerId) => {
    const workspace = await workspaceRepository.createWorkspace({
      name,
      description,
      logo,
      ownerId,
      members: [{ userId: ownerId, role: 'Founder', joinedAt: new Date() }],
    });

    // Set owner's active workspaceId to this new workspace
    await authRepository.updateWorkspace(ownerId, workspace._id);

    // Log action
    await workspaceRepository.logActivity(workspace._id, ownerId, 'workspace_created', workspace._id);

    return workspace;
  },

  /**
   * Get workspace details.
   */
  getById: async (id) => {
    const workspace = await workspaceRepository.findById(id);
    if (!workspace) throw new ApiError('Workspace not found.', 404);
    return workspace;
  },

  /**
   * Update workspace details.
   */
  update: async (id, updateData, actorId) => {
    const workspace = await workspaceRepository.updateWorkspace(id, updateData);
    if (!workspace) throw new ApiError('Workspace not found.', 404);

    await workspaceRepository.logActivity(id, actorId, 'workspace_updated', id);
    return workspace;
  },

  /**
   * Delete workspace.
   */
  delete: async (id, actorId) => {
    const workspace = await workspaceRepository.findById(id);
    if (!workspace) throw new ApiError('Workspace not found.', 404);

    // Only Owner/Founder can delete
    if (workspace.ownerId.toString() !== actorId.toString()) {
      throw new ApiError('Access denied: Only the workspace owner can delete this workspace.', 403);
    }

    const success = await workspaceRepository.deleteWorkspace(id);
    if (!success) throw new ApiError('Failed to delete workspace.', 500);

    return true;
  },

  /**
   * Invite member by email.
   */
  inviteMember: async (workspaceId, email, role, actorId) => {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(`Invitation failed: User with email ${email} is not registered in Crudier CRM.`, 404);
    }

    const success = await workspaceRepository.addMember(workspaceId, user._id, role || 'Intern');
    if (!success) {
      throw new ApiError('Failed to add member to workspace.', 500);
    }

    // Set user's active workspaceId if they don't have one
    if (!user.workspaceId) {
      await authRepository.updateWorkspace(user._id, workspaceId);
    }

    await workspaceRepository.logActivity(workspaceId, actorId, 'member_invited', user._id);
    return user;
  },

  /**
   * Reassign role of a member.
   */
  updateRole: async (workspaceId, memberId, role, actorId) => {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) throw new ApiError('Workspace not found.', 404);

    // Only owner can change roles
    if (workspace.ownerId.toString() !== actorId.toString()) {
      throw new ApiError('Access denied: Only the Founder/Owner can reassign member roles.', 403);
    }

    const validRoles = ['Founder', 'Admin', 'Team Lead', 'Developer', 'Designer', 'Sales', 'Intern'];
    if (!validRoles.includes(role)) {
      throw new ApiError('Invalid role specified.', 400);
    }

    // Cannot reassign Founder role if they aren't the owner
    if (workspace.ownerId.toString() === memberId.toString()) {
      throw new ApiError('Access denied: Cannot reassign the owner\'s role.', 400);
    }

    const success = await workspaceRepository.updateMemberRole(workspaceId, memberId, role);
    if (!success) {
      throw new ApiError('Failed to update member role. Is the user a member of this workspace?', 400);
    }

    // Also update role in user's profile if it's the active role?
    // Wait, prompt says: "The user schema includes: name, email, password, role, workspaceId..."
    // Since roles are global (or workspace-scoped? Prompt says "users can belong to multiple workspaces with different roles in each. The workspace schema includes: ownerId, members [{userId, role, joinedAt}]"), 
    // we keep the workspace-scoped role inside the workspace.members array, but we can also update their active role in the user document if they are in this workspace!
    await authRepository.updateProfile(memberId, { role });

    await workspaceRepository.logActivity(workspaceId, actorId, 'member_role_updated', memberId);
    return true;
  },

  /**
   * Remove member from workspace.
   */
  removeMember: async (workspaceId, memberId, actorId) => {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) throw new ApiError('Workspace not found.', 404);

    // Prevent removing the owner
    if (workspace.ownerId.toString() === memberId.toString()) {
      throw new ApiError('Access denied: Cannot remove the owner of the workspace.', 400);
    }

    const success = await workspaceRepository.removeMember(workspaceId, memberId);
    if (!success) {
      throw new ApiError('Failed to remove member. Is the user a member of this workspace?', 400);
    }

    // Reset user active workspace if they were removed from it
    const memberUser = await authRepository.findById(memberId);
    if (memberUser && memberUser.workspaceId && memberUser.workspaceId.toString() === workspaceId.toString()) {
      await authRepository.updateWorkspace(memberId, null);
    }

    await workspaceRepository.logActivity(workspaceId, actorId, 'member_removed', memberId);
    return true;
  },

  /**
   * Switch user active workspace.
   */
  switchWorkspace: async (userId, targetWorkspaceId) => {
    const workspace = await workspaceRepository.findById(targetWorkspaceId);
    if (!workspace) throw new ApiError('Workspace not found.', 404);

    // Check membership
    const isMember = workspace.members.some(
      (m) => m.userId && m.userId.toString() === userId.toString()
    ) || (workspace.ownerId && workspace.ownerId.toString() === userId.toString());

    if (!isMember) {
      throw new ApiError('Access denied: You are not a member of the target workspace.', 403);
    }

    // Find user role in target workspace
    const memberRecord = workspace.members.find(
      (m) => m.userId && m.userId.toString() === userId.toString()
    );
    const targetRole = workspace.ownerId.toString() === userId.toString() ? 'Founder' : (memberRecord ? memberRecord.role : 'Intern');

    // Update active workspace & role in user document
    await authRepository.updateProfile(userId, {
      workspaceId: new ObjectId(targetWorkspaceId),
      role: targetRole,
    });

    return { workspaceId: targetWorkspaceId, role: targetRole };
  },

  /**
   * Get activity logs.
   */
  getActivity: async (workspaceId, limit, skip) => {
    return workspaceRepository.getActivityLogs(workspaceId, limit, skip);
  },
};

module.exports = workspaceService;
