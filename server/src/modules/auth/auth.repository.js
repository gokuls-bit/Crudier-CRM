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
      name: userData.name ? userData.name.trim() : '',
      email: userData.email.toLowerCase().trim(),
      password: userData.password || null,
      role: userData.role || 'Developer',
      workspaceId: userData.workspaceId ? new ObjectId(userData.workspaceId) : null,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      authProviders: userData.authProviders || [],
      twoFactorEnabled: userData.twoFactorEnabled || false,
      twoFactorSecret: userData.twoFactorSecret || null,
      twoFactorBackupCodes: userData.twoFactorBackupCodes || [],
      emailVerified: userData.emailVerified || false,
      emailVerificationToken: userData.emailVerificationToken || null,
      emailVerificationExpiry: userData.emailVerificationExpiry || null,
      loginHistory: userData.loginHistory || [],
      failedLoginAttempts: userData.failedLoginAttempts || 0,
      lockedUntil: userData.lockedUntil || null,
      activeSessions: userData.activeSessions || [],
      developerProfiles: userData.developerProfiles || {
        github: null,
        leetcode: null,
        hackerrank: null,
        codeforces: null,
        codechef: null,
        stackoverflow: null
      },
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

  /**
   * Find a user by OAuth provider and provider ID.
   */
  findUserByProvider: async (provider, providerId) => {
    const db = getDb();
    return db.collection(COLLECTION_NAME).findOne({
      authProviders: {
        $elemMatch: { provider, providerId }
      }
    });
  },

  /**
   * Link an OAuth provider to a user account.
   */
  linkProvider: async (userId, providerData) => {
    if (!ObjectId.isValid(userId)) return false;
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(userId) },
      {
        $push: { authProviders: providerData },
        $set: { updatedAt: new Date() }
      }
    );
    return result.modifiedCount > 0;
  },

  /**
   * Unlink an OAuth provider from a user account.
   */
  unlinkProvider: async (userId, provider) => {
    if (!ObjectId.isValid(userId)) return false;
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(userId) },
      {
        $pull: { authProviders: { provider } },
        $set: { updatedAt: new Date() }
      }
    );
    return result.modifiedCount > 0;
  },

  /**
   * Add active session.
   */
  addActiveSession: async (userId, session) => {
    if (!ObjectId.isValid(userId)) return false;
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(userId) },
      {
        $push: { activeSessions: session },
        $set: { updatedAt: new Date() }
      }
    );
    return result.modifiedCount > 0;
  },

  /**
   * Remove active session.
   */
  removeActiveSession: async (userId, sessionId) => {
    if (!ObjectId.isValid(userId)) return false;
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(userId) },
      {
        $pull: { activeSessions: { sessionId } },
        $set: { updatedAt: new Date() }
      }
    );
    return result.modifiedCount > 0;
  },

  /**
   * Update active session timestamp.
   */
  updateSessionActivity: async (userId, sessionId) => {
    if (!ObjectId.isValid(userId)) return false;
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(userId), 'activeSessions.sessionId': sessionId },
      {
        $set: {
          'activeSessions.$.lastActive': new Date(),
          updatedAt: new Date()
        }
      }
    );
    return result.modifiedCount > 0;
  },

  /**
   * Log login attempts.
   */
  incrementFailedAttempts: async (userId, lockedUntil) => {
    if (!ObjectId.isValid(userId)) return false;
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(userId) },
      {
        $inc: { failedLoginAttempts: 1 },
        $set: {
          lockedUntil,
          updatedAt: new Date()
        }
      }
    );
    return result.modifiedCount > 0;
  },

  /**
   * Reset failed attempts.
   */
  resetFailedAttempts: async (userId) => {
    if (!ObjectId.isValid(userId)) return false;
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          updatedAt: new Date()
        }
      }
    );
    return result.modifiedCount > 0;
  },

  /**
   * Add login history entry.
   */
  addLoginHistory: async (userId, entry) => {
    if (!ObjectId.isValid(userId)) return false;
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(userId) },
      {
        $push: { loginHistory: entry },
        $set: { updatedAt: new Date() }
      }
    );
    return result.modifiedCount > 0;
  },
};

module.exports = authRepository;
