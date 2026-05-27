/**
 * ============================================================
 * Crudier CRM — Task Service
 * ============================================================
 */

const ApiError = require('../../utils/apiError');
const taskRepository = require('./task.repository');
const notificationService = require('../notifications/notification.service');

const taskService = {
  /**
   * Create a new task.
   */
  create: async (taskData, actor) => {
    const task = await taskRepository.createTask({
      ...taskData,
      assignedBy: actor._id,
      workspaceId: actor.workspaceId,
    });

    // Notify assignee
    if (task.assignedTo) {
      await notificationService.createNotification(task.assignedTo, {
        title: 'New Task Assigned',
        message: `You have been assigned a new task: "${task.title}".`,
        type: 'task_assigned',
        metadata: { taskId: task._id },
      });
    }

    return task;
  },

  /**
   * Get task details.
   */
  getById: async (id) => {
    const task = await taskRepository.findById(id);
    if (!task) throw new ApiError('Task not found.', 404);
    return task;
  },

  /**
   * List workspace tasks.
   */
  list: async (workspaceId, filters, search, sort, limit, skip) => {
    return taskRepository.findWorkspaceTasks(workspaceId, filters, search, sort, limit, skip);
  },

  /**
   * Update task details (title, description, priority, deadline, assignedTo).
   */
  update: async (id, updateData, actorId) => {
    const task = await taskRepository.findById(id);
    if (!task) throw new ApiError('Task not found.', 404);

    const oldAssignedTo = task.assignedTo ? task.assignedTo.toString() : null;

    const updatedTask = await taskRepository.updateTask(id, updateData);
    await taskRepository.logActivity(id, 'task_updated', actorId);

    // Notify new assignee if changed
    const newAssignedTo = updatedTask.assignedTo ? updatedTask.assignedTo.toString() : null;
    if (newAssignedTo && newAssignedTo !== oldAssignedTo) {
      await notificationService.createNotification(newAssignedTo, {
        title: 'Task Reassigned',
        message: `You have been assigned the task: "${updatedTask.title}".`,
        type: 'task_assigned',
        metadata: { taskId: updatedTask._id },
      });
    }

    return updatedTask;
  },

  /**
   * Delete task.
   */
  delete: async (id) => {
    const success = await taskRepository.deleteTask(id);
    if (!success) throw new ApiError('Failed to delete task.', 500);
    return true;
  },

  /**
   * Add a comment to task.
   */
  addComment: async (taskId, userId, userName, text) => {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new ApiError('Task not found.', 404);

    const comment = await taskRepository.addComment(taskId, userId, text);
    await taskRepository.logActivity(taskId, `comment_added: ${comment.commentId}`, userId);

    // Notify task assignee if someone else commented
    if (task.assignedTo && task.assignedTo.toString() !== userId.toString()) {
      await notificationService.createNotification(task.assignedTo, {
        title: 'New Comment on Task',
        message: `${userName} commented on task "${task.title}": "${text.substring(0, 30)}..."`,
        type: 'task_assigned',
        metadata: { taskId, commentId: comment.commentId },
      });
    }

    return comment;
  },

  /**
   * Delete a comment.
   */
  deleteComment: async (taskId, commentId, actor) => {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new ApiError('Task not found.', 404);

    const comment = task.comments.find((c) => c.commentId.toString() === commentId.toString());
    if (!comment) throw new ApiError('Comment not found.', 404);

    // Allow deleting if actor is the comment owner, workspace Admin, or Founder
    const isOwner = comment.userId.toString() === actor._id.toString();
    const isAdminOrFounder = ['Admin', 'Founder'].includes(actor.role);

    if (!isOwner && !isAdminOrFounder) {
      throw new ApiError('Access denied: You cannot delete this comment.', 403);
    }

    const success = await taskRepository.deleteComment(taskId, commentId);
    if (!success) throw new ApiError('Failed to delete comment.', 500);

    await taskRepository.logActivity(taskId, `comment_deleted: ${commentId}`, actor._id);
    return true;
  },

  /**
   * Add attachment to task.
   */
  addAttachment: async (taskId, file, actorId) => {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new ApiError('Task not found.', 404);

    const success = await taskRepository.addAttachment(taskId, file.path, file.filename);
    if (!success) throw new ApiError('Failed to upload attachment.', 500);

    await taskRepository.logActivity(taskId, `attachment_uploaded: ${file.filename}`, actorId);
    return true;
  },

  /**
   * Status change with strict role gates.
   */
  updateStatus: async (taskId, targetStatus, actor) => {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new ApiError('Task not found.', 404);

    const role = actor.role;

    // Strict Role Gates
    // Developers/Designers → In Progress, Submitted
    // Team Leads → Review, Approved, Rejected
    // Founders/Admins → Blocked (and any status)
    
    const devDesignerAllowed = ['In Progress', 'Submitted'];
    const teamLeadAllowed = ['Review', 'Approved', 'Rejected'];
    const adminFounderAllowed = ['Pending', 'In Progress', 'Submitted', 'Review', 'Approved', 'Rejected', 'Blocked'];

    let isAllowed = false;
    if (['Founder', 'Admin'].includes(role)) {
      isAllowed = adminFounderAllowed.includes(targetStatus);
    } else if (role === 'Team Lead') {
      isAllowed = teamLeadAllowed.includes(targetStatus);
    } else if (['Developer', 'Designer'].includes(role)) {
      isAllowed = devDesignerAllowed.includes(targetStatus);
    }

    if (!isAllowed) {
      throw new ApiError(`Access denied: Role "${role}" cannot transition task status to "${targetStatus}".`, 403);
    }

    // Perform update
    const updatedTask = await taskRepository.updateTask(taskId, { status: targetStatus });
    await taskRepository.logActivity(taskId, `status_changed: ${targetStatus}`, actor._id);

    // Notify assignee / submitter
    if (updatedTask.assignedTo) {
      const type = targetStatus === 'Approved' ? 'submission_approved' : 'task_assigned';
      await notificationService.createNotification(updatedTask.assignedTo, {
        title: `Task Status: ${targetStatus}`,
        message: `Task "${updatedTask.title}" has been updated to status: ${targetStatus}.`,
        type,
        metadata: { taskId: updatedTask._id, status: targetStatus },
      });
    }

    // Realtime notification broadcast
    if (global.io) {
      global.io.to(`workspace_${actor.workspaceId.toString()}`).emit('task_status_updated', {
        taskId: updatedTask._id,
        status: targetStatus,
        actorId: actor._id,
      });
    }

    return updatedTask;
  },

  /**
   * Get activity logs.
   */
  getHistory: async (id) => {
    const task = await taskRepository.findById(id);
    if (!task) throw new ApiError('Task not found.', 404);
    return task.activityLogs;
  },
};

module.exports = taskService;
