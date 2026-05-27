/**
 * ============================================================
 * Crudier CRM — Sales Model (CRM Closed Deals / Revenue Logs)
 * ============================================================
 */

const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
    },
    amount: {
      type: Number,
      required: [true, 'Sale amount is required'],
      min: [0, 'Sale amount cannot be negative'],
    },
    closeDate: {
      type: Date,
      default: Date.now,
    },
    dealOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Deal owner ID is required'],
    },
    notes: {
      type: String,
      trim: true,
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
salesSchema.index({ workspaceId: 1, closeDate: -1 });
salesSchema.index({ dealOwnerId: 1 });

// Soft delete query middleware
salesSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

const Sales = mongoose.model('Sales', salesSchema);

module.exports = Sales;
