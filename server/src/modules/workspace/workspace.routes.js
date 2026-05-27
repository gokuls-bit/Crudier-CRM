/**
 * ============================================================
 * Crudier CRM — Workspace Routes
 * ============================================================
 */

const { Router } = require('express');
const workspaceController = require('./workspace.controller');
const { protectRoute } = require('../../middlewares/auth.middleware');
const authorizeRoles = require('../../middlewares/rbac.middleware');
const { validateWorkspaceMembership } = require('../../middlewares/workspace.middleware');
const validate = require('../../middlewares/validate.middleware');
const asyncWrapper = require('../../utils/asyncWrapper');

const router = Router();

// Validation Rules
const createValidation = validate({
  body: {
    name: (val) => (val && val.trim().length > 0) || 'Workspace name is required.',
  },
});

const inviteValidation = validate({
  body: {
    email: (val) => (val && /^\S+@\S+\.\S+$/.test(val)) || 'Please provide a valid email to invite.',
    role: (val) => (!val || ['Admin', 'Team Lead', 'Developer', 'Designer', 'Sales', 'Intern'].includes(val)) || 'Invalid role specified.',
  },
});

const roleValidation = validate({
  body: {
    role: (val) => (val && ['Admin', 'Team Lead', 'Developer', 'Designer', 'Sales', 'Intern'].includes(val)) || 'Valid role is required.',
  },
});

const switchValidation = validate({
  body: {
    workspaceId: (val) => (val && val.trim().length > 0) || 'Target workspaceId is required.',
  },
});

// Protect all routes
router.use(protectRoute);

// Switch workspace context
router.patch('/switch', switchValidation, asyncWrapper(workspaceController.switchWorkspace));

// Workspace CRUD
router.post('/', createValidation, asyncWrapper(workspaceController.create));
router.get('/:id', validateWorkspaceMembership, asyncWrapper(workspaceController.getById));
router.patch('/:id', validateWorkspaceMembership, authorizeRoles('Founder', 'Admin'), asyncWrapper(workspaceController.update));
router.delete('/:id', validateWorkspaceMembership, authorizeRoles('Founder'), asyncWrapper(workspaceController.delete));

// Member management
router.post('/:id/invite', validateWorkspaceMembership, authorizeRoles('Founder', 'Admin'), inviteValidation, asyncWrapper(workspaceController.invite));
router.patch('/:id/members/:userId/role', validateWorkspaceMembership, authorizeRoles('Founder'), roleValidation, asyncWrapper(workspaceController.updateMemberRole));
router.delete('/:id/members/:userId', validateWorkspaceMembership, authorizeRoles('Founder', 'Admin'), asyncWrapper(workspaceController.removeMember));

// Activity
router.get('/:id/activity', validateWorkspaceMembership, asyncWrapper(workspaceController.activity));

module.exports = router;
