/**
 * ============================================================
 * Crudier CRM — Attendance Request Validators
 * ============================================================
 */

const attendanceValidators = {
  checkIn: {
    body: {
      time: (val) => !val || !isNaN(Date.parse(val)) || 'Invalid check-in timestamp format.',
    },
  },
  checkOut: {
    body: {
      time: (val) => !val || !isNaN(Date.parse(val)) || 'Invalid check-out timestamp format.',
    },
  },
};

module.exports = attendanceValidators;
