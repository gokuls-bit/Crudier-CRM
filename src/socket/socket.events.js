/**
 * ============================================================
 * Crudier CRM — Socket Event Constants
 * ============================================================
 */

module.exports = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  // Presence / Chat events
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  USER_TYPING: 'user_typing',
  CHAT_MESSAGE: 'chat_message',

  // Workspace actions
  JOIN_WORKSPACE: 'join_workspace',
  LEAVE_WORKSPACE: 'leave_workspace',

  // Real-time updates
  NOTIFICATION_RECEIVED: 'notification_received',
  TASK_UPDATED: 'task_updated',
};
