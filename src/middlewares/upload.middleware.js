/**
 * ============================================================
 * Crudier CRM — Multer Upload Middleware Configuration
 * ============================================================
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/apiError');

// Ensure upload directories exist
const uploadDirs = [
  path.join(__dirname, '../../uploads/avatars'),
  path.join(__dirname, '../../uploads/tasks'),
  path.join(__dirname, '../../uploads/misc'),
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'avatar') {
      cb(null, path.join(__dirname, '../../uploads/avatars'));
    } else if (file.fieldname === 'attachment' || file.fieldname === 'attachments') {
      cb(null, path.join(__dirname, '../../uploads/tasks'));
    } else {
      cb(null, path.join(__dirname, '../../uploads/misc'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File Filters
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp|pdf|doc|docx|xls|xlsx|txt|csv/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (file.fieldname === 'avatar') {
    // Avatars only allow image types
    const isImage = /jpeg|jpg|png|webp/.test(file.mimetype) && /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase());
    if (isImage) {
      return cb(null, true);
    }
    return cb(new ApiError('Only JPEG, PNG, or WEBP images are allowed for avatars.', 400), false);
  }

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new ApiError('Invalid file type: file extension or mime type not supported.', 400), false);
};

// Multer Upload Instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB Max size
  },
});

module.exports = upload;
