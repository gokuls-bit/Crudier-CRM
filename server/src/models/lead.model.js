/**
 * ============================================================
 * Crudier CRM — Lead Model (CRM Leads / Opportunities)
 * ============================================================
 */

const mongoose = require('mongoose');

const leadNoteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const leadSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
    },
    status: {
      type: String,
      enum: ['New Lead', 'Contacted', 'Meeting Scheduled', 'Negotiation', 'Closed Won', 'Closed Lost'],
      default: 'New Lead',
    },
    estimatedValue: {
      type: Number,
      default: 0.0,
    },
    notes: [leadNoteSchema],
    followUpDate: {
      type: Date,
      default: null,
    },
    proposalUrl: {
      type: String,
      default: '',
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
leadSchema.index({ workspaceId: 1, status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ companyName: 'text', contactPerson: 'text' }); // Text search index

// Soft delete query middleware
leadSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
