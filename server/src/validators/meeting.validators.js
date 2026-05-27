/**
 * ============================================================
 * Crudier CRM — Meeting Request Validators
 * ============================================================
 */

const { ObjectId } = require('mongodb');

const meetingValidators = {
  create: {
    body: {
      title: (val) => (val && val.trim().length > 0) || 'Meeting title is required.',
      startTime: (val) => (val && !isNaN(Date.parse(val))) || 'Meeting start time is required.',
      endTime: (val) => (val && !isNaN(Date.parse(val))) || 'Meeting end time is required.',
      participants: (val) => !val || Array.isArray(val) || 'Participants must be an array of user IDs.',
    },
  },
};

module.exports = meetingValidators;
