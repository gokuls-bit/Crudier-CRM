/**
 * ============================================================
 * Crudier CRM — Notes Service
 * ============================================================
 */

const ApiError = require('../../utils/apiError');
const notesRepository = require('./notes.repository');

const checkVisibility = (note, user) => {
  if (note.visibility === 'private') {
    return note.createdBy.toString() === user._id.toString();
  }
  if (note.visibility === 'team') {
    // Accessible if same department or if they are the creator
    const isCreator = note.createdBy.toString() === user._id.toString();
    const sameDept = user.department && note.creatorDepartment && user.department === note.creatorDepartment;
    return isCreator || sameDept;
  }
  // workspace is accessible to any workspace member (already passed workspace middleware)
  return true;
};

const checkEditPermissions = (note, user) => {
  const isCreator = note.createdBy.toString() === user._id.toString();
  const isAdminOrFounder = ['Admin', 'Founder'].includes(user.role);
  return isCreator || isAdminOrFounder;
};

const notesService = {
  /**
   * Create note.
   */
  create: async (noteData, actor) => {
    return notesRepository.createNote({
      ...noteData,
      createdBy: actor._id,
      creatorDepartment: actor.department || null,
      workspaceId: actor.workspaceId,
    });
  },

  /**
   * Get single note with authorization.
   */
  getById: async (id, actor) => {
    const note = await notesRepository.findById(id);
    if (!note) throw new ApiError('Note not found.', 404);

    if (!checkVisibility(note, actor)) {
      throw new ApiError('Access denied: You do not have permission to view this note.', 403);
    }

    return note;
  },

  /**
   * List notes.
   */
  list: async (workspaceId, actor, filters, limit, skip) => {
    return notesRepository.findNotes(workspaceId, actor, filters, limit, skip);
  },

  /**
   * Edit note.
   */
  update: async (id, updateData, actor) => {
    const note = await notesRepository.findById(id);
    if (!note) throw new ApiError('Note not found.', 404);

    if (!checkEditPermissions(note, actor)) {
      throw new ApiError('Access denied: You are not authorized to update this note.', 403);
    }

    const allowedUpdates = {};
    if (updateData.title) allowedUpdates.title = updateData.title.trim();
    if (updateData.content) allowedUpdates.content = updateData.content;
    if (updateData.tags) allowedUpdates.tags = updateData.tags;
    if (updateData.visibility) allowedUpdates.visibility = updateData.visibility;

    return notesRepository.updateNote(id, allowedUpdates);
  },

  /**
   * Delete note.
   */
  delete: async (id, actor) => {
    const note = await notesRepository.findById(id);
    if (!note) throw new ApiError('Note not found.', 404);

    if (!checkEditPermissions(note, actor)) {
      throw new ApiError('Access denied: You are not authorized to delete this note.', 403);
    }

    return notesRepository.deleteNote(id);
  },

  /**
   * Archive note.
   */
  archive: async (id, actor) => {
    const note = await notesRepository.findById(id);
    if (!note) throw new ApiError('Note not found.', 404);

    if (!checkEditPermissions(note, actor)) {
      throw new ApiError('Access denied: You are not authorized to archive this note.', 403);
    }

    return notesRepository.updateNote(id, { archived: true });
  },

  /**
   * Restore note.
   */
  restore: async (id, actor) => {
    const note = await notesRepository.findById(id);
    if (!note) throw new ApiError('Note not found.', 404);

    if (!checkEditPermissions(note, actor)) {
      throw new ApiError('Access denied: You are not authorized to restore this note.', 403);
    }

    return notesRepository.updateNote(id, { archived: false });
  },

  /**
   * Add a comment to a note.
   */
  addComment: async (noteId, text, actor) => {
    const note = await notesRepository.findById(noteId);
    if (!note) throw new ApiError('Note not found.', 404);

    if (!checkVisibility(note, actor)) {
      throw new ApiError('Access denied: You cannot view or comment on this note.', 403);
    }

    return notesRepository.addComment(noteId, actor._id, text);
  },

  /**
   * Delete comment from a note.
   */
  deleteComment: async (noteId, commentId, actor) => {
    const note = await notesRepository.findById(noteId);
    if (!note) throw new ApiError('Note not found.', 404);

    const comment = note.comments.find((c) => c.commentId.toString() === commentId.toString());
    if (!comment) throw new ApiError('Comment not found.', 404);

    // Can delete if creator of comment, creator of note, or Admin/Founder
    const isCommentCreator = comment.userId.toString() === actor._id.toString();
    const isNoteCreator = note.createdBy.toString() === actor._id.toString();
    const isAdminOrFounder = ['Admin', 'Founder'].includes(actor.role);

    if (!isCommentCreator && !isNoteCreator && !isAdminOrFounder) {
      throw new ApiError('Access denied: You are not authorized to delete this comment.', 403);
    }

    const success = await notesRepository.deleteComment(noteId, commentId);
    if (!success) throw new ApiError('Failed to delete comment.', 500);

    return true;
  },

  /**
   * Text search on notes.
   */
  search: async (workspaceId, actor, query, limit, skip) => {
    return notesRepository.searchText(workspaceId, actor, query, limit, skip);
  },
};

module.exports = notesService;
