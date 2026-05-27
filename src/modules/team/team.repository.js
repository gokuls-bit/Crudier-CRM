/**
 * ============================================================
 * Crudier CRM — Team Repository
 * ============================================================
 */

const { ObjectId } = require('mongodb');
const { getDb } = require('../../../config/db');

const USER_COLLECTION = 'users';
const WORKSPACE_COLLECTION = 'workspaces';
const ACTIVITY_COLLECTION = 'workspaceActivity';

const teamRepository = {
  /**
   * Find members of a workspace with filters, search, sorting, and pagination.
   */
  findWorkspaceMembers: async (workspaceId, filters, search, sort, limit, skip) => {
    const db = getDb();
    
    // 1. Get member list from workspace
    const workspace = await db.collection(WORKSPACE_COLLECTION).findOne({ _id: new ObjectId(workspaceId) });
    if (!workspace) return { members: [], totalCount: 0 };

    const memberIds = workspace.members.map((m) => m.userId);
    if (workspace.ownerId) {
      memberIds.push(workspace.ownerId);
    }

    // 2. Build user query scoped to these IDs
    const query = {
      _id: { $in: memberIds },
    };

    // Filters
    if (filters.role) query.role = filters.role;
    if (filters.department) query.department = filters.department;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;

    // Search (case-insensitive name or email)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort options
    const sortOption = {};
    if (sort.field === 'name') {
      sortOption.name = sort.order === 'desc' ? -1 : 1;
    } else {
      sortOption.createdAt = sort.order === 'desc' ? -1 : 1;
    }

    const cursor = db.collection(USER_COLLECTION)
      .find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const members = await cursor.toArray();
    const totalCount = await db.collection(USER_COLLECTION).countDocuments(query);

    // Strip passwords
    members.forEach((m) => delete m.password);

    return { members, totalCount };
  },

  /**
   * Check if user is a member of the workspace.
   */
  isMember: async (workspaceId, userId) => {
    const db = getDb();
    const workspace = await db.collection(WORKSPACE_COLLECTION).findOne({ _id: new ObjectId(workspaceId) });
    if (!workspace) return false;

    return workspace.members.some((m) => m.userId.toString() === userId.toString()) ||
      (workspace.ownerId && workspace.ownerId.toString() === userId.toString());
  },

  /**
   * Get user activities within a workspace.
   */
  getUserActivity: async (workspaceId, userId, limit, skip) => {
    const db = getDb();
    const query = {
      workspaceId: new ObjectId(workspaceId),
      actorId: new ObjectId(userId),
    };

    const cursor = db.collection(ACTIVITY_COLLECTION)
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const logs = await cursor.toArray();
    const totalCount = await db.collection(ACTIVITY_COLLECTION).countDocuments(query);

    return { logs, totalCount };
  },
};

module.exports = teamRepository;
