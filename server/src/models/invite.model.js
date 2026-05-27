/**
 * ============================================================
 * Crudier CRM — Invite Model (Workspace Invitations)
 * ============================================================
 */

const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email address',
      ],
    },
    role: {
      type: String,
      enum: ['Founder', 'Admin', 'Team Lead', 'Developer', 'Designer', 'Sales', 'Intern'],
      default: 'Developer',
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Declined', 'Expired'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// TTL index to clean up after expiration (e.g. 7 days after expiry)
inviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });
inviteSchema.index({ email: 1, workspaceId: 1 });

const Invite = mongoose.model('Invite', inviteSchema);

module.exports = Invite;
