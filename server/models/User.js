const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const activityLogSchema = {
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  ip: String,
  userAgent: String,
  sessionId: String
};

const userSchema = new mongoose.Schema({
  userType: {
    type: String,
    enum: ['guest', 'registered'],
    default: 'guest',
    index: true
  },
  name: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    sparse: true,
    unique: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true
  },
  password: {
    type: String,
    minlength: 6
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isGuest: {
    type: Boolean,
    default: true
  },
  guestSessionId: {
    type: String,
    sparse: true,
    unique: true,
    index: true
  },
  addresses: [{
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    landmark: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: Boolean
  }],
  orderHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  activityLog: [activityLogSchema],
  stats: {
    totalCartActions: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalLogins: { type: Number, default: 0 },
    lastActivityAt: Date,
    convertedToRegisteredAt: Date,
    linkedRegisteredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  firstSeenAt: Date,
  lastSeenAt: Date,
  failedDeliveries: {
    type: Number,
    default: 0
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  refreshToken: {
    type: String
  },
  lastLogin: {
    type: Date
  },
  otpAttempts: {
    count: { type: Number, default: 0 },
    lastAttempt: { type: Date }
  }
}, { timestamps: true });

userSchema.index({ userType: 1, createdAt: -1 });
userSchema.index({ lastSeenAt: -1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
