/**
 * ============================================================
 * Crudier CRM — Attendance Repository
 * ============================================================
 */

const { ObjectId } = require('mongodb');
const { getDb } = require('../../../config/db');

const COLLECTION_NAME = 'attendance';

const attendanceRepository = {
  /**
   * Find attendance record for a user on a specific date.
   * @param {string} userId
   * @param {string} date - format YYYY-MM-DD
   */
  findByUserAndDate: async (userId, date) => {
    const db = getDb();
    return db.collection(COLLECTION_NAME).findOne({
      userId: new ObjectId(userId),
      date,
    });
  },

  /**
   * Create check-in record.
   */
  createCheckIn: async (userId, workspaceId, date, checkInTime, status) => {
    const db = getDb();
    const record = {
      userId: new ObjectId(userId),
      workspaceId: new ObjectId(workspaceId),
      checkIn: new Date(checkInTime),
      checkOut: null,
      totalHours: 0.0,
      status,
      date,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection(COLLECTION_NAME).insertOne(record);
    return { _id: result.insertedId, ...record };
  },

  /**
   * Perform checkout.
   */
  updateCheckOut: async (recordId, checkOutTime, totalHours, status) => {
    const db = getDb();
    const update = {
      checkOut: new Date(checkOutTime),
      totalHours: parseFloat(totalHours.toFixed(2)),
      updatedAt: new Date(),
    };
    if (status) update.status = status;

    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(recordId) },
      { $set: update }
    );

    return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(recordId) });
  },

  /**
   * Get paginated attendance history for a user.
   */
  getHistory: async (userId, startDate, endDate, limit, skip) => {
    const db = getDb();
    const query = { userId: new ObjectId(userId) };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const cursor = db.collection(COLLECTION_NAME)
      .find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const records = await cursor.toArray();
    const totalCount = await db.collection(COLLECTION_NAME).countDocuments(query);

    return { records, totalCount };
  },

  /**
   * Admin Report: Workspace-wide per-user breakdown using aggregation.
   * Return array of objects with user details, counts of statuses, and avg hours.
   */
  getWorkspaceReport: async (workspaceId) => {
    const db = getDb();

    // Pipeline groups all attendance records for a workspace by user,
    // joins with the user profile to fetch name/email, and aggregates stats.
    const pipeline = [
      {
        $match: { workspaceId: new ObjectId(workspaceId) }
      },
      {
        $group: {
          _id: '$userId',
          totalDays: { $sum: 1 },
          presentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
          },
          lateCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] }
          },
          halfDayCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Half Day'] }, 1, 0] }
          },
          absentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
          },
          avgHours: { $avg: '$totalHours' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userProfile'
        }
      },
      {
        $unwind: '$userProfile'
      },
      {
        $project: {
          _id: 1,
          name: '$userProfile.name',
          email: '$userProfile.email',
          totalDays: 1,
          presentCount: 1,
          lateCount: 1,
          halfDayCount: 1,
          absentCount: 1,
          avgHours: { $round: ['$avgHours', 2] }
        }
      }
    ];

    return db.collection(COLLECTION_NAME).aggregate(pipeline).toArray();
  },

  /**
   * Workspace Analytics: attendance rate, punctuality, and 30-day trends.
   */
  getWorkspaceAnalytics: async (workspaceId) => {
    const db = getDb();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    // Pipeline to group daily counts for the last 30 days
    const trendPipeline = [
      {
        $match: {
          workspaceId: new ObjectId(workspaceId),
          date: { $gte: thirtyDaysAgoStr }
        }
      },
      {
        $group: {
          _id: '$date',
          present: {
            $sum: { $cond: [{ $in: ['$status', ['Present', 'Late', 'Half Day']] }, 1, 0] }
          },
          late: {
            $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] }
          },
          total: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];

    const trend = await db.collection(COLLECTION_NAME).aggregate(trendPipeline).toArray();

    // General counts for rate calculations
    const statsPipeline = [
      {
        $match: { workspaceId: new ObjectId(workspaceId) }
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          presentRecords: {
            $sum: { $cond: [{ $in: ['$status', ['Present', 'Late', 'Half Day']] }, 1, 0] }
          },
          onTimeRecords: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
          }
        }
      }
    ];

    const statsResult = await db.collection(COLLECTION_NAME).aggregate(statsPipeline).toArray();
    
    let attendanceRate = 100;
    let punctualityRate = 100;

    if (statsResult.length > 0) {
      const stats = statsResult[0];
      attendanceRate = stats.totalRecords > 0 ? (stats.presentRecords / stats.totalRecords) * 100 : 100;
      punctualityRate = stats.presentRecords > 0 ? (stats.onTimeRecords / stats.presentRecords) * 100 : 100;
    }

    return {
      attendanceRate: parseFloat(attendanceRate.toFixed(2)),
      punctualityRate: parseFloat(punctualityRate.toFixed(2)),
      trend: trend.map((t) => ({
        date: t._id,
        presentRate: t.total > 0 ? parseFloat(((t.present / t.total) * 100).toFixed(2)) : 100,
        lateRate: t.present > 0 ? parseFloat(((t.late / t.present) * 100).toFixed(2)) : 0,
      })),
    };
  },
};

module.exports = attendanceRepository;
