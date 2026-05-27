/**
 * ============================================================
 * Crudier CRM — Encryption Utility (AES-256-GCM)
 * ============================================================
 * Encrypts and decrypts sensitive values (such as proposal URLs,
 * personal email addresses, or phone logs) before saving them to DB.
 */

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

// Derives a static key from secret configuration
const getSecretKey = () => {
  const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'dev_secret_key_fallback_minimum_length_32_characters';
  return crypto.scryptSync(secret, 'crudier-scrypt-salt', KEY_LENGTH);
};

/**
 * Encrypt string value
 * @param {string} text 
 * @returns {string} iv:authTag:encryptedString
 */
const encrypt = (text) => {
  if (!text) return '';
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getSecretKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypt string value
 * @param {string} cipherText iv:authTag:encryptedString
 * @returns {string} decryptedText
 */
const decrypt = (cipherText) => {
  if (!cipherText) return '';

  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid format. Expected iv:authTag:encryptedText');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const key = getSecretKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    console.error('[Encryption] Decryption failed:', err.message);
    return ''; // Return empty string on failure instead of crashing the request
  }
};

module.exports = { encrypt, decrypt };
