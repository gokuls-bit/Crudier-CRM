/**
 * ============================================================
 * Crudier CRM — Sales CRM Request Validators
 * ============================================================
 */

const salesValidators = {
  createLead: {
    body: {
      companyName: (val) => (val && val.trim().length > 0) || 'Company name is required.',
      contactPerson: (val) => (val && val.trim().length > 0) || 'Contact person name is required.',
      email: (val) => !val || /^\S+@\S+\.\S+$/.test(val) || 'Please provide a valid contact email.',
      status: (val) => !val || ['New Lead', 'Contacted', 'Meeting Scheduled', 'Negotiation', 'Closed Won', 'Closed Lost'].includes(val) || 'Invalid lead status.',
      estimatedValue: (val) => !val || !isNaN(parseFloat(val)) || 'Estimated value must be a valid number.',
    },
  },
};

module.exports = salesValidators;
