const mongoose = require('mongoose');
const { TICKET_STATUS } = require('../config/constants');

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: true,
      index: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    qrCode: {
      type: String, // Base64 or URL
    },
    status: {
      type: String,
      enum: Object.values(TICKET_STATUS),
      default: TICKET_STATUS.AVAILABLE,
      index: true,
    },
    buyer: {
      name: String,
      phone: String,
      email: String,
    },
    soldAt: {
      type: Date,
    },
    usedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    sessionData: {
      mac: String,
      ip: String,
      loginAt: Date,
      logoutAt: Date,
      sessionDuration: Number, // in seconds
      bytesDownloaded: Number,
      bytesUploaded: Number,
    },
    invalidatedAt: {
      type: Date,
    },
    invalidatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
ticketSchema.index({ owner: 1, status: 1 });
ticketSchema.index({ zone: 1, status: 1 });
ticketSchema.index({ plan: 1, status: 1 });
ticketSchema.index({ expiresAt: 1 });
ticketSchema.index({ deletedAt: 1 });
ticketSchema.index({ username: 1 });

// Check if ticket is expired
ticketSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

// Check if ticket is available
ticketSchema.methods.isAvailable = function () {
  return this.status === TICKET_STATUS.AVAILABLE && !this.isExpired();
};

// Method to mark as sold
ticketSchema.methods.markAsSold = function (buyerInfo) {
  this.status = TICKET_STATUS.SOLD;
  this.soldAt = new Date();
  if (buyerInfo) {
    this.buyer = buyerInfo;
  }
};

// Method to mark as used
ticketSchema.methods.markAsUsed = function (sessionData) {
  this.status = TICKET_STATUS.USED;
  this.usedAt = new Date();
  if (sessionData) {
    this.sessionData = sessionData;
  }
};

// Method to invalidate
ticketSchema.methods.invalidate = function (userId) {
  this.status = TICKET_STATUS.INVALIDATED;
  this.invalidatedAt = new Date();
  this.invalidatedBy = userId;
};

// Static method to generate unique username
ticketSchema.statics.generateUsername = async function (zoneName) {
  const prefix = zoneName.toLowerCase().replace(/\s+/g, '_').substring(0, 10);
  let username;
  let exists = true;

  while (exists) {
    const random = Math.random().toString(36).substring(2, 8);
    username = `${prefix}_${random}`;
    exists = await this.findOne({ username });
  }

  return username;
};

// Static method to generate password
ticketSchema.statics.generatePassword = function () {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Ensure virtuals are included in JSON
ticketSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

ticketSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
