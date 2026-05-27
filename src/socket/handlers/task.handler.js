/**
 * ============================================================
 * Crudier CRM — Task Socket Handler
 * ============================================================
 */

const events = require('../socket.events');

module.exports = (io, socket) => {
  const workspaceId = socket.user.workspaceId;

  // Handle task modification notifications
  socket.on(events.TASK_UPDATED, (data) => {
    if (!workspaceId) return;

    // Broadcast update to the entire workspace
    socket.to(`workspace_${workspaceId}`).emit(events.TASK_UPDATED, {
      taskId: data.taskId,
      status: data.status,
      actorId: socket.user.id,
      timestamp: new Date(),
    });
  });
};
