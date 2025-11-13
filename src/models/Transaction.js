const mongoose = require('mongoose');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../config/constants');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    commission: {
      type: Number,
      default: 0,
    },
    net: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.PENDING,
      index: true,
    },
    metadata: {
      ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
      },
      zoneId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Zone',
      },
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
      },
      withdrawalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Withdrawal',
      },
      referralUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    completedAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });

// Static method to generate transaction ID
transactionSchema.statics.generateTransactionId = function (type) {
  const prefix = type.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Method to mark as completed
transactionSchema.methods.markAsCompleted = function () {
  this.status = TRANSACTION_STATUS.COMPLETED;
  this.completedAt = new Date();
};

// Method to mark as failed
transactionSchema.methods.markAsFailed = function (reason) {
  this.status = TRANSACTION_STATUS.FAILED;
  this.failedAt = new Date();
  this.failureReason = reason;
};

// Ensure virtuals are included in JSON
transactionSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

transactionSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
