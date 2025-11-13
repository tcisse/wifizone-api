const mongoose = require('mongoose');
const { PLAN_STATUS } = require('../config/constants');

const planSchema = new mongoose.Schema(
  {
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0, // in seconds
    },
    price: {
      type: Number,
      required: true,
      min: 0, // in FCFA
    },
    downloadLimit: {
      type: Number,
      default: null, // null = unlimited, otherwise in KB
    },
    uploadLimit: {
      type: Number,
      default: null, // null = unlimited, otherwise in KB
    },
    status: {
      type: String,
      enum: Object.values(PLAN_STATUS),
      default: PLAN_STATUS.ACTIVE,
    },
    stats: {
      totalTickets: { type: Number, default: 0 },
      soldTickets: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
planSchema.index({ zone: 1, status: 1 });
planSchema.index({ deletedAt: 1 });

// Virtual for duration in hours
planSchema.virtual('durationInHours').get(function () {
  return this.duration / 3600;
});

// Virtual for formatted price
planSchema.virtual('formattedPrice').get(function () {
  return `${this.price.toLocaleString()} FCFA`;
});

// Ensure virtuals are included in JSON
planSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

planSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
