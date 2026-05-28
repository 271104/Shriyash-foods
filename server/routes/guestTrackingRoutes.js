const express = require('express');
const router = express.Router();
const guestTrackingController = require('../controllers/guestTracking.controller');

// Rate limiter for OTP attempts
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  keyGenerator: (req) => `${req.body.phone}-otp`, // Rate limit by phone number
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again later.'
  },
  skip: (req) => process.env.NODE_ENV === 'development' // Skip in dev
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  keyGenerator: (req) => `${req.body.phone}-verify`, // Rate limit by phone
  message: {
    success: false,
    message: 'Too many verification attempts. Please try again later.'
  },
  skip: (req) => process.env.NODE_ENV === 'development'
});

/**
 * Guest Tracking Routes
 * Public routes - No authentication required
 * Security: OTP verification required for sensitive data
 */

/**
 * POST /api/track-guest/send-otp
 * Send OTP to guest's phone for order tracking
 * Body: { phone, orderId }
 */
router.post('/send-otp', otpLimiter, guestTrackingController.sendGuestTrackingOTP);

/**
 * POST /api/track-guest/verify-otp
 * Verify OTP and retrieve full order details
 * Body: { phone, orderId, otp }
 */
router.post('/verify-otp', verifyLimiter, guestTrackingController.verifyGuestTrackingOTP);

/**
 * GET /api/track-guest/:orderId
 * Get basic order details (phone required as query param)
 * Query: ?phone={phone}
 * Note: For quick lookup without OTP
 */
router.get('/:orderId', guestTrackingController.getGuestOrderDetails);

/**
 * POST /api/track-guest/my-orders
 * Get all orders for a phone number (requires OTP verification)
 * Body: { phone, otp }
 */
router.post('/my-orders', verifyLimiter, guestTrackingController.getGuestOrders);

module.exports = router;
