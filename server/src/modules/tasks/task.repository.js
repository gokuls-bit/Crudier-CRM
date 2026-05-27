/**
 * ============================================================
 * Crudier CRM — Task Repository
 * ============================================================
 */

const { ObjectId } = require('mongodb');
const { getDb } = require('../../../config/db');

const COLLECTION_NAME = 'tasks';

const taskRepository = {
  /**
   * Find task by ID.
   */
  findById: async (id) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();
    return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
  },

  /**
   * Create task.
   */
  createTask: async (taskData) => {
    const db = getDb();
    const cleanData = {
      title: taskData.title.trim(),
      description: taskData.description || '',
      assignedTo: taskData.assignedTo ? new ObjectId(taskData.assignedTo) : null,
      assignedBy: new ObjectId(taskData.assignedBy),
      workspaceId: new ObjectId(taskData.workspaceId),
      priority: taskData.priority || 'Medium',
      status: taskData.status || 'Pending',
      deadline: taskData.deadline ? new Date(taskData.deadline) : null,
      attachments: taskData.attachments || [],
      comments: [],
      activityLogs: [
        {
          action: 'task_created',
          actorId: new ObjectId(taskData.assignedBy),
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection(COLLECTION_NAME).insertOne(cleanData);
    return { _id: result.insertedId, ...cleanData };
  },

  /**
   * Find tasks inside workspace with filtering, pagination, sorting.
   */
  findWorkspaceTasks: async (workspaceId, filters, search, sort, limit, skip) => {
    const db = getDb();
    const query = { workspaceId: new ObjectId(workspaceId) };

    // Filters
    if (filters.assignedTo) {
      query.assignedTo = new ObjectId(filters.assignedTo);
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.deadlineStart || filters.deadlineEnd) {
      query.deadline = {};
      if (filters.deadlineStart) query.deadline.$gte = new Date(filters.deadlineStart);
      if (filters.deadlineEnd) query.deadline.$lte = new Date(filters.deadlineEnd);
    }

    // Title search
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Sort options
    const sortOption = {};
    if (sort.field === 'deadline') {
      sortOption.deadline = sort.order === 'desc' ? -1 : 1;
    } else {
      sortOption.createdAt = sort.order === 'desc' ? -1 : 1;
    }

    const cursor = db.collection(COLLECTION_NAME)
      .find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const tasks = await cursor.toArray();
    const totalCount = await db.collection(COLLECTION_NAME).countDocuments(query);

    return { tasks, totalCount };
  },

  /**
   * Update task fields.
   */
  updateTask: async (id, updateData) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();
    
    const cleanUpdate = { ...updateData, updatedAt: new Date() };
    if (cleanUpdate.assignedTo) {
      cleanUpdate.assignedTo = new ObjectId(cleanUpdate.assignedTo);
    }
    if (cleanUpdate.deadline) {
      cleanUpdate.deadline = new Date(cleanUpdate.deadline);
    }

    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { $set: cleanUpdate }
    );

    return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
  },

  /**
   * Delete task.
   */
  deleteTask: async (id) => {
    if (!ObjectId.isValid(id)) return false;
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },

  /**
   * Log an activity in the task sub-document array.
   */
  logActivity: async (taskId, action, actorId) => {
    if (!ObjectId.isValid(taskId)) return false;
    const db = getDb();

    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(taskId) },
      {
        $push: {
          activityLogs: {
            action,
            actorId: new ObjectId(actorId),
            timestamp: new Date(),
          },
        },
        $set: { updatedAt: new Date() },
      }
    );
    return result.modifiedCount > 0;
  },

  /**
   * Add a comment.
   */
  addComment: async (taskId, userId, text) => {
    if (!ObjectId.isValid(taskId)) return null;
    const db = getDb();
    
    const commentId = new ObjectId();
    const comment = {
      commentId,
      userId: new ObjectId(userId),
      text: text.trim(),
      createdAt: new Date(),
    };

    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(taskId) },
      {
        $push: { comments: comment },
        $set: { updatedAt: new Date() },
      }
    );

    return comment;
  },

  /**
   * Delete a comment.
   */
  deleteComment: async (taskId, commentId) => {
    if (!ObjectId.isValid(taskId) || !ObjectId.isValid(commentId)) return false;
    const db = getDb();

    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(taskId) },
      {
        $pull: { comments: { commentId: new ObjectId(commentId) } },
        $set: { updatedAt: new Date() },
      }
    );
    return result.modifiedCount > 0;
  },

  /**
   * Add an attachment.
   */
  addAttachment: async (taskId, filepath, filename) => {
    if (!ObjectId.isValid(taskId)) return false;
    const db = getDb();

    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(taskId) },
      {
        $push: {
          attachments: {
            url: `/uploads/tasks/${filename}`,
            originalName: filename,
            uploadedAt: new Date(),
          },
        },
        $set: { updatedAt: new Date() },
      }
    );
    return result.modifiedCount > 0;
  },
};

module.exports = taskRepository;
