/**
 * ============================================================
 * Crudier CRM — Workspace Model
 * ============================================================
 */

const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      maxlength: [100, 'Workspace name cannot exceed 100 characters'],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['Founder', 'Admin', 'Team Lead', 'Developer', 'Designer', 'Sales', 'Intern'],
          default: 'Developer',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
workspaceSchema.index({ ownerId: 1 });
workspaceSchema.index({ 'members.userId': 1 });

// Soft delete query middleware
workspaceSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

const Workspace = mongoose.model('Workspace', workspaceSchema);

module.exports = Workspace;
