const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  guestDetails: {
    name: String,
    phone: String,
    email: String
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    variant: String,
    price: Number,
    quantity: Number,
    sku: String
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    addressLine1: { type: String, required: true },
    addressLine2: String,
    landmark: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  pricing: {
    subtotal: Number,
    shipping: Number,
    discount: Number,
    total: Number
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'PREPAID'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  razorpayPaymentId: String,
  razorpayOrderId: String,
  orderStatus: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RTO'],
    default: 'PENDING'
  },
  shiprocketOrderId: String,
  shiprocketShipmentId: String,
  awbCode: String,
  trackingUrl: String,
  isOTPVerified: {
    type: Boolean,
    default: false
  },
  isFirstOrder: Boolean,
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
