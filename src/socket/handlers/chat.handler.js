/**
 * ============================================================
 * Crudier CRM — Chat Event Handler
 * ============================================================
 */

const events = require('../socket.events');

module.exports = (io, socket) => {
  const workspaceId = socket.user.workspaceId;

  // Handle team chat messaging
  socket.on(events.CHAT_MESSAGE, (data) => {
    if (!workspaceId) return;

    // Broadcast message to workspace room members (excluding sender)
    socket.to(`workspace_${workspaceId}`).emit(events.CHAT_MESSAGE, {
      senderId: socket.user.id,
      text: data.text,
      timestamp: new Date(),
    });
  });
};
