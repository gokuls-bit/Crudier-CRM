/**
 * ============================================================
 * Crudier CRM — Presence Handler
 * ============================================================
 */

const events = require('../socket.events');

// Keep track of active online user IDs
const activeUsers = new Set();

module.exports = (io, socket) => {
  const userId = socket.user.id;
  const workspaceId = socket.user.workspaceId;

  // Add user to active online set
  activeUsers.add(userId);

  // Broadcast presence to workspace
  if (workspaceId) {
    socket.to(`workspace_${workspaceId}`).emit(events.USER_ONLINE, {
      userId,
      timestamp: new Date(),
    });
  }

  // Handle disconnect
  socket.on(events.DISCONNECT, () => {
    activeUsers.delete(userId);
    if (workspaceId) {
      socket.to(`workspace_${workspaceId}`).emit(events.USER_OFFLINE, {
        userId,
        timestamp: new Date(),
      });
    }
  });

  // Handle typing indicator
  socket.on(events.USER_TYPING, (data) => {
    if (workspaceId) {
      socket.to(`workspace_${workspaceId}`).emit(events.USER_TYPING, {
        userId,
        isTyping: data.isTyping,
      });
    }
  });
};
