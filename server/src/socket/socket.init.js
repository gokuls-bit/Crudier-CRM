/**
 * ============================================================
 * Crudier CRM — Socket.IO Server Initialization
 * ============================================================
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const roomManager = require('./rooms/room.manager');

// Handlers
const registerPresenceHandler = require('./handlers/presence.handler');
const registerChatHandler = require('./handlers/chat.handler');
const registerTaskHandler = require('./handlers/task.handler');
const registerNotificationHandler = require('./handlers/notification.handler');

const initSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Keep a reference in global scope for trigger events inside services
  global.io = io;

  // ── Authentication Middleware ────────────────────────────
  io.use((socket, next) => {
    // Look for token in handshake query or auth object
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication failed: Missing token.'));
    }

    try {
      const decoded = jwt.verify(token, env.jwtSecret);
      socket.user = decoded; // Attach user payload ({ id, email, role, workspaceId })
      next();
    } catch (err) {
      return next(new Error('Authentication failed: Invalid token.'));
    }
  });

  // ── Connection Event ──────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.user.id;
    const workspaceId = socket.user.workspaceId;

    console.log(`[Socket] Client connected: ${socket.id} (User: ${userId})`);

    // Join workspaces and private user rooms automatically
    roomManager.joinUserRooms(socket, userId, workspaceId);

    // Register handlers
    registerPresenceHandler(io, socket);
    registerChatHandler(io, socket);
    registerTaskHandler(io, socket);
    registerNotificationHandler(io, socket);

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initSocketIO;
