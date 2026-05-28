export const routePaths = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  UNAUTHORIZED: '/unauthorized',

  // Common/Shared Pages (Requires Auth)
  DASHBOARD: '/dashboard', // Dynamic router index to redirect to role-based landing
  PROFILE: '/profile',
  NOTIFICATIONS: '/notifications',
  MEETINGS: '/meetings',
  NOTES: '/notes',
  CHAT: '/chat',
  SETTINGS: '/settings',

  // Executive
  EXECUTIVE_DASHBOARD: '/executive/dashboard',
  EXECUTIVE_ORG_OVERVIEW: '/executive/org-overview',
  EXECUTIVE_REVENUE: '/executive/revenue',
  EXECUTIVE_WORKFORCE: '/executive/workforce',
  EXECUTIVE_MEETINGS: '/executive/meetings',

  // Technical
  TECH_DASHBOARD: '/technical/dashboard',
  TECH_ENGINEERING_OVERVIEW: '/technical/engineering-overview',
  TECH_SPRINT_BOARD: '/technical/sprint-board',
  TECH_ATTENDANCE: '/technical/attendance',
  TECH_CODE_REVIEW: '/technical/code-review',
  TECH_MEETINGS: '/technical/meetings',

  // Founder
  FOUNDER_DASHBOARD: '/founder/dashboard',
  FOUNDER_SETTINGS: '/founder/settings',
  FOUNDER_MEMBERS: '/founder/members',
  FOUNDER_ACTIVITY: '/founder/activity',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_DEPARTMENTS: '/admin/departments',
  ADMIN_ANNOUNCEMENTS: '/admin/announcements',

  // Team Lead
  LEAD_DASHBOARD: '/teamlead/dashboard',
  LEAD_REVIEWS: '/teamlead/reviews',
  LEAD_ATTENDANCE: '/teamlead/attendance',
  LEAD_ASSIGN_TASK: '/teamlead/assign-task',
  LEAD_NOTES: '/teamlead/notes',

  // Developer
  DEV_DASHBOARD: '/developer/dashboard',
  DEV_TASKS: '/developer/tasks',
  DEV_TASK_DETAIL: '/developer/tasks/:id',
  DEV_SUBMIT_TASK: '/developer/submit',
  DEV_ATTENDANCE: '/developer/attendance',
  DEV_NOTES: '/developer/notes',

  // Designer
  DESIGNER_DASHBOARD: '/designer/dashboard',
  DESIGNER_TASKS: '/designer/tasks',
  DESIGNER_NOTES: '/designer/notes',
  DESIGNER_ATTENDANCE: '/designer/attendance',

  // Sales
  SALES_DASHBOARD: '/sales/dashboard',
  SALES_LEADS: '/sales/leads',
  SALES_LEAD_DETAIL: '/sales/leads/:id',
  SALES_PIPELINE: '/sales/pipeline',
  SALES_ANALYTICS: '/sales/analytics',
  SALES_FOLLOWUPS: '/sales/followups',

  // Intern
  INTERN_DASHBOARD: '/intern/dashboard',
  INTERN_TASKS: '/intern/tasks',
  INTERN_ATTENDANCE: '/intern/attendance',
};
