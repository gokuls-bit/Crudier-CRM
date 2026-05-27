/**
 * ============================================================
 * Crudier CRM — Chat Model
 * ============================================================
 */

const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
    },
    message: {
      type: String,
      required: function() {
        return !this.attachments || this.attachments.length === 0;
      },
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    attachments: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true },
        mimeType: String,
      }
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

// Indexes
chatSchema.index({ workspaceId: 1, createdAt: -1 });

// Soft delete query middleware
chatSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
