const crypto = require('crypto');

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Base32 Encode helper
const base32Encode = (buffer) => {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }
  return output;
};

// Base32 Decode helper
const base32Decode = (str) => {
  str = str.replace(/=+$/, '').toUpperCase();
  const buffer = [];
  let bits = 0;
  let value = 0;
  for (let i = 0; i < str.length; i++) {
    const idx = BASE32_CHARS.indexOf(str[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      buffer.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(buffer);
};

/**
 * Generate a random Base32 TOTP secret key.
 */
const generateSecret = (length = 20) => {
  const buffer = crypto.randomBytes(length);
  return base32Encode(buffer);
};

/**
 * Calculate HOTP value for a specific counter.
 */
const getHOTP = (secret, counter) => {
  const key = base32Decode(secret);
  const buffer = Buffer.alloc(8);
  // Write counter as 64-bit big endian integer
  buffer.writeUInt32BE(0, 0);
  buffer.writeUInt32BE(counter, 4);

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(buffer);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const code = binary % 1000000;
  return String(code).padStart(6, '0');
};

/**
 * Get current TOTP (RFC 6238)
 */
const getTOTP = (secret) => {
  const counter = Math.floor(Date.now() / 1000 / 30);
  return getHOTP(secret, counter);
};

/**
 * Verify a TOTP code, allowing clock drift.
 */
const verifyTOTP = (secret, code, window = 1) => {
  if (!code || code.length !== 6) return false;
  const currentCounter = Math.floor(Date.now() / 1000 / 30);
  
  for (let i = -window; i <= window; i++) {
    const generated = getHOTP(secret, currentCounter + i);
    if (generated === code) {
      return true;
    }
  }
  return false;
};

/**
 * Generate otpauth URL for QR Code scanners.
 */
const generateOtpauthUrl = (email, secret, issuer = 'Crudier CRM') => {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
};

module.exports = {
  generateSecret,
  getTOTP,
  verifyTOTP,
  generateOtpauthUrl,
};
