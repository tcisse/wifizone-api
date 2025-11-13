const mongoose = require('mongoose');
const { ZONE_STATUS } = require('../config/constants');

const zoneSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      default: 'CI',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    routerConfig: {
      ip: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      password: {
        type: String,
        required: true,
        select: false,
      },
      apiPort: {
        type: Number,
        default: 8728,
      },
    },
    status: {
      type: String,
      enum: Object.values(ZONE_STATUS),
      default: ZONE_STATUS.ACTIVE,
    },
    stats: {
      totalTickets: { type: Number, default: 0 },
      availableTickets: { type: Number, default: 0 },
      soldTickets: { type: Number, default: 0 },
      usedTickets: { type: Number, default: 0 },
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

// Create geospatial index for location-based queries
zoneSchema.index({ location: '2dsphere' });
zoneSchema.index({ owner: 1, status: 1 });
zoneSchema.index({ deletedAt: 1 });

// Virtual for plans
zoneSchema.virtual('plans', {
  ref: 'Plan',
  localField: '_id',
  foreignField: 'zone',
});

// Virtual for tickets
zoneSchema.virtual('tickets', {
  ref: 'Ticket',
  localField: '_id',
  foreignField: 'zone',
});

// Ensure virtuals are included in JSON
zoneSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

zoneSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Zone = mongoose.model('Zone', zoneSchema);

module.exports = Zone;
