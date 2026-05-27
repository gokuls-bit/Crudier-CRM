/**
 * ============================================================
 * Crudier CRM — Task Controller
 * ============================================================
 */

const taskService = require('./task.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const { getPaginationOptions, formatPaginatedResponse } = require('../../utils/paginate');

const taskController = {
  /**
   * Create task.
   */
  create: async (req, res) => {
    const task = await taskService.create(req.body, req.user);
    return ApiResponse.success(res, 'Task created successfully.', task, 201);
  },

  /**
   * Get single task.
   */
  getById: async (req, res) => {
    const task = await taskService.getById(req.params.id);
    return ApiResponse.success(res, 'Task details fetched successfully.', task);
  },

  /**
   * List workspace tasks.
   */
  list: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const { assignedTo, priority, status, deadlineStart, deadlineEnd, search, sortBy, sortOrder } = req.query;
    const filters = { assignedTo, priority, status, deadlineStart, deadlineEnd };

    const sort = {
      field: sortBy === 'deadline' ? 'deadline' : 'createdAt',
      order: sortOrder === 'desc' ? 'desc' : 'asc',
    };

    const { limit, skip, page } = getPaginationOptions(req.query);

    const { tasks, totalCount } = await taskService.list(workspaceId, filters, search, sort, limit, skip);
    const paginated = formatPaginatedResponse(tasks, totalCount, page, limit);

    return ApiResponse.success(res, 'Tasks fetched successfully.', paginated);
  },

  /**
   * Update task fields.
   */
  update: async (req, res) => {
    const task = await taskService.update(req.params.id, req.body, req.user._id);
    return ApiResponse.success(res, 'Task updated successfully.', task);
  },

  /**
   * Delete task.
   */
  delete: async (req, res) => {
    await taskService.delete(req.params.id);
    return ApiResponse.success(res, 'Task deleted successfully.');
  },

  /**
   * Add a comment.
   */
  addComment: async (req, res) => {
    const { text } = req.body;
    const comment = await taskService.addComment(req.params.id, req.user._id, req.user.name, text);
    return ApiResponse.success(res, 'Comment added successfully.', comment, 201);
  },

  /**
   * Delete comment.
   */
  deleteComment: async (req, res) => {
    const { id, cid } = req.params;
    await taskService.deleteComment(id, cid, req.user);
    return ApiResponse.success(res, 'Comment deleted successfully.');
  },

  /**
   * Add attachment.
   */
  uploadAttachment: async (req, res) => {
    if (!req.file) throw new ApiError('No file uploaded or file format is invalid.', 400);
    await taskService.addAttachment(req.params.id, req.file, req.user._id);
    return ApiResponse.success(res, 'Attachment uploaded successfully.');
  },

  /**
   * Update task status.
   */
  updateStatus: async (req, res) => {
    const { status } = req.body;
    if (!status) throw new ApiError('Status field is required.', 400);

    const task = await taskService.updateStatus(req.params.id, status, req.user);
    return ApiResponse.success(res, 'Task status updated successfully.', {
      taskId: task._id,
      status: task.status,
    });
  },

  /**
   * Get task history.
   */
  getHistory: async (req, res) => {
    const logs = await taskService.getHistory(req.params.id);
    return ApiResponse.success(res, 'Task activity logs fetched.', logs);
  },
};

module.exports = taskController;
