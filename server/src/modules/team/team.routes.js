/**
 * ============================================================
 * Crudier CRM — Team Routes
 * ============================================================
 */

const { Router } = require('express');
const teamController = require('./team.controller');
const { protectRoute } = require('../../middlewares/auth.middleware');
const authorizeRoles = require('../../middlewares/rbac.middleware');
const upload = require('../../middlewares/upload.middleware');
const validate = require('../../middlewares/validate.middleware');
const asyncWrapper = require('../../utils/asyncWrapper');

const router = Router();

// Validation Rules
const profileValidation = validate({
  body: {
    name: (val) => (!val || val.trim().length > 0) || 'Name cannot be empty.',
    skills: (val) => (!val || Array.isArray(val)) || 'Skills must be an array.',
  },
});

const roleValidation = validate({
  body: {
    role: (val) => (val && ['Admin', 'Team Lead', 'Developer', 'Designer', 'Sales', 'Intern'].includes(val)) || 'Valid role is required.',
  },
});

const departmentValidation = validate({
  body: {
    department: (val) => (val && val.trim().length > 0) || 'Department cannot be empty.',
  },
});

// Protect all routes
router.use(protectRoute);

// Member list
router.get('/', asyncWrapper(teamController.list));

// Profile details, activities, and updates
router.get('/:userId', asyncWrapper(teamController.getProfile));
router.patch('/:userId/profile', profileValidation, asyncWrapper(teamController.updateProfile));
router.get('/:userId/activity', asyncWrapper(teamController.activity));

// Avatar upload (Multer)
router.post('/:userId/avatar', upload.single('avatar'), asyncWrapper(teamController.uploadAvatar));

// Admin/Founder only management
router.patch('/:userId/role', authorizeRoles('Founder', 'Admin'), roleValidation, asyncWrapper(teamController.updateRole));
router.patch('/:userId/department', authorizeRoles('Founder', 'Admin'), departmentValidation, asyncWrapper(teamController.updateDepartment));
router.patch('/:userId/deactivate', authorizeRoles('Founder', 'Admin'), asyncWrapper(teamController.deactivate));

module.exports = router;
