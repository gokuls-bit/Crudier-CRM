/**
 * ============================================================
 * Crudier CRM — Workspace Request Validators
 * ============================================================
 */

const workspaceValidators = {
  create: {
    body: {
      name: (val) => (val && val.trim().length > 0) || 'Workspace name is required.',
    },
  },
  invite: {
    body: {
      email: (val) => (val && /^\S+@\S+\.\S+$/.test(val)) || 'Please provide a valid email address.',
      role: (val) => !val || ['Founder', 'Admin', 'Team Lead', 'Developer', 'Designer', 'Sales', 'Intern'].includes(val) || 'Invalid team role.',
    },
  },
};

module.exports = workspaceValidators;
