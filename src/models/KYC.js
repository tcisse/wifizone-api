const mongoose = require('mongoose');
const { KYC_STATUS, DOCUMENT_TYPES } = require('../config/constants');

const documentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(DOCUMENT_TYPES),
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(KYC_STATUS),
      default: KYC_STATUS.PENDING,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const kycSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(KYC_STATUS),
      default: KYC_STATUS.NOT_VERIFIED,
      index: true,
    },
    documents: [documentSchema],
    submittedAt: {
      type: Date,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectedAt: {
      type: Date,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
kycSchema.index({ user: 1 });
kycSchema.index({ status: 1, submittedAt: -1 });

// Method to approve KYC
kycSchema.methods.approve = function (adminId) {
  this.status = KYC_STATUS.VERIFIED;
  this.verifiedAt = new Date();
  this.verifiedBy = adminId;
  this.rejectionReason = null;
};

// Method to reject KYC
kycSchema.methods.reject = function (adminId, reason) {
  this.status = KYC_STATUS.REJECTED;
  this.rejectedAt = new Date();
  this.rejectedBy = adminId;
  this.rejectionReason = reason;
};

// Method to submit documents
kycSchema.methods.submit = function () {
  this.status = KYC_STATUS.PENDING;
  this.submittedAt = new Date();
};

// Ensure virtuals are included in JSON
kycSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

kycSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const KYC = mongoose.model('KYC', kycSchema);

module.exports = KYC;
