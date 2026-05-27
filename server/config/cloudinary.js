/**
 * ============================================================
 * Crudier CRM — Cloudinary File Storage Configuration
 * ============================================================
 * Configures the Cloudinary API for profile pictures (avatars)
 * and task attachment uploads.
 */

const cloudinary = require('cloudinary').v2;
const logger = require('./logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'mock_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || 'mock_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mock_secret',
  secure: true
});

logger.info('[Cloudinary] Client configured.');

module.exports = cloudinary;
