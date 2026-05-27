/**
 * ============================================================
 * Crudier CRM — Express Application
 * ============================================================
 * Configures the Express app with the full middleware stack
 * and mounts all versioned routes.
 *
 * Middleware order (intentional):
 *   1. morgan        – HTTP request logging
 *   2. helmet        – security headers
 *   3. cors          – cross-origin config
 *   4. body parsers  – JSON + URL-encoded
 *   5. cookie-parser – signed/unsigned cookies
 *   6. rate limiter  – global throttle (100 req / 15 min)
 * ============================================================
 */

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const apiV1Routes = require('./routes');
const { notFoundHandler } = require('./middlewares/notFound');
const { errorHandler } = require('./middlewares/errorHandler');

// ── Create Express app ──────────────────────────────────────
const app = express();

// ── 1. Morgan — HTTP request logger ────────────────────────
app.use(
  morgan(config.nodeEnv === 'production' ? 'combined' : 'dev')
);

// ── 2. Helmet — secure HTTP headers ────────────────────────
app.use(helmet());

// ── 3. CORS — cross-origin resource sharing ────────────────
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── 4. Body parsers ────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── 5. Cookie parser ───────────────────────────────────────
app.use(cookieParser());

// ── 6. Global rate limiter ─────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMin * 60 * 1000, // default 15 min
  max: config.rateLimitMax,                        // default 100 req
  standardHeaders: true,  // Return rate-limit info in RateLimit-* headers
  legacyHeaders: false,   // Disable X-RateLimit-* headers
  message: {
    success: false,
    status: 'fail',
    message: 'Too many requests — please try again later.',
  },
});
app.use(globalLimiter);

// ── API Routes (versioned) ─────────────────────────────────
app.use('/api/v1', apiV1Routes);

// ── 404 catch-all ──────────────────────────────────────────
app.use(notFoundHandler);

// ── Centralized error handler (must be last) ───────────────
app.use(errorHandler);

module.exports = app;
