/**
 * ============================================================
 * Crudier CRM — Attendance Routes
 * ============================================================
 */

const { Router } = require('express');
const attendanceController = require('./attendance.controller');
const { protectRoute } = require('../../middlewares/auth.middleware');
const authorizeRoles = require('../../middlewares/rbac.middleware');
const asyncWrapper = require('../../utils/asyncWrapper');

const router = Router();

// Protect all routes
router.use(protectRoute);

router.post('/checkin', asyncWrapper(attendanceController.checkIn));
router.post('/checkout', asyncWrapper(attendanceController.checkOut));
router.get('/today', asyncWrapper(attendanceController.today));
router.get('/history', asyncWrapper(attendanceController.history));
router.get('/analytics', asyncWrapper(attendanceController.analytics));

// Admin / Founder only report
router.get('/report', authorizeRoles('Founder', 'Admin'), asyncWrapper(attendanceController.report));

module.exports = router;
