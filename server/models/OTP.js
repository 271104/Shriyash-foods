const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['login', 'register', 'checkout_guest', 'verification'],
    required: true
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  }
}, { timestamps: true });

// Compound index for efficient queries
otpSchema.index({ phone: 1, purpose: 1, isUsed: 1 });

module.exports = mongoose.model('OTP', otpSchema);
