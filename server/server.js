/**
 * ============================================================
 * Crudier CRM — Server Entry Point
 * ============================================================
 * Connects to MongoDB Atlas, builds the HTTP + Socket.IO server,
 * and starts listening.
 * ============================================================
 */

const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { connectDB, closeDB } = require('./config/db');
const initSocketIO = require('./src/socket/socket.init');

// Repositories for startup indexing
const notesRepository = require('./src/modules/notes/notes.repository');
const notificationRepository = require('./src/modules/notifications/notification.repository');
const salesRepository = require('./src/modules/sales/sales.repository');

const startServer = async () => {
  try {
    // 1. Connect to database
    await connectDB();

    // 2. Initialize Indexes
    await notesRepository.createIndexes();
    await notificationRepository.createIndexes();
    await salesRepository.createIndexes();

    // 3. Create HTTP server and bind Socket.IO
    const server = http.createServer(app);
    initSocketIO(server);

    // Start background cron jobs
    const initCronJobs = require('./src/cron/cron.init');
    initCronJobs();

    // 4. Listen
    server.listen(env.port, () => {
      console.log('');
      console.log('  ┌──────────────────────────────────────────┐');
      console.log('  │        🚀  Crudier CRM API Server        │');
      console.log('  ├──────────────────────────────────────────┤');
      console.log(`  │  Environment : ${env.nodeEnv.padEnd(24)}│`);
      console.log(`  │  Port        : ${String(env.port).padEnd(24)}│`);
      console.log(`  │  Health      : /api/v1/health${' '.repeat(12)}│`);
      console.log('  └──────────────────────────────────────────┘');
      console.log('');
    });

    // 5. Graceful shutdown handler
    const shutdown = async (signal) => {
      console.log(`\n[Server] ${signal} received — shutting down...`);
      server.close(async () => {
        await closeDB();
        console.log('[Server] Process terminated cleanly.');
        process.exit(0);
      });

      // Force kill after 10 seconds
      setTimeout(() => {
        console.error('[Server] Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    process.on('unhandledRejection', (reason) => {
      console.error('[Server] Unhandled Rejection:', reason);
      shutdown('UNHANDLED_REJECTION');
    });

    process.on('uncaughtException', (err) => {
      console.error('[Server] Uncaught Exception:', err);
      shutdown('UNCAUGHT_EXCEPTION');
    });
  } catch (err) {
    console.error('[Server] Bootstrapping failed:', err);
    process.exit(1);
  }
};

startServer();
