const mongoose = require('mongoose');

const cartActivitySchema = {
  action: {
    type: String,
    enum: ['ADD', 'UPDATE', 'REMOVE', 'CLEAR', 'MERGE', 'VIEW', 'CHECKOUT'],
    required: true
  },
  timestamp: { type: Date, default: Date.now },
  customerType: {
    type: String,
    enum: ['guest', 'registered'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  guestUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: String,
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: String,
  variant: String,
  quantity: Number,
  previousQuantity: Number,
  price: Number,
  itemCountAfter: Number,
  ip: String,
  userAgent: String,
  note: String
};

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  guestUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  sessionId: {
    type: String,
    index: true
  },
  customerType: {
    type: String,
    enum: ['guest', 'registered'],
    index: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variant: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: Number,
    addedAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
  }],
  activityLog: [cartActivitySchema],
  itemCount: { type: Number, default: 0 },
  totalValue: { type: Number, default: 0 },
  lastActivityAt: Date,
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

cartSchema.index({ customerType: 1, lastActivityAt: -1 });
cartSchema.index({ sessionId: 1, customerType: 1 });

module.exports = mongoose.model('Cart', cartSchema);
