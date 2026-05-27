/**
 * ============================================================
 * Crudier CRM — Analytics Controller
 * ============================================================
 * Aggregates analytical data across leads, tasks, activity logs,
 * and meetings to compile a unified workspace dashboard.
 */

const Task = require('../models/task.model');
const Lead = require('../models/lead.model');
const Meeting = require('../models/meeting.model');
const Activity = require('../models/activity.model');
const { success } = require('../utils/apiResponse');
const mongoose = require('mongoose');

/**
 * Get unified dashboard analytics.
 * GET /api/v1/analytics/dashboard
 */
const getWorkspaceDashboardStats = async (req, res) => {
  const workspaceId = req.user.workspaceId;
  if (!workspaceId) {
    return res.status(200).json(
      success('No active workspace associated with user.', {
        tasksCount: { Pending: 0, 'In Progress': 0, Submitted: 0, Review: 0, Approved: 0, Rejected: 0, Blocked: 0 },
        pipeline: [],
        leadsSummary: { totalCount: 0, estimatedTotalValue: 0 },
        upcomingMeetingsCount: 0,
        recentActivities: [],
      })
    );
  }

  const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);

  // 1. Task status aggregation
  const tasksAgg = await Task.aggregate([
    { $match: { workspaceId: workspaceObjectId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  const tasksCount = { Pending: 0, 'In Progress': 0, Submitted: 0, Review: 0, Approved: 0, Rejected: 0, Blocked: 0 };
  tasksAgg.forEach((item) => {
    if (tasksCount[item._id] !== undefined) {
      tasksCount[item._id] = item.count;
    }
  });

  // 2. CRM Leads pipeline aggregation
  const leadsAgg = await Lead.aggregate([
    { $match: { workspaceId: workspaceObjectId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$estimatedValue' },
      },
    },
  ]);
  const pipeline = leadsAgg.map((item) => ({
    stage: item._id,
    count: item.count,
    totalValue: Math.round(item.totalValue * 100) / 100,
  }));

  // 3. Leads summaries
  const totalLeadsCount = pipeline.reduce((sum, item) => sum + item.count, 0);
  const estimatedTotalValue = pipeline.reduce((sum, item) => sum + item.totalValue, 0);

  // 4. Upcoming Meetings Count (Meetings after now)
  const upcomingMeetingsCount = await Meeting.countDocuments({
    workspaceId: workspaceObjectId,
    startTime: { $gte: new Date() },
    status: 'Scheduled',
  });

  // 5. Recent workspace activities (last 5 actions)
  const recentActivities = await Activity.find({ workspaceId: workspaceObjectId })
    .populate('userId', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(5);

  const dashboardData = {
    tasksCount,
    pipeline,
    leadsSummary: {
      totalCount: totalLeadsCount,
      estimatedTotalValue,
    },
    upcomingMeetingsCount,
    recentActivities,
  };

  return res.status(200).json(
    success('Workspace dashboard analytics compiled successfully.', dashboardData)
  );
};

module.exports = {
  getWorkspaceDashboardStats,
};
