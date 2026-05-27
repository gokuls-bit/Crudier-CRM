/**
 * ============================================================
 * Crudier CRM — OTP Generator Utility
 * ============================================================
 * Generates cryptographically secure numeric codes for password
 * resets or two-factor verification.
 */

const crypto = require('crypto');

/**
 * Generates a numeric OTP and returns it alongside an expiry timestamp.
 * @param {number} length – Code length (default 6 digits)
 * @param {number} expiryMinutes – Code duration in minutes (default 10)
 * @returns {Object} { otp, expiresAt }
 */
const generateOtp = (length = 6, expiryMinutes = 10) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, 10);
    otp += digits[randomIndex];
  }
  
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
  
  return { otp, expiresAt };
};

module.exports = generateOtp;
