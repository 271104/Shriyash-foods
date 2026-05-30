const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const shippingService = require('../services/shipping.service');
const { optional, protect } = require('../middleware/auth');
const { validateOrderData } = require('../middleware/validation');
const { getClientInfo, logUserActivity } = require('../utils/activityLogger');
const { findOrCreateGuestUser } = require('../utils/guestUserService');

const PICKUP_POSTCODE = '413005';

const getItemWeightKg = (variant) => {
  const match = String(variant || '').match(/(\d+(?:\.\d+)?)\s*(kg|g)/i);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  return match[2].toLowerCase() === 'kg' ? value : value / 1000;
};

const getOrderWeightKg = (items) => {
  const weight = items.reduce((sum, item) => {
    return sum + (getItemWeightKg(item.variant) * (item.quantity || 1));
  }, 0);

  return Math.max(weight, 0.5);
};

const getShiprocketShippingCharge = async (shippingAddress, items, paymentMethod) => {
  const cod = paymentMethod === 'COD' ? 1 : 0;
  const result = await shippingService.checkServiceability(
    PICKUP_POSTCODE,
    shippingAddress.pincode,
    getOrderWeightKg(items),
    cod
  );

  if (!result.serviceable || !result.couriers?.length) {
    const error = new Error('Delivery is not available for this pincode');
    error.statusCode = 400;
    throw error;
  }

  const cheapestCourier = result.couriers
    .filter(courier => Number.isFinite(Number(courier.freightCharges)) && Number(courier.freightCharges) > 0)
    .sort((a, b) => {
      const chargeA = Number(a.freightCharges) + (cod === 1 ? Number(a.codCharges) || 0 : 0);
      const chargeB = Number(b.freightCharges) + (cod === 1 ? Number(b.codCharges) || 0 : 0);

      return chargeA - chargeB;
    })[0];

  if (!cheapestCourier) {
    const error = new Error('No Shiprocket shipping charge available for this pincode');
    error.statusCode = 400;
    throw error;
  }

  const freightCharge = Number(cheapestCourier.freightCharges);
  const codCharge = cod === 1 ? Number(cheapestCourier?.codCharges) || 0 : 0;

  return Math.ceil(freightCharge + codCharge);
};

// @route   POST /api/orders/create
// @desc    Create new order
router.post('/create', optional, validateOrderData, async (req, res) => {
  try {
    console.log('📦 Order creation request received');
    const { items, shippingAddress, paymentMethod, guestDetails, guestVerificationToken } = req.body;

    const isGuestPhoneVerified = () => {
      if (!guestVerificationToken) return false;

      try {
        const decoded = jwt.verify(guestVerificationToken, process.env.JWT_SECRET);
        return decoded.purpose === 'checkout_guest' && decoded.phone === shippingAddress.phone;
      } catch (error) {
        return false;
      }
    };

    if (req.user) {
      const userPhoneMatches = req.user.phone === shippingAddress.phone;

      if (!req.user.isPhoneVerified) {
        return res.status(403).json({
          success: false,
          message: 'Please verify your phone number before placing an order.'
        });
      }

      if (!userPhoneMatches && !isGuestPhoneVerified()) {
        return res.status(403).json({
          success: false,
          message: 'Please verify the delivery phone number before placing this order.'
        });
      }
    } else if (!isGuestPhoneVerified()) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your phone number with OTP before placing this order.'
      });
    }
    
    // Validate order value for COD
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    console.log('💰 Order subtotal:', subtotal);
    
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
    console.log('🆔 Generated order ID:', orderId);
    
    // Calculate pricing
    let shipping;
    try {
      shipping = await getShiprocketShippingCharge(shippingAddress, items, paymentMethod);
    } catch (error) {
      return res.status(error.statusCode || 502).json({
        success: false,
        message: error.statusCode
          ? error.message
          : 'Unable to calculate Shiprocket shipping charges. Please try again.'
      });
    }
    const discount = paymentMethod === 'PREPAID' ? 25 : 0;
    const total = subtotal + shipping - discount;

    const customerType = req.user ? 'registered' : 'guest';
    const sessionId = req.headers['x-session-id'] || null;
    const clientInfo = getClientInfo(req);
    let guestUserRecord = null;

    if (customerType === 'guest' && sessionId) {
      guestUserRecord = await findOrCreateGuestUser(sessionId, req);
    }

    const orderItems = items.map((item) => ({
      ...item,
      lineTotal: (item.price || 0) * (item.quantity || 0)
    }));

    const order = await Order.create({
      orderId,
      customerType,
      user: req.user?._id,
      guestUser: guestUserRecord?._id,
      guestSessionId: customerType === 'guest' ? sessionId : undefined,
      guestDetails: !req.user ? guestDetails : undefined,
      items: orderItems,
      shippingAddress,
      pricing: { subtotal, shipping, discount, total },
      paymentMethod,
      paymentStatus: 'PENDING',
      isFirstOrder,
      isOTPVerified: customerType === 'guest' ? isGuestPhoneVerified() : true,
      clientInfo,
      placedAt: new Date(),
      statusHistory: [{
        status: 'PENDING',
        note: 'Order created',
        source: 'system'
      }],
      orderLog: [{
        event: 'ORDER_CREATED',
        timestamp: new Date(),
        source: 'system',
        details: {
          customerType,
          paymentMethod,
          itemCount: orderItems.length,
          totalItems: orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
          subtotal,
          shipping,
          discount,
          total,
          isFirstOrder,
          sessionId,
          userId: req.user?._id || null,
          guestUserId: guestUserRecord?._id || null
        }
      }],
      paymentLog: [{
        status: 'PENDING',
        timestamp: new Date(),
        amount: total,
        message: `Order initiated with ${paymentMethod}`
      }]
    });

    if (req.user) {
      await logUserActivity(req.user, 'ORDER_PLACED', {
        orderId,
        total,
        paymentMethod,
        itemCount: orderItems.length
      }, req);

      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { orderHistory: order._id }
      });
    } else if (guestUserRecord) {
      await logUserActivity(guestUserRecord, 'ORDER_PLACED', {
        orderId,
        total,
        paymentMethod,
        itemCount: orderItems.length,
        guestDetails
      }, req);
    }

    const cartQuery = req.user
      ? { user: req.user._id }
      : { sessionId };

    const activeCart = await Cart.findOne(cartQuery);
    if (activeCart) {
      activeCart.activityLog = activeCart.activityLog || [];
      activeCart.activityLog.push({
        action: 'CHECKOUT',
        timestamp: new Date(),
        customerType,
        userId: req.user?._id || null,
        sessionId,
        note: `Checkout completed for order ${orderId}`,
        itemCountAfter: 0
      });
      activeCart.items = [];
      activeCart.itemCount = 0;
      activeCart.totalValue = 0;
      activeCart.lastActivityAt = new Date();
      await activeCart.save();
    }
    
    console.log('✅ Order created successfully:', orderId);
    
    res.status(201).json({
      success: true,
      order,
      requiresOTP: paymentMethod === 'COD' && (subtotal > 500 || isFirstOrder)
    });
  } catch (error) {
    console.error('❌ Order creation error:', error);
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
  res.status(410).json({
    success: false,
    message: 'Order OTP verification now happens before order creation.'
  });
});

module.exports = router;
