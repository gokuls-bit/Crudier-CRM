/**
 * ============================================================
 * Crudier CRM — Room Manager
 * ============================================================
 */

const roomManager = {
  /**
   * Add a socket connection to a workspace room and personal user room.
   */
  joinUserRooms: (socket, userId, workspaceId) => {
    // 1. Join user-specific room for private events (like notifications)
    const userRoom = `user_${userId}`;
    socket.join(userRoom);
    console.log(`[Socket] User ${userId} joined room ${userRoom}`);

    // 2. Join workspace room for team collaboration
    if (workspaceId) {
      const workspaceRoom = `workspace_${workspaceId}`;
      socket.join(workspaceRoom);
      console.log(`[Socket] User ${userId} joined workspace room ${workspaceRoom}`);
    }
  },

  /**
   * Remove a socket connection from a workspace room.
   */
  leaveWorkspaceRoom: (socket, workspaceId) => {
    if (workspaceId) {
      const workspaceRoom = `workspace_${workspaceId}`;
      socket.leave(workspaceRoom);
      console.log(`[Socket] Socket ${socket.id} left workspace room ${workspaceRoom}`);
    }
  },
};

module.exports = roomManager;
