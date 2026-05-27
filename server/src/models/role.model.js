/**
 * ============================================================
 * Crudier CRM — Role Model (RBAC Roles)
 * ============================================================
 */

const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    permissions: {
      type: [String], // Array of permission strings or codes e.g. ['tasks:create', 'users:invite']
      default: [],
    },
    isCustom: {
      type: Boolean,
      default: true, // false for system-wide defaults (Founder, Admin, Developer, Intern, Designer, Sales)
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      default: null, // null means global/system-wide role
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
roleSchema.index({ name: 1, workspaceId: 1 }, { unique: true });

// Soft delete query middleware
roleSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
