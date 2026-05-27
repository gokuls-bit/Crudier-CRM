/**
 * ============================================================
 * Crudier CRM — Attendance Model
 * ============================================================
 */

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in time is required'],
    },
    checkOut: {
      type: Date,
      default: null,
    },
    date: {
      type: String, // format YYYY-MM-DD
      required: [true, 'Date is required'],
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Absent', 'Half Day'],
      required: [true, 'Attendance status is required'],
    },
    totalHours: {
      type: Number,
      default: 0,
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
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true }); // One check-in per user per day
attendanceSchema.index({ workspaceId: 1, date: 1 });
attendanceSchema.index({ status: 1 });

// Soft delete query middleware
attendanceSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
