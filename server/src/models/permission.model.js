/**
 * ============================================================
 * Crudier CRM — Permission Model (RBAC Permissions)
 * ============================================================
 */

const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Permission name/code is required'],
      unique: true,
      trim: true, // e.g. 'tasks:create', 'meetings:schedule'
    },
    module: {
      type: String,
      required: [true, 'Module classification is required'],
      trim: true, // e.g. 'tasks', 'meetings', 'billing', 'crm'
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
permissionSchema.index({ module: 1 });

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;
