const mongoose = require('mongoose');
const { WITHDRAWAL_STATUS, MOBILE_MONEY_PROVIDERS } = require('../config/constants');

const withdrawalSchema = new mongoose.Schema(
  {
    withdrawalId: {
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    fees: {
      type: Number,
      required: true,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    provider: {
      type: String,
      enum: Object.values(MOBILE_MONEY_PROVIDERS),
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(WITHDRAWAL_STATUS),
      default: WITHDRAWAL_STATUS.PENDING,
      index: true,
    },
    externalTransactionId: {
      type: String, // Transaction ID from Mobile Money provider
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    estimatedProcessingTime: {
      type: String,
      default: '24-48h',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
withdrawalSchema.index({ user: 1, status: 1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });

// Static method to generate withdrawal ID
withdrawalSchema.statics.generateWithdrawalId = function () {
  const prefix = 'WDR';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Method to approve withdrawal
withdrawalSchema.methods.approve = function (userId, externalTxId) {
  this.status = WITHDRAWAL_STATUS.COMPLETED;
  this.processedBy = userId;
  this.processedAt = new Date();
  this.externalTransactionId = externalTxId;
};

// Method to reject withdrawal
withdrawalSchema.methods.reject = function (userId, reason) {
  this.status = WITHDRAWAL_STATUS.REJECTED;
  this.processedBy = userId;
  this.processedAt = new Date();
  this.rejectionReason = reason;
};

// Ensure virtuals are included in JSON
withdrawalSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

withdrawalSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

module.exports = Withdrawal;
