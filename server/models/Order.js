const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  customerType: {
    type: String,
    enum: ['guest', 'registered'],
    required: true,
    index: true
  },
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
  guestSessionId: String,
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
    sku: String,
    lineTotal: Number
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
  courierName: String,
  trackingUrl: String,
  labelUrl: String,
  invoiceUrl: String,
  pickupReference: String,
  shippingStatus: {
    type: String,
    enum: [
      'PENDING',
      'SHIPMENT_CREATED',
      'AWB_ASSIGNED',
      'PICKUP_GENERATED',
      'PICKED_UP',
      'IN_TRANSIT',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'FAILED_ATTEMPT',
      'CANCELLED',
      'RTO'
    ],
    default: 'PENDING'
  },
  isOTPVerified: {
    type: Boolean,
    default: false
  },
  isFirstOrder: Boolean,
  clientInfo: {
    ip: String,
    userAgent: String,
    sessionId: String
  },
  placedAt: Date,
  paidAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    source: { type: String, default: 'system' }
  }],
  orderLog: [{
    event: String,
    timestamp: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed,
    source: { type: String, default: 'system' }
  }],
  paymentLog: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    amount: Number,
    message: String,
    raw: mongoose.Schema.Types.Mixed
  }],
  shippingLog: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    awbCode: String,
    courierName: String,
    shipmentId: String,
    message: String,
    raw: mongoose.Schema.Types.Mixed
  }]
}, { timestamps: true });

orderSchema.index({ customerType: 1, createdAt: -1 });
orderSchema.index({ guestSessionId: 1 });
orderSchema.index({ 'guestDetails.phone': 1 });

module.exports = mongoose.model('Order', orderSchema);
