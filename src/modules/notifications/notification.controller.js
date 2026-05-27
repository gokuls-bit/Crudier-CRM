/**
 * ============================================================
 * Crudier CRM — Notification Controller
 * ============================================================
 */

const notificationService = require('./notification.service');
const ApiResponse = require('../../utils/apiResponse');
const { getPaginationOptions, formatPaginatedResponse } = require('../../utils/paginate');

const notificationController = {
  /**
   * List user notifications.
   */
  list: async (req, res) => {
    const { type, isRead } = req.query;
    const filters = {};
    if (type) filters.type = type;
    if (isRead !== undefined) filters.isRead = isRead === 'true';

    const { limit, skip, page } = getPaginationOptions(req.query);

    const { notifications, totalCount } = await notificationService.getUserNotifications(
      req.user._id,
      filters,
      limit,
      skip
    );

    const paginated = formatPaginatedResponse(notifications, totalCount, page, limit);
    return ApiResponse.success(res, 'Notifications fetched successfully.', paginated);
  },

  /**
   * Get unread notifications count.
   */
  unreadCount: async (req, res) => {
    const count = await notificationService.getUnreadCount(req.user._id);
    return ApiResponse.success(res, 'Unread count fetched.', { count });
  },

  /**
   * Mark notification as read.
   */
  markRead: async (req, res) => {
    const notification = await notificationService.markAsRead(req.params.id);
    return ApiResponse.success(res, 'Notification marked as read.', notification);
  },

  /**
   * Mark all notifications as read.
   */
  markAllRead: async (req, res) => {
    const count = await notificationService.markAllAsRead(req.user._id);
    return ApiResponse.success(res, `All notifications marked as read. Updated ${count} records.`);
  },

  /**
   * Delete single notification.
   */
  delete: async (req, res) => {
    await notificationService.delete(req.params.id);
    return ApiResponse.success(res, 'Notification deleted successfully.');
  },

  /**
   * Clear all user notifications.
   */
  clearAll: async (req, res) => {
    const count = await notificationService.clearAll(req.user._id);
    return ApiResponse.success(res, `Cleared all notifications. Deleted ${count} records.`);
  },
};

module.exports = notificationController;
