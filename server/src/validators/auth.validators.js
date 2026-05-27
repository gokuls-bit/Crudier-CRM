/**
 * ============================================================
 * Crudier CRM — Auth Request Validators
 * ============================================================
 */

const authValidators = {
  register: {
    body: {
      name: (val) => (val && val.trim().length > 0) || 'Name is required.',
      email: (val) => (val && /^\S+@\S+\.\S+$/.test(val)) || 'Please provide a valid email address.',
      password: (val) => (val && val.length >= 6) || 'Password must be at least 6 characters long.',
      role: (val) => !val || ['Founder', 'Admin', 'Team Lead', 'Developer', 'Designer', 'Sales', 'Intern'].includes(val) || 'Invalid role specified.',
    },
  },
  login: {
    body: {
      email: (val) => (val && val.trim().length > 0) || 'Email is required.',
      password: (val) => (val && val.trim().length > 0) || 'Password is required.',
    },
  },
};

module.exports = authValidators;
