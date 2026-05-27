/**
 * ============================================================
 * Crudier CRM — Notification Socket Handler
 * ============================================================
 */

const events = require('../socket.events');

module.exports = (io, socket) => {
  const userId = socket.user.id;

  // Real-time custom alerts
  socket.on(events.NOTIFICATION_RECEIVED, (data) => {
    // Forward or push alert back to user's private room
    io.to(`user_${userId}`).emit(events.NOTIFICATION_RECEIVED, {
      ...data,
      timestamp: new Date(),
    });
  });
};
