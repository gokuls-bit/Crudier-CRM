/**
 * ============================================================
 * API v1 — Route Index
 * ============================================================
 * All feature routers are mounted here under /api/v1.
 * Import this file once in app.js.
 * ============================================================
 */

const { Router } = require('express');

const healthRoutes = require('./health.routes');
// Future routes:
// const authRoutes   = require('./auth.routes');
// const userRoutes   = require('./user.routes');
// const leadRoutes   = require('./lead.routes');

const router = Router();

router.use('/health', healthRoutes);
// router.use('/auth',   authRoutes);
// router.use('/users',  userRoutes);
// router.use('/leads',  leadRoutes);

module.exports = router;
