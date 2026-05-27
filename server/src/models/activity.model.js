/**
 * ============================================================
 * Crudier CRM — Activity Model (Workspace Activities)
 * ============================================================
 */

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only log when it happened
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
activitySchema.index({ workspaceId: 1, createdAt: -1 });
activitySchema.index({ userId: 1 });

// Soft delete query middleware
activitySchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
