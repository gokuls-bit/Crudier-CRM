/**
 * ============================================================
 * Crudier CRM — Internal Constants Config
 * ============================================================
 * Central registry of enum lists, role flags, and system enums.
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
  
  TASK_STATUSES: [
    'Pending',
    'In Progress',
    'Submitted',
    'Review',
    'Approved',
    'Rejected',
    'Blocked',
  ],

  PRIORITIES: [
    'Low',
    'Medium',
    'High',
    'Critical',
  ],

  LEAD_STATUSES: [
    'New Lead',
    'Contacted',
    'Meeting Scheduled',
    'Negotiation',
    'Closed Won',
    'Closed Lost',
  ],

  RSVP_STATUSES: [
    'Pending',
    'Accepted',
    'Declined',
    'Tentative',
  ],

  NOTIFICATION_TYPES: [
    'task_assigned',
    'meeting_reminder',
    'attendance_alert',
    'announcement',
    'submission_approved',
  ],
};
