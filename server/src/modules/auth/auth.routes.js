/**
 * ============================================================
 * Crudier CRM — Auth Routes
 * ============================================================
 */

const { Router } = require('express');
const authController = require('./auth.controller');
const validate = require('../../middlewares/validate.middleware');
const { protectRoute } = require('../../middlewares/auth.middleware');
const asyncWrapper = require('../../utils/asyncWrapper');

const router = Router();

// Validation Rules
const registerValidation = validate({
  body: {
    name: (val) => (val && val.trim().length > 0) || 'Name is required.',
    email: (val) => (val && /^\S+@\S+\.\S+$/.test(val)) || 'Please provide a valid email address.',
    password: (val) => (val && val.length >= 6) || 'Password must be at least 6 characters long.',
  },
});

const loginValidation = validate({
  body: {
    email: (val) => (val && val.trim().length > 0) || 'Email is required.',
    password: (val) => (val && val.trim().length > 0) || 'Password is required.',
  },
});

// Routes
router.post('/register', registerValidation, asyncWrapper(authController.register));
router.post('/login', loginValidation, asyncWrapper(authController.login));
router.post('/logout', asyncWrapper(authController.logout));
router.post('/refresh-token', asyncWrapper(authController.refresh));
router.post('/refresh', asyncWrapper(authController.refresh)); // duplicate to support both naming styles
router.get('/me', protectRoute, asyncWrapper(authController.me));

module.exports = router;
