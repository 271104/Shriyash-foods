const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Cart = require('../models/Cart');
const { optional, protect } = require('../middleware/auth');
const { validateOrderData } = require('../middleware/validation');

// @route   POST /api/orders/create
// @desc    Create new order
router.post('/create', optional, validateOrderData, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, guestDetails } = req.body;
    
    // Validate order value for COD
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let isFirstOrder = true;
    if (req.user) {
      const previousOrders = await Order.countDocuments({ user: req.user._id });
      isFirstOrder = previousOrders === 0;
    }
    
    // COD fraud prevention
    if (paymentMethod === 'COD') {
      const codLimit = isFirstOrder ? 1500 : 3000;
      
      if (subtotal > codLimit) {
        return res.status(400).json({
          success: false,
          message: `COD not available for orders above ₹${codLimit}. Please choose prepaid.`,
          suggestPrepaid: true
        });
      }
      
      // Check if user is blocked
      if (req.user && req.user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'COD not available. Please choose prepaid payment.'
        });
      }
    }
    
    // Generate order ID
    const orderId = 'SHR' + Date.now();
    
    // Calculate pricing
    const shipping = subtotal >= 500 ? 0 : 40;
    const discount = paymentMethod === 'PREPAID' ? 25 : 0;
    const total = subtotal + shipping - discount;
    
    // Create order
    const order = await Order.create({
      orderId,
      user: req.user?._id,
      guestDetails: !req.user ? guestDetails : undefined,
      items,
      shippingAddress,
      pricing: { subtotal, shipping, discount, total },
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
      isFirstOrder,
      statusHistory: [{
        status: 'PENDING',
        note: 'Order created'
      }]
    });
    
    // Clear cart
    if (req.user) {
      await Cart.findOneAndDelete({ user: req.user._id });
    } else {
      const sessionId = req.headers['x-session-id'];
      await Cart.findOneAndDelete({ sessionId });
    }
    
    res.status(201).json({
      success: true,
      order,
      requiresOTP: paymentMethod === 'COD' && (subtotal > 500 || isFirstOrder)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/orders/:orderId
// @desc    Get order details
router.get('/:orderId', optional, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('items.product');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get user orders
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product');
    
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/orders/:orderId/verify-otp
// @desc    Verify OTP for COD order
router.post('/:orderId/verify-otp', async (req, res) => {
  try {
    const { otp } = req.body;
    
    // TODO: Verify OTP
    // For development, accept any 6-digit OTP
    if (otp.length !== 6) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    order.isOTPVerified = true;
    order.orderStatus = 'CONFIRMED';
    order.statusHistory.push({
      status: 'CONFIRMED',
      note: 'OTP verified, order confirmed'
    });
    
    await order.save();
    
    res.json({ success: true, message: 'Order confirmed successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
