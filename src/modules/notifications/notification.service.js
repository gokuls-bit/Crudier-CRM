/**
 * ============================================================
 * Crudier CRM — Notification Service (Base Skeleton)
 * ============================================================
 */

const { ObjectId } = require('mongodb');
const { getDb } = require('../../../config/db');

const COLLECTION_NAME = 'notifications';

const notificationService = {
  /**
   * Create a notification.
   * Group consecutive same-type notifications within 1 hour at this layer.
   */
  createNotification: async (userId, { title, message, type, metadata = {} }) => {
    if (!userId) return null;
    const db = getDb();

    const recipientId = new ObjectId(userId);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // ── Grouping logic ──────────────────────────────────────
    // Check if there is an unread notification of the same type for this user in the last hour
    const existingLog = await db.collection(COLLECTION_NAME).findOne({
      userId: recipientId,
      type,
      isRead: false,
      createdAt: { $gte: oneHourAgo },
    });

    if (existingLog) {
      // Group: update the existing notification message and timestamp
      const updatedMessage = `${existingLog.message} | ${message}`;
      await db.collection(COLLECTION_NAME).updateOne(
        { _id: existingLog._id },
        { 
          $set: { 
            message: updatedMessage,
            metadata: { ...existingLog.metadata, ...metadata },
            createdAt: new Date()
          } 
        }
      );
      return existingLog;
    }

    // Otherwise, create a new notification
    const notification = {
      userId: recipientId,
      title,
      message,
      type,
      isRead: false,
      metadata,
      createdAt: new Date(),
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(notification);
    
    // Broadcast via Socket.IO if helper is loaded
    // We can do global.io emit or call a handler
    if (global.io) {
      global.io.to(`user_${recipientId.toString()}`).emit('notification', {
        _id: result.insertedId,
        ...notification
      });
    }

    return { _id: result.insertedId, ...notification };
  },
};

module.exports = notificationService;
