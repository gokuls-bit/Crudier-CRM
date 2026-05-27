/**
 * ============================================================
 * Crudier CRM — Attendance Service
 * ============================================================
 */

const ApiError = require('../../utils/apiError');
const attendanceRepository = require('./attendance.repository');
const notificationService = require('../notifications/notification.service');

const attendanceService = {
  /**
   * Check-in logic.
   */
  checkIn: async (userId, workspaceId, checkInTime = new Date()) => {
    const checkInDate = new Date(checkInTime);
    const dateStr = checkInDate.toISOString().split('T')[0];

    // 1. Prevent duplicate check-ins
    const existingRecord = await attendanceRepository.findByUserAndDate(userId, dateStr);
    if (existingRecord) {
      throw new ApiError('You have already checked in for today.', 400);
    }

    // 2. Assign status based on check-in time
    // Present if before 9:30 AM; Late if 9:30 AM onwards.
    const minutes = checkInDate.getHours() * 60 + checkInDate.getMinutes();
    const thresholdMinutes = 9 * 60 + 30; // 9:30 AM
    
    const status = minutes <= thresholdMinutes ? 'Present' : 'Late';

    const record = await attendanceRepository.createCheckIn(
      userId,
      workspaceId,
      dateStr,
      checkInTime,
      status
    );

    // 3. Trigger notification if late
    if (status === 'Late') {
      await notificationService.createNotification(userId, {
        title: 'Late Attendance Alert',
        message: `Your check-in at ${checkInDate.toLocaleTimeString()} was marked as Late.`,
        type: 'attendance_alert',
        metadata: { checkInId: record._id },
      });
    }

    return record;
  },

  /**
   * Check-out logic.
   */
  checkOut: async (userId, checkOutTime = new Date()) => {
    const checkOutDate = new Date(checkOutTime);
    const dateStr = checkOutDate.toISOString().split('T')[0];

    const record = await attendanceRepository.findByUserAndDate(userId, dateStr);
    if (!record) {
      throw new ApiError('No check-in record found for today. Please check in first.', 400);
    }

    if (record.checkOut) {
      throw new ApiError('You have already checked out for today.', 400);
    }

    const checkInTime = new Date(record.checkIn);
    const totalHours = (checkOutDate - checkInTime) / (1000 * 60 * 60);

    let status = record.status;
    
    // Downgrade to Half Day if under 4 hours and status was Present/Late
    if (totalHours < 4 && (record.status === 'Present' || record.status === 'Late')) {
      status = 'Half Day';
    }

    const updatedRecord = await attendanceRepository.updateCheckOut(
      record._id,
      checkOutDate,
      totalHours,
      status
    );

    return updatedRecord;
  },

  /**
   * Get active user's today status.
   */
  getTodayStatus: async (userId) => {
    const dateStr = new Date().toISOString().split('T')[0];
    const record = await attendanceRepository.findByUserAndDate(userId, dateStr);
    return record || { message: 'No attendance logged for today.' };
  },

  /**
   * Get paginated attendance history for active user.
   */
  getUserHistory: async (userId, startDate, endDate, limit, skip) => {
    return attendanceRepository.getHistory(userId, startDate, endDate, limit, skip);
  },

  /**
   * Get workspace wide reports. Admin / Founder only.
   */
  getWorkspaceReport: async (workspaceId) => {
    return attendanceRepository.getWorkspaceReport(workspaceId);
  },

  /**
   * Get analytics (30 days trend + rate calculations).
   */
  getAnalytics: async (workspaceId) => {
    return attendanceRepository.getWorkspaceAnalytics(workspaceId);
  },
};

module.exports = attendanceService;
