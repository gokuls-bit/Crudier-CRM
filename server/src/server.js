/**
 * ============================================================
 * Crudier CRM — Server Entry Point
 * ============================================================
 * 1. Connects to MongoDB Atlas
 * 2. Starts the Express server
 * 3. Handles graceful shutdown (SIGINT / SIGTERM)
 * ============================================================
 */

const app = require('./app');
const config = require('./config');
const { connectDB, closeDB } = require('./config/db');

const startServer = async () => {
  try {
    // ── Connect to MongoDB ──────────────────────────────────
    await connectDB();

    // ── Start listening ─────────────────────────────────────
    const server = app.listen(config.port, () => {
      console.log('');
      console.log('  ┌──────────────────────────────────────────┐');
      console.log('  │        🚀  Crudier CRM API Server        │');
      console.log('  ├──────────────────────────────────────────┤');
      console.log(`  │  Environment : ${config.nodeEnv.padEnd(24)}│`);
      console.log(`  │  Port        : ${String(config.port).padEnd(24)}│`);
      console.log(`  │  Health      : /api/v1/health${' '.repeat(12)}│`);
      console.log('  └──────────────────────────────────────────┘');
      console.log('');
    });

    // ── Graceful shutdown ───────────────────────────────────
    const shutdown = async (signal) => {
      console.log(`\n[Server] ${signal} received — shutting down …`);
      server.close(async () => {
        await closeDB();
        console.log('[Server] Process terminated');
        process.exit(0);
      });

      // Force-kill if graceful shutdown takes > 10 s
      setTimeout(() => {
        console.error('[Server] Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // ── Catch unhandled rejections & exceptions ─────────────
    process.on('unhandledRejection', (reason) => {
      console.error('[Server] Unhandled Rejection:', reason);
      shutdown('UNHANDLED_REJECTION');
    });

    process.on('uncaughtException', (err) => {
      console.error('[Server] Uncaught Exception:', err);
      shutdown('UNCAUGHT_EXCEPTION');
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
};

startServer();
