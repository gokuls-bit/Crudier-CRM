/**
 * ============================================================
 * Crudier CRM — Notes Controller
 * ============================================================
 */

const notesService = require('./notes.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const { getPaginationOptions, formatPaginatedResponse } = require('../../utils/paginate');

const notesController = {
  /**
   * Create note.
   */
  create: async (req, res) => {
    const note = await notesService.create(req.body, req.user);
    return ApiResponse.success(res, 'Note created successfully.', note, 201);
  },

  /**
   * Get note details.
   */
  getById: async (req, res) => {
    const note = await notesService.getById(req.params.id, req.user);
    return ApiResponse.success(res, 'Note details fetched.', note);
  },

  /**
   * List notes.
   */
  list: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const { tag, createdBy, archived } = req.query;
    const filters = {
      tag,
      createdBy,
      archived: archived === 'true',
    };

    const { limit, skip, page } = getPaginationOptions(req.query);

    const { notes, totalCount } = await notesService.list(workspaceId, req.user, filters, limit, skip);
    const paginated = formatPaginatedResponse(notes, totalCount, page, limit);

    return ApiResponse.success(res, 'Notes fetched successfully.', paginated);
  },

  /**
   * Update note details.
   */
  update: async (req, res) => {
    const note = await notesService.update(req.params.id, req.body, req.user);
    return ApiResponse.success(res, 'Note updated successfully.', note);
  },

  /**
   * Delete note.
   */
  delete: async (req, res) => {
    await notesService.delete(req.params.id, req.user);
    return ApiResponse.success(res, 'Note deleted successfully.');
  },

  /**
   * Archive note.
   */
  archive: async (req, res) => {
    const note = await notesService.archive(req.params.id, req.user);
    return ApiResponse.success(res, 'Note archived successfully.', note);
  },

  /**
   * Restore note.
   */
  restore: async (req, res) => {
    const note = await notesService.restore(req.params.id, req.user);
    return ApiResponse.success(res, 'Note restored successfully.', note);
  },

  /**
   * Add a comment.
   */
  addComment: async (req, res) => {
    const { text } = req.body;
    if (!text) throw new ApiError('Comment text is required.', 400);

    const comment = await notesService.addComment(req.params.id, text, req.user);
    return ApiResponse.success(res, 'Comment added successfully.', comment, 201);
  },

  /**
   * Delete comment.
   */
  deleteComment: async (req, res) => {
    const { id, cid } = req.params;
    await notesService.deleteComment(id, cid, req.user);
    return ApiResponse.success(res, 'Comment deleted successfully.');
  },

  /**
   * Search notes.
   */
  search: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const { q } = req.query;
    if (!q) throw new ApiError('Search query parameter "q" is required.', 400);

    const { limit, skip, page } = getPaginationOptions(req.query);

    const { notes, totalCount } = await notesService.search(workspaceId, req.user, q, limit, skip);
    const paginated = formatPaginatedResponse(notes, totalCount, page, limit);

    return ApiResponse.success(res, 'Search results fetched successfully.', paginated);
  },
};

module.exports = notesController;
