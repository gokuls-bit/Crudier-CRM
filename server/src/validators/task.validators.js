/**
 * ============================================================
 * Crudier CRM — Task Request Validators
 * ============================================================
 */

const { ObjectId } = require('mongodb');

const taskValidators = {
  create: {
    body: {
      title: (val) => (val && val.trim().length > 0) || 'Task title is required.',
      priority: (val) => !val || ['Low', 'Medium', 'High', 'Critical'].includes(val) || 'Invalid priority level.',
      assignedTo: (val) => !val || ObjectId.isValid(val) || 'Invalid assignee User ID.',
      dueDate: (val) => !val || !isNaN(Date.parse(val)) || 'Invalid due date format.',
    },
  },
  updateStatus: {
    body: {
      status: (val) => (val && ['Pending', 'In Progress', 'Submitted', 'Review', 'Approved', 'Rejected', 'Blocked'].includes(val)) || 'Invalid task status.',
    },
  },
};

module.exports = taskValidators;
