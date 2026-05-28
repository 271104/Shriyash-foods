const Order = require('../models/Order');
const { sendWhatsAppOTP } = require('../services/otpService');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');

/**
 * Send OTP for guest order tracking
 * POST /api/orders/track-guest/send-otp
 */
exports.sendGuestTrackingOTP = async (req, res) => {
  try {
    const { phone, orderId } = req.body;

    // Validate input
    if (!phone || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and Order ID are required'
      });
    }

    // Validate phone format (10 digits)
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Check if order exists with this phone
    const order = await Order.findOne({ orderId });

    if (!order) {
      console.log('⚠️ Order not found:', orderId);
      // Don't reveal if order exists (security)
      return res.status(404).json({
        success: false,
        message: 'Order not found. Please check your Order ID.'
      });
    }

    // Verify phone matches order
    const orderPhone = order.guestDetails?.phone || order.shippingAddress?.phone;
    if (orderPhone !== phone) {
      console.log('⚠️ Phone mismatch for order:', { orderId, providedPhone: phone, orderPhone });
      return res.status(403).json({
        success: false,
        message: 'Phone number does not match this order'
      });
    }

    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to database
    await OTP.findOneAndUpdate(
      { phone, purpose: 'track_guest', isUsed: false },
      {
        phone,
        otp,
        purpose: 'track_guest',
        attempts: 0,
        isUsed: false,
        expiresAt,
        orderId
      },
      { upsert: true, new: true }
    );

    // Send OTP via WhatsApp
    try {
      await sendWhatsAppOTP(phone, otp);
      console.log('✅ Guest tracking OTP sent:', { phone, orderId });
    } catch (whatsappError) {
      console.error('⚠️ WhatsApp OTP failed, will retry:', whatsappError.message);
      // Don't fail the request, user can still verify
    }

    res.json({
      success: true,
      message: `OTP sent to ${phone}`,
      expiresIn: 5 * 60 // 5 minutes in seconds
    });
  } catch (error) {
    console.error('❌ Error sending guest tracking OTP:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
};

/**
 * Verify OTP and get guest order details
 * POST /api/orders/track-guest/verify-otp
 */
exports.verifyGuestTrackingOTP = async (req, res) => {
  try {
    const { phone, orderId, otp } = req.body;

    // Validate input
    if (!phone || !orderId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone, Order ID, and OTP are required'
      });
    }

    // Find and verify OTP
    const otpRecord = await OTP.findOne({
      phone,
      purpose: 'track_guest',
      orderId,
      isUsed: false
    });

    if (!otpRecord) {
      return res.status(404).json({
        success: false,
        message: 'OTP not found or expired. Please request a new OTP.'
      });
    }

    // Check if OTP expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.findByIdAndUpdate(otpRecord._id, { isUsed: true });
      return res.status(401).json({
        success: false,
        message: 'OTP expired. Please request a new OTP.'
      });
    }

    // Check OTP attempts
    if (otpRecord.attempts >= 3) {
      await OTP.findByIdAndUpdate(otpRecord._id, { isUsed: true });
      return res.status(429).json({
        success: false,
        message: 'Maximum OTP attempts exceeded. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      await OTP.findByIdAndUpdate(otpRecord._id, { attempts: otpRecord.attempts + 1 });
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP. Please try again.',
        attemptsRemaining: 3 - (otpRecord.attempts + 1)
      });
    }

    // OTP verified successfully
    await OTP.findByIdAndUpdate(otpRecord._id, { isUsed: true });

    // Get full order details
    const order = await Order.findOne({ orderId }).populate('user');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Generate temporary access token for this order
    const accessToken = jwt.sign(
      {
        orderId,
        phone,
        purpose: 'guest_tracking',
        orderAccess: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Format order response
    const orderResponse = {
      orderId: order.orderId,
      orderDate: order.createdAt,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      pricing: order.pricing,
      items: order.items.map(item => ({
        name: item.name,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: order.shippingAddress,
      
      // Shipping info
      shiprocketOrderId: order.shiprocketOrderId,
      shippingStatus: order.shippingStatus,
      awbCode: order.awbCode,
      courierName: order.courierName,
      trackingUrl: order.trackingUrl,
      
      // Timeline
      statusHistory: order.statusHistory.map(h => ({
        status: h.status,
        timestamp: h.timestamp,
        note: h.note
      })),
      
      // Downloads
      invoiceUrl: order.invoiceUrl,
      labelUrl: order.labelUrl,
      
      // Additional
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      failedAttempts: order.shippingStatus === 'FAILED_ATTEMPT' ? 1 : 0
    };

    console.log('✅ Guest order verified:', { orderId, phone });

    res.json({
      success: true,
      message: 'Order details retrieved',
      order: orderResponse,
      accessToken // Can be used for follow-up requests
    });
  } catch (error) {
    console.error('❌ Error verifying guest OTP:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    });
  }
};

/**
 * Get guest order details without OTP (if already verified in session)
 * GET /api/orders/track-guest/:orderId
 * Query: ?phone={phone}
 */
exports.getGuestOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Find order
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify phone matches
    const orderPhone = order.guestDetails?.phone || order.shippingAddress?.phone;
    if (orderPhone !== phone) {
      console.log('⚠️ Unauthorized guest tracking attempt:', { orderId, phone });
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Format response
    const orderResponse = {
      orderId: order.orderId,
      status: order.orderStatus,
      shippingStatus: order.shippingStatus,
      awbCode: order.awbCode,
      courierName: order.courierName,
      trackingUrl: order.trackingUrl,
      statusHistory: order.statusHistory,
      items: order.items,
      pricing: order.pricing,
      shippingAddress: order.shippingAddress,
      estimatedDeliveryDate: order.estimatedDeliveryDate
    };

    res.json({
      success: true,
      order: orderResponse
    });
  } catch (error) {
    console.error('❌ Error getting guest order details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order details'
    });
  }
};

/**
 * Search guest orders by phone + recent OTP verification
 * Useful for "View all my orders" page after guest verification
 * POST /api/orders/track-guest/my-orders
 */
exports.getGuestOrders = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone and OTP are required'
      });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({
      phone,
      purpose: 'track_guest',
      otp,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Find all orders with this phone
    const orders = await Order.find({
      $or: [
        { 'guestDetails.phone': phone },
        { 'shippingAddress.phone': phone }
      ]
    }).sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.json({
        success: true,
        message: 'No orders found',
        orders: []
      });
    }

    // Format response
    const formattedOrders = orders.map(order => ({
      orderId: order.orderId,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      total: order.pricing.total,
      createdAt: order.createdAt,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      itemCount: order.items.length
    }));

    console.log('✅ Retrieved guest orders:', { phone, count: orders.length });

    res.json({
      success: true,
      message: `Found ${orders.length} order(s)`,
      orders: formattedOrders,
      total: orders.length
    });
  } catch (error) {
    console.error('❌ Error getting guest orders:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders'
    });
  }
};

module.exports = exports;
