/**
 * ============================================================
 * Crudier CRM — RefreshToken Model (JWT Whitelisting)
 * ============================================================
 */

const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    token: {
      type: String,
      required: [true, 'Token string is required'],
      index: true,
    },
    jti: {
      type: String,
      required: [true, 'JWT ID (jti) is required'],
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable tokens
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// TTL Index to automatically remove expired refresh tokens from the collection
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ userId: 1 });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
