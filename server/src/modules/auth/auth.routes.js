/**
 * ============================================================
 * Crudier CRM — Auth Routes (Clerk Upgrade)
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

// Primary Credentials routes
router.post('/register', registerValidation, asyncWrapper(authController.register));
router.post('/login', loginValidation, asyncWrapper(authController.login));
router.post('/logout', asyncWrapper(authController.logout));
router.post('/refresh-token', asyncWrapper(authController.refresh));
router.post('/refresh', asyncWrapper(authController.refresh)); // duplicate to support both styles
router.get('/me', protectRoute, asyncWrapper(authController.me));

// OAuth Simulator routes
router.get('/oauth/:provider', asyncWrapper(authController.oauthInitiate));
router.get('/oauth/:provider/callback', asyncWrapper(authController.oauthCallback));
router.post('/oauth/link/:provider', protectRoute, asyncWrapper(authController.linkOAuth));
router.delete('/oauth/unlink/:provider', protectRoute, asyncWrapper(authController.unlinkOAuth));

// Multi-Factor Authentication (2FA) routes
router.post('/2fa/setup', protectRoute, asyncWrapper(authController.setup2FA));
router.post('/2fa/verify', protectRoute, asyncWrapper(authController.verify2FA));
router.post('/2fa/validate', asyncWrapper(authController.validate2FA));
router.post('/2fa/backup-codes', protectRoute, asyncWrapper(authController.regenerateBackupCodes));

// Session Management routes
router.get('/sessions', protectRoute, asyncWrapper(authController.getSessions));
router.delete('/sessions/:id', protectRoute, asyncWrapper(authController.revokeSession));

// Developer Profiles coding stats routes
router.get('/developer-profiles', protectRoute, asyncWrapper(authController.getDeveloperProfiles));
router.post('/developer-profiles/sync', protectRoute, asyncWrapper(authController.syncDeveloperProfiles));

module.exports = router;
