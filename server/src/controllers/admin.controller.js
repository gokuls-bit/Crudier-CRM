/**
 * ============================================================
 * Crudier CRM — Admin Controller
 * ============================================================
 * Handles platform management, system diagnostics, paginated
 * audit logs retrieval, and user account status updates.
 */

const os = require('os');
const User = require('../models/user.model');
const Workspace = require('../models/workspace.model');
const AuditLog = require('../models/auditLog.model');
const { getPaginationOptions, formatPaginatedResponse } = require('../utils/paginate');
const { success } = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const mongoose = require('mongoose');
const redisClient = require('../../config/redis');

/**
 * Get system statistics and diagnostics.
 * GET /api/v1/admin/stats
 */
const getSystemStats = async (req, res) => {
  const uptime = process.uptime();
  const freeMem = os.freemem();
  const totalMem = os.totalmem();
  const usedMem = totalMem - freeMem;

  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const redisStatus = redisClient && redisClient.isOpen ? 'connected' : 'disconnected';

  const stats = {
    platform: os.platform(),
    arch: os.arch(),
    cpusCount: os.cpus().length,
    cpuLoadAverage: os.loadavg(),
    memory: {
      total: `${Math.round(totalMem / 1024 / 1024)}MB`,
      used: `${Math.round(usedMem / 1024 / 1024)}MB`,
      free: `${Math.round(freeMem / 1024 / 1024)}MB`,
      ratio: `${Math.round((usedMem / totalMem) * 100)}%`,
    },
    process: {
      pid: process.pid,
      uptime: `${Math.floor(uptime)}s`,
      memoryUsage: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      },
    },
    databases: {
      mongodb: mongoStatus,
      redis: redisStatus,
    },
  };

  return res.status(200).json(
    success('System diagnostics retrieved successfully.', stats)
  );
};

/**
 * Get paginated audit logs.
 * GET /api/v1/admin/audit-logs
 */
const getAuditLogs = async (req, res) => {
  const { limit, skip, page } = getPaginationOptions(req.query);
  const query = {};

  if (req.query.action) {
    query.action = req.query.action;
  }
  if (req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
    query.userId = new mongoose.Types.ObjectId(req.query.userId);
  }

  const logs = await AuditLog.find(query)
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalCount = await AuditLog.countDocuments(query);
  const responseData = formatPaginatedResponse(logs, totalCount, page, limit);

  return res.status(200).json(
    success('Audit logs retrieved successfully.', responseData)
  );
};

/**
 * Toggle user activation status (enable / disable).
 * PATCH /api/v1/admin/users/:userId/status
 */
const manageUserStatus = async (req, res, next) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return next(new ApiError('Please provide an isActive boolean flag.', 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new ApiError('User not found.', 404));
  }

  user.isActive = isActive;
  await user.save();

  return res.status(200).json(
    success(`User account has been successfully ${isActive ? 'activated' : 'deactivated'}.`, {
      userId: user._id,
      email: user.email,
      isActive: user.isActive,
    })
  );
};

/**
 * Get paginated list of workspaces.
 * GET /api/v1/admin/workspaces
 */
const listAllWorkspaces = async (req, res) => {
  const { limit, skip, page } = getPaginationOptions(req.query);
  
  const workspaces = await Workspace.find({})
    .populate('ownerId', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalCount = await Workspace.countDocuments({});
  const responseData = formatPaginatedResponse(workspaces, totalCount, page, limit);

  return res.status(200).json(
    success('Workspaces list retrieved successfully.', responseData)
  );
};

module.exports = {
  getSystemStats,
  getAuditLogs,
  manageUserStatus,
  listAllWorkspaces,
};
