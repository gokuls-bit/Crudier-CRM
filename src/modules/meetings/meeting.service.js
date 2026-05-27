/**
 * ============================================================
 * Crudier CRM — Meeting Service
 * ============================================================
 */

const ApiError = require('../../utils/apiError');
const meetingRepository = require('./meeting.repository');
const workspaceRepository = require('../workspace/workspace.repository');
const notificationService = require('../notifications/notification.service');

const meetingService = {
  /**
   * Create meeting.
   */
  create: async (meetingData, actor) => {
    const { title, startTime, endTime, meetingLink, participants } = meetingData;

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    // 1. Time validations
    if (start <= now) {
      throw new ApiError('Validation failed: Start time must be in the future.', 400);
    }
    if (end <= start) {
      throw new ApiError('Validation failed: End time must be after start time.', 400);
    }

    // 2. URL validation
    if (meetingLink && !/^https?:\/\/\S+$/.test(meetingLink)) {
      throw new ApiError('Validation failed: Invalid meeting link URL format.', 400);
    }

    // 3. Workspace member verification
    const workspace = await workspaceRepository.findById(actor.workspaceId);
    if (!workspace) throw new ApiError('Workspace not found.', 404);

    const workspaceMemberIds = workspace.members.map((m) => m.userId.toString());
    if (workspace.ownerId) {
      workspaceMemberIds.push(workspace.ownerId.toString());
    }

    const validParticipants = [];
    if (participants && Array.isArray(participants)) {
      for (const p of participants) {
        const idStr = p.userId ? p.userId.toString() : p.toString();
        if (!workspaceMemberIds.includes(idStr)) {
          throw new ApiError(`Validation failed: Participant ${idStr} is not a member of this workspace.`, 400);
        }
        validParticipants.push({ userId: idStr, rsvp: 'Pending' });
      }
    }

    const meeting = await meetingRepository.createMeeting({
      ...meetingData,
      organizerId: actor._id,
      workspaceId: actor.workspaceId,
      participants: validParticipants,
    });

    // 4. Send invitation notifications
    for (const p of validParticipants) {
      await notificationService.createNotification(p.userId, {
        title: 'New Meeting Invitation',
        message: `You have been invited to meeting: "${meeting.title}" scheduled for ${start.toLocaleString()}.`,
        type: 'meeting_reminder',
        metadata: { meetingId: meeting._id },
      });
    }

    return meeting;
  },

  /**
   * Get meeting by ID.
   */
  getById: async (id) => {
    const meeting = await meetingRepository.findById(id);
    if (!meeting) throw new ApiError('Meeting not found.', 404);
    return meeting;
  },

  /**
   * List meetings.
   */
  list: async (workspaceId, filters, limit, skip) => {
    return meetingRepository.findWorkspaceMeetings(workspaceId, filters, limit, skip);
  },

  /**
   * Update meeting (only organizer or Admin).
   */
  update: async (id, updateData, actor) => {
    const meeting = await meetingRepository.findById(id);
    if (!meeting) throw new ApiError('Meeting not found.', 404);

    const isOrganizer = meeting.organizerId.toString() === actor._id.toString();
    const isAdminOrFounder = ['Admin', 'Founder'].includes(actor.role);

    if (!isOrganizer && !isAdminOrFounder) {
      throw new ApiError('Access denied: Only the organizer or Admins can update this meeting.', 403);
    }

    return meetingRepository.updateMeeting(id, updateData);
  },

  /**
   * Cancel meeting (only organizer or Admin).
   */
  cancel: async (id, actor) => {
    const meeting = await meetingRepository.findById(id);
    if (!meeting) throw new ApiError('Meeting not found.', 404);

    const isOrganizer = meeting.organizerId.toString() === actor._id.toString();
    const isAdminOrFounder = ['Admin', 'Founder'].includes(actor.role);

    if (!isOrganizer && !isAdminOrFounder) {
      throw new ApiError('Access denied: Only the organizer or Admins can cancel this meeting.', 403);
    }

    const updatedMeeting = await meetingRepository.updateMeeting(id, { status: 'Cancelled' });

    // ── Notification Flow ──────────────────────────────────
    // Notify all participants about cancellation
    for (const p of meeting.participants) {
      await notificationService.createNotification(p.userId, {
        title: 'Meeting Cancelled',
        message: `Meeting "${meeting.title}" has been cancelled.`,
        type: 'meeting_reminder',
        metadata: { meetingId: id },
      });
    }

    return updatedMeeting;
  },

  /**
   * Post-meeting notes (organizer only).
   */
  postNotes: async (id, notes, actor) => {
    const meeting = await meetingRepository.findById(id);
    if (!meeting) throw new ApiError('Meeting not found.', 404);

    const isOrganizer = meeting.organizerId.toString() === actor._id.toString();
    if (!isOrganizer) {
      throw new ApiError('Access denied: Only the meeting organizer can post notes.', 403);
    }

    return meetingRepository.updateMeeting(id, { notes });
  },

  /**
   * RSVP update.
   */
  submitRsvp: async (id, rsvpStatus, actorId) => {
    const meeting = await meetingRepository.findById(id);
    if (!meeting) throw new ApiError('Meeting not found.', 404);

    const validRSVPs = ['Pending', 'Accepted', 'Declined', 'Tentative'];
    if (!validRSVPs.includes(rsvpStatus)) {
      throw new ApiError('Invalid RSVP status.', 400);
    }

    const success = await meetingRepository.updateRsvp(id, actorId, rsvpStatus);
    if (!success) {
      throw new ApiError('Failed to update RSVP. Are you a participant in this meeting?', 400);
    }

    return true;
  },

  /**
   * Get user's upcoming meetings (7 days).
   */
  getUpcoming: async (userId) => {
    return meetingRepository.findUpcomingMeetings(userId);
  },
};

module.exports = meetingService;
