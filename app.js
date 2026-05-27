/**
 * ============================================================
 * Crudier CRM — Express Application
 * ============================================================
 * Initializes Express and applies the global middleware stack.
 * ============================================================
 */

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const corsOptions = require('./config/corsOptions');
const { globalRateLimiter } = require('./src/middlewares/rateLimiter.middleware');
const apiV1Router = require('./src/routes');
const errorMiddleware = require('./src/middlewares/error.middleware');
const ApiError = require('./src/utils/apiError');

const app = express();

// ── 1. HTTP logger ──────────────────────────────────────────
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// ── 2. Helmet security headers ──────────────────────────────
app.use(helmet());

// ── 3. CORS ─────────────────────────────────────────────────
app.use(cors(corsOptions));

// ── 4. Body parsers ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── 5. Cookie Parser ────────────────────────────────────────
app.use(cookieParser());

// ── 6. Global Rate Limiter ──────────────────────────────────
app.use(globalRateLimiter);

// Static uploads folder
app.use('/uploads', express.static('uploads'));

// ── API Routes ──────────────────────────────────────────────
app.use('/api/v1', apiV1Router);

// ── 404 Route Catch-all ────────────────────────────────────
app.use((req, res, next) => {
  next(new ApiError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

// ── Centralized JSON Error Handler (must be last) ──────────
app.use(errorMiddleware);

module.exports = app;
