/**
 * ============================================================
 * Crudier CRM — Meeting Controller
 * ============================================================
 */

const meetingService = require('./meeting.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const { getPaginationOptions, formatPaginatedResponse } = require('../../utils/paginate');

const meetingController = {
  /**
   * Create meeting.
   */
  create: async (req, res) => {
    const meeting = await meetingService.create(req.body, req.user);
    return ApiResponse.success(res, 'Meeting scheduled successfully.', meeting, 201);
  },

  /**
   * Get single meeting details.
   */
  getById: async (req, res) => {
    const meeting = await meetingService.getById(req.params.id);
    return ApiResponse.success(res, 'Meeting details fetched.', meeting);
  },

  /**
   * List meetings.
   */
  list: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const { status } = req.query;
    const { limit, skip, page } = getPaginationOptions(req.query);

    const { meetings, totalCount } = await meetingService.list(workspaceId, { status }, limit, skip);
    const paginated = formatPaginatedResponse(meetings, totalCount, page, limit);

    return ApiResponse.success(res, 'Meetings fetched successfully.', paginated);
  },

  /**
   * Update meeting fields.
   */
  update: async (req, res) => {
    const meeting = await meetingService.update(req.params.id, req.body, req.user);
    return ApiResponse.success(res, 'Meeting updated successfully.', meeting);
  },

  /**
   * Cancel meeting.
   */
  cancel: async (req, res) => {
    const meeting = await meetingService.cancel(req.params.id, req.user);
    return ApiResponse.success(res, 'Meeting cancelled and participants notified.', {
      meetingId: meeting._id,
      status: meeting.status,
    });
  },

  /**
   * RSVP update.
   */
  rsvp: async (req, res) => {
    const { status } = req.body;
    if (!status) throw new ApiError('RSVP status is required.', 400);

    await meetingService.submitRsvp(req.params.id, status, req.user._id);
    return ApiResponse.success(res, 'RSVP status submitted.');
  },

  /**
   * Post notes.
   */
  notes: async (req, res) => {
    const { notes } = req.body;
    if (!notes) throw new ApiError('Meeting notes content is required.', 400);

    const meeting = await meetingService.postNotes(req.params.id, notes, req.user);
    return ApiResponse.success(res, 'Meeting notes updated successfully.', {
      meetingId: meeting._id,
      notes: meeting.notes,
    });
  },

  /**
   * Get upcoming meetings.
   */
  upcoming: async (req, res) => {
    const meetings = await meetingService.getUpcoming(req.user._id);
    return ApiResponse.success(res, 'Upcoming meetings fetched.', meetings);
  },

  /**
   * List RSVPs.
   */
  attendance: async (req, res) => {
    const meeting = await meetingService.getById(req.params.id);
    return ApiResponse.success(res, 'Meeting attendance RSVPs fetched.', meeting.participants);
  },
};

module.exports = meetingController;
