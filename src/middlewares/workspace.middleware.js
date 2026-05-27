/**
 * ============================================================
 * Crudier CRM — Workspace Membership Validation Middleware
 * ============================================================
 */

const { ObjectId } = require('mongodb');
const { getDb } = require('../../config/db');
const ApiError = require('../utils/apiError');
const asyncWrapper = require('../utils/asyncWrapper');

const validateWorkspaceMembership = asyncWrapper(async (req, res, next) => {
  const db = getDb();
  
  // 1. Determine workspace ID from params, headers, or active user workspace
  let workspaceIdStr = req.params.workspaceId || req.params.id || req.headers['x-workspace-id'];
  
  if (!workspaceIdStr && req.user && req.user.workspaceId) {
    workspaceIdStr = req.user.workspaceId.toString();
  }

  if (!workspaceIdStr) {
    return next(new ApiError('Workspace context is missing. Please provide workspaceId.', 400));
  }

  if (!ObjectId.isValid(workspaceIdStr)) {
    return next(new ApiError('Invalid workspace ID format.', 400));
  }

  const workspaceId = new ObjectId(workspaceIdStr);
  const workspace = await db.collection('workspaces').findOne({ _id: workspaceId });

  if (!workspace) {
    return next(new ApiError('Workspace not found.', 404));
  }

  // 2. Validate user membership
  const userIdStr = req.user._id.toString();
  const memberRecord = workspace.members.find(
    (m) => m.userId && m.userId.toString() === userIdStr
  );

  // Note: Owner is automatically a member even if not explicitly in the list
  const isOwner = workspace.ownerId && workspace.ownerId.toString() === userIdStr;

  if (!memberRecord && !isOwner) {
    return next(new ApiError('Access denied: You are not a member of this workspace.', 403));
  }

  // Attach workspace context and the user's workspace role
  req.workspace = workspace;
  req.workspaceRole = isOwner ? 'Founder' : (memberRecord ? memberRecord.role : 'Intern');
  
  next();
});

module.exports = {
  validateWorkspaceMembership,
};
