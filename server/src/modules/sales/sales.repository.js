/**
 * ============================================================
 * Crudier CRM — Sales Repository
 * ============================================================
 */

const { ObjectId } = require('mongodb');
const { getDb } = require('../../../config/db');

const COLLECTION_NAME = 'leads';

const salesRepository = {
  /**
   * Create text index on startup.
   */
  createIndexes: async () => {
    const db = getDb();
    try {
      await db.collection(COLLECTION_NAME).createIndex(
        { companyName: 'text', contactPerson: 'text' },
        { name: 'LeadsTextIndex' }
      );
      console.log('[MongoDB] ✓ Leads text index verified.');
    } catch (err) {
      console.error('[MongoDB] Failed to create Leads text index:', err.message);
    }
  },

  /**
   * Find lead by ID.
   */
  findById: async (id) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();
    return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
  },

  /**
   * Create a new lead.
   */
  createLead: async (leadData) => {
    const db = getDb();
    const cleanData = {
      companyName: leadData.companyName.trim(),
      contactPerson: leadData.contactPerson.trim(),
      email: leadData.email ? leadData.email.toLowerCase().trim() : '',
      phone: leadData.phone || '',
      assignedTo: leadData.assignedTo ? new ObjectId(leadData.assignedTo) : null,
      workspaceId: new ObjectId(leadData.workspaceId),
      status: leadData.status || 'New Lead', // New Lead, Contacted, Meeting Scheduled, Negotiation, Closed Won, Closed Lost
      estimatedValue: parseFloat(leadData.estimatedValue) || 0.0,
      notes: [],
      followUpDate: leadData.followUpDate ? new Date(leadData.followUpDate) : null,
      proposalUrl: leadData.proposalUrl || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(cleanData);
    return { _id: result.insertedId, ...cleanData };
  },

  /**
   * Find leads with filters, text search, sorting, and pagination.
   */
  findLeads: async (workspaceId, filters, search, limit, skip) => {
    const db = getDb();
    const query = { workspaceId: new ObjectId(workspaceId) };

    // Filters
    if (filters.status) query.status = filters.status;
    if (filters.assignedTo) query.assignedTo = new ObjectId(filters.assignedTo);

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const cursor = db.collection(COLLECTION_NAME)
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const leads = await cursor.toArray();
    const totalCount = await db.collection(COLLECTION_NAME).countDocuments(query);

    return { leads, totalCount };
  },

  /**
   * Update lead fields.
   */
  updateLead: async (id, updateData) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();

    const cleanUpdate = { ...updateData, updatedAt: new Date() };
    if (cleanUpdate.assignedTo) {
      cleanUpdate.assignedTo = new ObjectId(cleanUpdate.assignedTo);
    }
    if (cleanUpdate.estimatedValue !== undefined) {
      cleanUpdate.estimatedValue = parseFloat(cleanUpdate.estimatedValue) || 0.0;
    }
    if (cleanUpdate.followUpDate) {
      cleanUpdate.followUpDate = new Date(cleanUpdate.followUpDate);
    }

    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { $set: cleanUpdate }
    );
    return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
  },

  /**
   * Add a note to a lead.
   */
  addNote: async (leadId, text, creatorId) => {
    if (!ObjectId.isValid(leadId)) return null;
    const db = getDb();

    const note = {
      text: text.trim(),
      createdBy: new ObjectId(creatorId),
      createdAt: new Date(),
    };

    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(leadId) },
      {
        $push: { notes: note },
        $set: { updatedAt: new Date() },
      }
    );
    return note;
  },

  /**
   * Delete lead.
   */
  deleteLead: async (id) => {
    if (!ObjectId.isValid(id)) return false;
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },

  /**
   * Groups leads by status returning count and total estimatedValue per stage.
   */
  getPipelineData: async (workspaceId) => {
    const db = getDb();
    // Aggregation groups leads by their status stage
    const pipeline = [
      {
        $match: { workspaceId: new ObjectId(workspaceId) }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$estimatedValue' }
        }
      },
      {
        $project: {
          stage: '$_id',
          count: 1,
          totalValue: { $round: ['$totalValue', 2] },
          _id: 0
        }
      }
    ];

    return db.collection(COLLECTION_NAME).aggregate(pipeline).toArray();
  },

  /**
   * Sales CRM Analytics (conversion, revenue, deal values, and 6-month trends).
   */
  getCRMAnalytics: async (workspaceId) => {
    const db = getDb();

    const baseMatch = { workspaceId: new ObjectId(workspaceId) };
    const leads = await db.collection(COLLECTION_NAME).find(baseMatch).toArray();
    const totalLeads = leads.length;

    if (totalLeads === 0) {
      return {
        totalLeads: 0,
        conversionRate: 0.0,
        totalRevenue: 0.0,
        averageDealValue: 0.0,
        winLossRatio: 0.0,
        trend: [],
      };
    }

    // ── Pipeline Aggregations ─────────────────────────────
    const mainStatsPipeline = [
      {
        $match: baseMatch
      },
      {
        $group: {
          _id: null,
          totalEstimatedValue: { $sum: '$estimatedValue' },
          wonLeadsCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Closed Won'] }, 1, 0] }
          },
          lostLeadsCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Closed Lost'] }, 1, 0] }
          },
          wonRevenue: {
            $sum: { $cond: [{ $eq: ['$status', 'Closed Won'] }, '$estimatedValue', 0] }
          }
        }
      }
    ];

    const mainStatsResult = await db.collection(COLLECTION_NAME).aggregate(mainStatsPipeline).toArray();
    const stats = mainStatsResult[0] || {
      totalEstimatedValue: 0,
      wonLeadsCount: 0,
      lostLeadsCount: 0,
      wonRevenue: 0,
    };

    const conversionRate = totalLeads > 0 ? (stats.wonLeadsCount / totalLeads) * 100 : 0.0;
    const averageDealValue = totalLeads > 0 ? stats.totalEstimatedValue / totalLeads : 0.0;
    const winLossRatio = stats.lostLeadsCount > 0 ? stats.wonLeadsCount / stats.lostLeadsCount : stats.wonLeadsCount;

    // 6-month trend pipeline
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trendPipeline = [
      {
        $match: {
          workspaceId: new ObjectId(workspaceId),
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          estimatedValue: { $sum: '$estimatedValue' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ];

    const trendResult = await db.collection(COLLECTION_NAME).aggregate(trendPipeline).toArray();

    return {
      totalLeads,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      totalRevenue: parseFloat(stats.wonRevenue.toFixed(2)),
      averageDealValue: parseFloat(averageDealValue.toFixed(2)),
      winLossRatio: parseFloat(winLossRatio.toFixed(2)),
      trend: trendResult.map((t) => ({
        month: `${t._id.year}-${String(t._id.month).padStart(2, '0')}`,
        newLeadsCount: t.count,
        value: parseFloat(t.estimatedValue.toFixed(2)),
      })),
    };
  },

  /**
   * Get follow-up list for the next 7 days.
   */
  getUpcomingFollowUps: async (workspaceId) => {
    const db = getDb();
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    return db.collection(COLLECTION_NAME)
      .find({
        workspaceId: new ObjectId(workspaceId),
        followUpDate: { $gte: now, $lte: sevenDaysLater },
      })
      .sort({ followUpDate: 1 })
      .toArray();
  },
};

module.exports = salesRepository;
