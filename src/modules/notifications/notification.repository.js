/**
 * ============================================================
 * Crudier CRM — Notification Repository
 * ============================================================
 */

const { ObjectId } = require('mongodb');
const { getDb } = require('../../../config/db');

const COLLECTION_NAME = 'notifications';

const notificationRepository = {
  /**
   * Create indexes on startup.
   */
  createIndexes: async () => {
    const db = getDb();
    try {
      // 1. Index on userId and createdAt
      await db.collection(COLLECTION_NAME).createIndex(
        { userId: 1, createdAt: -1 },
        { name: 'NotificationsUserCreatedIndex' }
      );

      // 2. Compound index on { userId, isRead }
      await db.collection(COLLECTION_NAME).createIndex(
        { userId: 1, isRead: 1 },
        { name: 'NotificationsUserUnreadIndex' }
      );

      console.log('[MongoDB] ✓ Notification indexes verified.');
    } catch (err) {
      console.error('[MongoDB] Failed to create notification indexes:', err.message);
    }
  },

  /**
   * Find notification by ID.
   */
  findById: async (id) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();
    return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
  },

  /**
   * Get paginated notifications for a user.
   */
  getUserNotifications: async (userId, filters, limit, skip) => {
    const db = getDb();
    const query = { userId: new ObjectId(userId) };

    if (filters.type) {
      query.type = filters.type;
    }
    if (filters.isRead !== undefined) {
      query.isRead = filters.isRead;
    }

    const cursor = db.collection(COLLECTION_NAME)
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const notifications = await cursor.toArray();
    const totalCount = await db.collection(COLLECTION_NAME).countDocuments(query);

    return { notifications, totalCount };
  },

  /**
   * Count unread notifications using the compound index.
   */
  countUnread: async (userId) => {
    const db = getDb();
    return db.collection(COLLECTION_NAME).countDocuments({
      userId: new ObjectId(userId),
      isRead: false,
    });
  },

  /**
   * Update isRead status.
   */
  updateReadStatus: async (id, isRead) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();

    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { $set: { isRead, updatedAt: new Date() } }
    );

    return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
  },

  /**
   * Mark all notifications as read for a user.
   */
  markAllAsRead: async (userId) => {
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).updateMany(
      { userId: new ObjectId(userId), isRead: false },
      { $set: { isRead: true, updatedAt: new Date() } }
    );
    return result.modifiedCount;
  },

  /**
   * Delete notification by ID.
   */
  deleteNotification: async (id) => {
    if (!ObjectId.isValid(id)) return false;
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },

  /**
   * Clear all notifications for a user.
   */
  clearAllNotifications: async (userId) => {
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).deleteMany({ userId: new ObjectId(userId) });
    return result.deletedCount;
  },
};

module.exports = notificationRepository;
