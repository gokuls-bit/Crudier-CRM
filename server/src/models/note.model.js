/**
 * ============================================================
 * Crudier CRM — Note Model
 * ============================================================
 */

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      trim: true,
      default: '',
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
    },
    visibility: {
      type: String,
      enum: ['private', 'workspace', 'team'],
      default: 'workspace',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
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

// Compound and text indexes for fast searching
noteSchema.index({ workspaceId: 1, visibility: 1 });
noteSchema.index({ createdBy: 1 });
noteSchema.index({ title: 'text', content: 'text' }); // Text search index

// Soft delete query middleware
noteSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
