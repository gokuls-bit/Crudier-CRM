/**
 * ============================================================
 * Crudier CRM — Global Constants & Enums
 * ============================================================
 */

module.exports = {
  ROLES: {
    FOUNDER: 'Founder',
    ADMIN: 'Admin',
    TEAM_LEAD: 'Team Lead',
    DEVELOPER: 'Developer',
    DESIGNER: 'Designer',
    SALES: 'Sales',
    INTERN: 'Intern',
  },
  
  PRIORITY: {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
  },

  TASK_STATUS: {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    SUBMITTED: 'Submitted',
    REVIEW: 'Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    BLOCKED: 'Blocked',
  },

  ATTENDANCE_STATUS: {
    PRESENT: 'Present',
    LATE: 'Late',
    ABSENT: 'Absent',
    HALF_DAY: 'Half Day',
  },

  MEETING_STATUS: {
    SCHEDULED: 'Scheduled',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  },

  RSVP_STATUS: {
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    DECLINED: 'Declined',
    TENTATIVE: 'Tentative',
  },

  NOTE_VISIBILITY: {
    PRIVATE: 'private',
    WORKSPACE: 'workspace',
    TEAM: 'team',
  },

  LEAD_STATUS: {
    NEW_LEAD: 'New Lead',
    CONTACTED: 'Contacted',
    MEETING_SCHEDULED: 'Meeting Scheduled',
    NEGOTIATION: 'Negotiation',
    CLOSED_WON: 'Closed Won',
    CLOSED_LOST: 'Closed Lost',
  },

  NOTIFICATION_TYPES: {
    TASK_ASSIGNED: 'task_assigned',
    MEETING_REMINDER: 'meeting_reminder',
    ATTENDANCE_ALERT: 'attendance_alert',
    ANNOUNCEMENT: 'announcement',
    SUBMISSION_APPROVED: 'submission_approved',
  },
};
