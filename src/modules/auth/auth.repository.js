/**
 * ============================================================
 * Crudier CRM — Auth & User Repository
 * ============================================================
 */

const { ObjectId } = require('mongodb');
const { getDb } = require('../../../config/db');

const COLLECTION_NAME = 'users';

const authRepository = {
  /**
   * Find a user by their unique ID.
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  findById: async (id) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();
    return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
  },

  /**
   * Find a user by their email address.
   * @param {string} email 
   * @returns {Promise<Object|null>}
   */
  findByEmail: async (email) => {
    const db = getDb();
    return db.collection(COLLECTION_NAME).findOne({ email: email.toLowerCase().trim() });
  },

  /**
   * Create a new user.
   * @param {Object} userData 
   * @returns {Promise<Object>}
   */
  createUser: async (userData) => {
    const db = getDb();
    const cleanData = {
      ...userData,
      email: userData.email.toLowerCase().trim(),
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      workspaceId: userData.workspaceId ? new ObjectId(userData.workspaceId) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection(COLLECTION_NAME).insertOne(cleanData);
    return { _id: result.insertedId, ...cleanData };
  },

  /**
   * Update a user's active workspace.
   * @param {string} userId 
   * @param {string|null} workspaceId 
   * @returns {Promise<boolean>}
   */
  updateWorkspace: async (userId, workspaceId) => {
    if (!ObjectId.isValid(userId)) return false;
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          workspaceId: workspaceId ? new ObjectId(workspaceId) : null,
          updatedAt: new Date()
        } 
      }
    );
    return result.modifiedCount > 0;
  },

  /**
   * Update a user profile directly.
   * @param {string} userId 
   * @param {Object} updateData 
   * @returns {Promise<Object|null>}
   */
  updateProfile: async (userId, updateData) => {
    if (!ObjectId.isValid(userId)) return null;
    const db = getDb();
    const cleanUpdate = { ...updateData, updatedAt: new Date() };
    
    // Ensure we don't accidentally cast workspaceId incorrectly if passed
    if (cleanUpdate.workspaceId) {
      cleanUpdate.workspaceId = new ObjectId(cleanUpdate.workspaceId);
    }

    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(userId) },
      { $set: cleanUpdate }
    );
    return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(userId) });
  },

  // ── Refresh Token Whitelisting ───────────────────────────

  /**
   * Save a newly issued refresh token.
   */
  saveRefreshToken: async (userId, token, expiresAt) => {
    const db = getDb();
    await db.collection('refreshTokens').insertOne({
      userId: new ObjectId(userId),
      token,
      expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    });
  },

  /**
   * Check if refresh token is in whitelist.
   */
  findRefreshToken: async (token) => {
    const db = getDb();
    return db.collection('refreshTokens').findOne({ token });
  },

  /**
   * Revoke a single refresh token (e.g. on logout).
   */
  deleteRefreshToken: async (token) => {
    const db = getDb();
    const result = await db.collection('refreshTokens').deleteOne({ token });
    return result.deletedCount > 0;
  },

  /**
   * Revoke all refresh tokens for a user (e.g. password change).
   */
  deleteUserRefreshTokens: async (userId) => {
    const db = getDb();
    const result = await db.collection('refreshTokens').deleteMany({ userId: new ObjectId(userId) });
    return result.deletedCount;
  },
};

module.exports = authRepository;
