/**
 * ============================================================
 * Crudier CRM — Workspace Repository
 * ============================================================
 */

const { ObjectId } = require('mongodb');
const { getDb } = require('../../../config/db');

const COLLECTION_NAME = 'workspaces';
const ACTIVITY_COLLECTION = 'workspaceActivity';

const workspaceRepository = {
  /**
   * Find workspace by ID.
   */
  findById: async (id) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();
    return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
  },

  /**
   * Create workspace.
   */
  createWorkspace: async (workspaceData) => {
    const db = getDb();
    const cleanData = {
      name: workspaceData.name.trim(),
      description: workspaceData.description || '',
      logo: workspaceData.logo || null,
      ownerId: new ObjectId(workspaceData.ownerId),
      members: workspaceData.members.map((m) => ({
        userId: new ObjectId(m.userId),
        role: m.role,
        joinedAt: m.joinedAt || new Date(),
      })),
      settings: workspaceData.settings || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection(COLLECTION_NAME).insertOne(cleanData);
    return { _id: result.insertedId, ...cleanData };
  },

  /**
   * Update workspace.
   */
  updateWorkspace: async (id, updateData) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();
    const cleanUpdate = { ...updateData, updatedAt: new Date() };

    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { $set: cleanUpdate }
    );
    return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
  },

  /**
   * Delete workspace.
   */
  deleteWorkspace: async (id) => {
    if (!ObjectId.isValid(id)) return false;
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },

  /**
   * Add member to workspace.
   */
  addMember: async (workspaceId, userId, role) => {
    if (!ObjectId.isValid(workspaceId) || !ObjectId.isValid(userId)) return false;
    const db = getDb();
    
    // Check if already member
    const workspace = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(workspaceId) });
    if (!workspace) return false;

    const isAlreadyMember = workspace.members.some(
      (m) => m.userId && m.userId.toString() === userId.toString()
    );
    if (isAlreadyMember) return true; // idempotency

    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(workspaceId) },
      {
        $push: {
          members: {
            userId: new ObjectId(userId),
            role: role || 'Intern',
            joinedAt: new Date(),
          },
        },
        $set: { updatedAt: new Date() },
      }
    );
    return result.modifiedCount > 0;
  },

  /**
   * Update member role.
   */
  updateMemberRole: async (workspaceId, userId, role) => {
    if (!ObjectId.isValid(workspaceId) || !ObjectId.isValid(userId)) return false;
    const db = getDb();
    
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(workspaceId), 'members.userId': new ObjectId(userId) },
      {
        $set: {
          'members.$.role': role,
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  },

  /**
   * Remove member from workspace.
   */
  removeMember: async (workspaceId, userId) => {
    if (!ObjectId.isValid(workspaceId) || !ObjectId.isValid(userId)) return false;
    const db = getDb();
    
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(workspaceId) },
      {
        $pull: {
          members: { userId: new ObjectId(userId) },
        },
        $set: { updatedAt: new Date() },
      }
    );
    return result.modifiedCount > 0;
  },

  // ── Activity Logging ──────────────────────────────────────
  
  /**
   * Log an activity.
   */
  logActivity: async (workspaceId, actorId, action, targetId) => {
    const db = getDb();
    const log = {
      workspaceId: new ObjectId(workspaceId),
      actorId: new ObjectId(actorId),
      action,
      targetId: targetId ? new ObjectId(targetId) : null,
      timestamp: new Date(),
    };
    await db.collection(ACTIVITY_COLLECTION).insertOne(log);
  },

  /**
   * Get workspace activity logs (paginated).
   */
  getActivityLogs: async (workspaceId, limit, skip) => {
    if (!ObjectId.isValid(workspaceId)) return { logs: [], totalCount: 0 };
    const db = getDb();
    
    const query = { workspaceId: new ObjectId(workspaceId) };
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

module.exports = workspaceRepository;
