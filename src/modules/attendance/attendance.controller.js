/**
 * ============================================================
 * Crudier CRM — Attendance Controller
 * ============================================================
 */

const attendanceService = require('./attendance.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const { getPaginationOptions, formatPaginatedResponse } = require('../../utils/paginate');

const attendanceController = {
  /**
   * Check in.
   */
  checkIn: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const record = await attendanceService.checkIn(req.user._id, workspaceId);
    return ApiResponse.success(res, 'Checked in successfully.', record, 201);
  },

  /**
   * Check out.
   */
  checkOut: async (req, res) => {
    const record = await attendanceService.checkOut(req.user._id);
    return ApiResponse.success(res, 'Checked out successfully.', record);
  },

  /**
   * Today's attendance.
   */
  today: async (req, res) => {
    const record = await attendanceService.getTodayStatus(req.user._id);
    return ApiResponse.success(res, 'Today\'s attendance fetched.', record);
  },

  /**
   * User history.
   */
  history: async (req, res) => {
    const { startDate, endDate } = req.query;
    const { limit, skip, page } = getPaginationOptions(req.query);

    const { records, totalCount } = await attendanceService.getUserHistory(
      req.user._id,
      startDate,
      endDate,
      limit,
      skip
    );

    const paginated = formatPaginatedResponse(records, totalCount, page, limit);
    return ApiResponse.success(res, 'Attendance history fetched.', paginated);
  },

  /**
   * Admin Report.
   */
  report: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const reportData = await attendanceService.getWorkspaceReport(workspaceId);
    return ApiResponse.success(res, 'Workspace attendance report fetched.', reportData);
  },

  /**
   * Analytics.
   */
  analytics: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const analyticsData = await attendanceService.getAnalytics(workspaceId);
    return ApiResponse.success(res, 'Workspace attendance analytics fetched.', analyticsData);
  },
};

module.exports = attendanceController;
