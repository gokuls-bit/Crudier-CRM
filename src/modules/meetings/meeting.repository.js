/**
 * ============================================================
 * Crudier CRM — Meeting Repository
 * ============================================================
 */

const { ObjectId } = require('mongodb');
const { getDb } = require('../../../config/db');

const COLLECTION_NAME = 'meetings';

const meetingRepository = {
  /**
   * Find meeting by ID.
   */
  findById: async (id) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();
    return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
  },

  /**
   * Create meeting.
   */
  createMeeting: async (meetingData) => {
    const db = getDb();
    const cleanData = {
      title: meetingData.title.trim(),
      description: meetingData.description || '',
      organizerId: new ObjectId(meetingData.organizerId),
      participants: meetingData.participants.map((p) => ({
        userId: new ObjectId(p.userId),
        rsvp: p.rsvp || 'Pending', // Pending, Accepted, Declined, Tentative
      })),
      startTime: new Date(meetingData.startTime),
      endTime: new Date(meetingData.endTime),
      meetingLink: meetingData.meetingLink || '',
      workspaceId: new ObjectId(meetingData.workspaceId),
      notes: meetingData.notes || '',
      status: 'Scheduled', // Scheduled, In Progress, Completed, Cancelled
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(cleanData);
    return { _id: result.insertedId, ...cleanData };
  },

  /**
   * List workspace meetings.
   */
  findWorkspaceMeetings: async (workspaceId, filters, limit, skip) => {
    const db = getDb();
    const query = { workspaceId: new ObjectId(workspaceId) };

    if (filters.status) {
      query.status = filters.status;
    }

    const cursor = db.collection(COLLECTION_NAME)
      .find(query)
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(limit);

    const meetings = await cursor.toArray();
    const totalCount = await db.collection(COLLECTION_NAME).countDocuments(query);

    return { meetings, totalCount };
  },

  /**
   * Update meeting fields.
   */
  updateMeeting: async (id, updateData) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();
    
    const cleanUpdate = { ...updateData, updatedAt: new Date() };
    if (cleanUpdate.startTime) cleanUpdate.startTime = new Date(cleanUpdate.startTime);
    if (cleanUpdate.endTime) cleanUpdate.endTime = new Date(cleanUpdate.endTime);

    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { $set: cleanUpdate }
    );
    return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
  },

  /**
   * Update RSVP for a participant.
   */
  updateRsvp: async (meetingId, userId, rsvp) => {
    if (!ObjectId.isValid(meetingId) || !ObjectId.isValid(userId)) return false;
    const db = getDb();

    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(meetingId), 'participants.userId': new ObjectId(userId) },
      {
        $set: {
          'participants.$.rsvp': rsvp,
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  },

  /**
   * Get user's upcoming meetings for the next 7 days.
   */
  findUpcomingMeetings: async (userId) => {
    const db = getDb();
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const query = {
      $or: [
        { organizerId: new ObjectId(userId) },
        { 'participants.userId': new ObjectId(userId) },
      ],
      status: { $in: ['Scheduled', 'In Progress'] },
      startTime: { $gte: now, $lte: sevenDaysLater },
    };

    return db.collection(COLLECTION_NAME)
      .find(query)
      .sort({ startTime: 1 })
      .toArray();
  },
};

module.exports = meetingRepository;
