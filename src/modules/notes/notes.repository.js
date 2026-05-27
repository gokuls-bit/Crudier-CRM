/**
 * ============================================================
 * Crudier CRM — Notes Repository
 * ============================================================
 */

const { ObjectId } = require('mongodb');
const { getDb } = require('../../../config/db');

const COLLECTION_NAME = 'notes';

const notesRepository = {
  /**
   * Create text indexes on startup.
   */
  createIndexes: async () => {
    const db = getDb();
    try {
      await db.collection(COLLECTION_NAME).createIndex(
        { title: 'text', content: 'text' },
        { name: 'NotesTextIndex' }
      );
      console.log('[MongoDB] ✓ Notes text index verified.');
    } catch (err) {
      console.error('[MongoDB] Failed to create Notes text index:', err.message);
    }
  },

  /**
   * Find note by ID.
   */
  findById: async (id) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();
    return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
  },

  /**
   * Create a new note.
   */
  createNote: async (noteData) => {
    const db = getDb();
    const cleanData = {
      title: noteData.title.trim(),
      content: noteData.content || '',
      createdBy: new ObjectId(noteData.createdBy),
      creatorDepartment: noteData.creatorDepartment || null,
      workspaceId: new ObjectId(noteData.workspaceId),
      tags: Array.isArray(noteData.tags) ? noteData.tags.map((t) => t.trim()) : [],
      visibility: noteData.visibility || 'workspace', // private / workspace / team
      archived: false,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(cleanData);
    return { _id: result.insertedId, ...cleanData };
  },

  /**
   * Update note fields.
   */
  updateNote: async (id, updateData) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();
    const cleanUpdate = { ...updateData, updatedAt: new Date() };

    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { $set: cleanUpdate }
    );
    return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
  },

  /**
   * Delete note.
   */
  deleteNote: async (id) => {
    if (!ObjectId.isValid(id)) return false;
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },

  /**
   * Add a comment.
   */
  addComment: async (noteId, userId, text) => {
    if (!ObjectId.isValid(noteId)) return null;
    const db = getDb();
    
    const comment = {
      commentId: new ObjectId(),
      userId: new ObjectId(userId),
      text: text.trim(),
      createdAt: new Date(),
    };

    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(noteId) },
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
  deleteComment: async (noteId, commentId) => {
    if (!ObjectId.isValid(noteId) || !ObjectId.isValid(commentId)) return false;
    const db = getDb();

    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(noteId) },
      {
        $pull: { comments: { commentId: new ObjectId(commentId) } },
        $set: { updatedAt: new Date() },
      }
    );
    return result.modifiedCount > 0;
  },

  /**
   * Find notes based on filters, pagination, and visibility rules.
   */
  findNotes: async (workspaceId, user, filters, limit, skip) => {
    const db = getDb();
    
    // Base query scoped to workspace
    const query = {
      workspaceId: new ObjectId(workspaceId),
    };

    // Archived status filter (default to false if not set to true)
    query.archived = filters.archived === true;

    // Filter by tags
    if (filters.tag) {
      query.tags = filters.tag;
    }

    // Filter by creator
    if (filters.createdBy) {
      query.createdBy = new ObjectId(filters.createdBy);
    }

    // Enforce visibility rules in the database query
    // 1. Private → Only accessible to creator
    // 2. Workspace → Accessible to all members
    // 3. Team → Accessible if same department
    const userDept = user.department || null;
    
    const visibilityClauses = [
      { visibility: 'workspace' },
      { visibility: 'private', createdBy: user._id },
    ];

    if (userDept) {
      visibilityClauses.push({
        visibility: 'team',
        creatorDepartment: userDept,
      });
    }

    // Combine using $and (scoped to workspace + visibility)
    query.$and = [
      {
        $or: visibilityClauses,
      },
    ];

    const cursor = db.collection(COLLECTION_NAME)
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const notes = await cursor.toArray();
    const totalCount = await db.collection(COLLECTION_NAME).countDocuments(query);

    return { notes, totalCount };
  },

  /**
   * Full-text search on title and content sorted by text relevance score.
   */
  searchText: async (workspaceId, user, searchString, limit, skip) => {
    const db = getDb();

    const userDept = user.department || null;
    const visibilityClauses = [
      { visibility: 'workspace' },
      { visibility: 'private', createdBy: user._id },
    ];
    if (userDept) {
      visibilityClauses.push({
        visibility: 'team',
        creatorDepartment: userDept,
      });
    }

    const query = {
      workspaceId: new ObjectId(workspaceId),
      archived: false,
      $text: { $search: searchString },
      $or: visibilityClauses,
    };

    const projection = {
      score: { $meta: 'textScore' },
    };

    const cursor = db.collection(COLLECTION_NAME)
      .find(query)
      .project(projection)
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit);

    const notes = await cursor.toArray();
    
    // Count matches
    const totalCount = await db.collection(COLLECTION_NAME).countDocuments(query);

    return { notes, totalCount };
  },
};

module.exports = notesRepository;
