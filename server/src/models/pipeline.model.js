/**
 * ============================================================
 * Crudier CRM — Pipeline Model (CRM Sales Pipelines)
 * ============================================================
 */

const mongoose = require('mongoose');

const pipelineSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
      unique: true, // One pipeline config per workspace
    },
    name: {
      type: String,
      required: [true, 'Pipeline name is required'],
      trim: true,
      default: 'Main Sales Pipeline',
    },
    stages: {
      type: [String],
      default: ['New Lead', 'Contacted', 'Meeting Scheduled', 'Negotiation', 'Closed Won', 'Closed Lost'],
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
pipelineSchema.index({ workspaceId: 1 });

// Soft delete query middleware
pipelineSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

const Pipeline = mongoose.model('Pipeline', pipelineSchema);

module.exports = Pipeline;
