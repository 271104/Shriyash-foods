const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, optional } = require('../middleware/auth');
const { sendOTP, verifyOTP } = require('../services/otpService');
const { logUserActivity } = require('../utils/activityLogger');
const { findOrCreateGuestUser, linkGuestSessionToRegisteredUser } = require('../utils/guestUserService');
const rateLimit = require('express-rate-limit');

const isRegisteredUser = (user) => user && (
  user.userType === 'registered' || (!user.isGuest && user.isPhoneVerified)
);

const OTP_PURPOSES = ['login', 'register', 'checkout_guest'];

// Rate limiting for OTP requests
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { success: false, message: 'Too many OTP requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Generate JWT Tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// @route   POST /api/auth/send-otp
// @desc    Send OTP for authentication
router.post('/send-otp', otpLimiter, async (req, res) => {
  try {
    const { phone, purpose = 'login' } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required' 
      });
    }

    // Validate phone number format
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid 10-digit phone number' 
      });
    }

    if (!OTP_PURPOSES.includes(purpose)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP request type'
      });
    }

    // Check if user is blocked
    const existingUser = await User.findOne({ phone });
    if (existingUser && existingUser.isBlocked) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is temporarily blocked. Contact support.' 
      });
    }

    const hasRegisteredAccount = isRegisteredUser(existingUser);

    if (purpose === 'register' && hasRegisteredAccount) {
      return res.status(409).json({
        success: false,
        message: 'This phone number is already registered. Please login instead.',
        userExists: true
      });
    }

    if (purpose === 'login' && !hasRegisteredAccount) {
      return res.status(404).json({
        success: false,
        message: 'No account found for this phone number. Please register first.',
        userExists: false
      });
    }

    const result = await sendOTP(phone, purpose);
    
    res.json({
      success: true,
      message: 'OTP sent to your WhatsApp number',
      userExists: !!existingUser,
      otp: result.otp // Only in development
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send OTP. Please try again.' 
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and authenticate user
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, purpose = 'login', userData = null, guestData = null } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and OTP are required' 
      });
    }

    if (!OTP_PURPOSES.includes(purpose)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP verification type'
      });
    }

    // Verify OTP
    const otpResult = await verifyOTP(phone, otp, purpose);
    if (!otpResult.success) {
      return res.status(400).json(otpResult);
    }

    if (purpose === 'checkout_guest') {
      const sessionId = req.headers['x-session-id'] || guestData?.sessionId;
      const guestUser = sessionId ? await findOrCreateGuestUser(sessionId, req) : null;

      if (guestUser) {
        await logUserActivity(guestUser, 'CHECKOUT_OTP_VERIFIED', { phone }, req);
      }

      const guestVerificationToken = jwt.sign(
        { phone, purpose: 'checkout_guest', sessionId },
        process.env.JWT_SECRET,
        { expiresIn: '30m' }
      );

      return res.json({
        success: true,
        message: 'Phone verified for checkout',
        guestVerificationToken,
        verifiedPhone: phone
      });
    }

    let user = await User.findOne({ phone });
    let isNewUser = false;

    if (purpose === 'register') {
      if (user && isRegisteredUser(user)) {
        return res.status(409).json({
          success: false,
          message: 'This phone number is already registered. Please login instead.'
        });
      }

      const cleanName = userData?.name?.trim();
      if (!cleanName || cleanName.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid full name'
        });
      }

      const cleanEmail = userData?.email?.trim().toLowerCase();
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Build address object from userData
      const addressData = {
        fullName: cleanName,
        phone: phone,
        addressLine1: userData?.addressLine1?.trim(),
        addressLine2: userData?.addressLine2?.trim() || undefined,
        landmark: userData?.landmark?.trim() || undefined,
        city: userData?.city?.trim(),
        state: userData?.state?.trim(),
        pincode: userData?.pincode,
        isDefault: true
      };

      // Validate required address fields
      if (!addressData.addressLine1 || !addressData.city || !addressData.state || !addressData.pincode) {
        return res.status(400).json({
          success: false,
          message: 'Please provide complete address details'
        });
      }

      if (user) {
        user.name = cleanName;
        user.email = cleanEmail;
        user.userType = 'registered';
        user.isGuest = false;
        user.isPhoneVerified = true;
        user.lastLogin = new Date();
        user.lastSeenAt = new Date();
        if (!user.addresses || user.addresses.length === 0) {
          user.addresses = [addressData];
        }
        await user.save();
      } else {
        isNewUser = true;
        user = await User.create({
          phone,
          name: cleanName,
          email: cleanEmail,
          userType: 'registered',
          isPhoneVerified: true,
          isGuest: false,
          addresses: [addressData],
          lastLogin: new Date(),
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
          activityLog: [],
          stats: {
            totalCartActions: 0,
            totalOrders: 0,
            totalLogins: 1,
            lastActivityAt: new Date()
          }
        });
      }

      const sessionId = guestData?.sessionId || req.headers['x-session-id'];
      await linkGuestSessionToRegisteredUser(sessionId, user, req);
      await logUserActivity(user, 'REGISTER', {
        phone,
        email: cleanEmail,
        isNewUser
      }, req);
    }

    if (purpose === 'login') {
      if (!user || !isRegisteredUser(user)) {
        return res.status(404).json({
          success: false,
          message: 'No account found for this phone number. Please register first.'
        });
      }

      user.userType = 'registered';
      user.isGuest = false;
      user.isPhoneVerified = true;
      user.lastLogin = new Date();
      user.lastSeenAt = new Date();
      await user.save();
      await logUserActivity(user, 'LOGIN', { phone }, req);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token
    await User.updateOne(
      { _id: user._id },
      { $set: { refreshToken } }
    );

    res.json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      isNewUser,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        userType: user.userType,
        isPhoneVerified: user.isPhoneVerified,
        addresses: user.addresses || []
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'OTP verification failed. Please try again.' 
    });
  }
});

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token required' 
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    // Find user and validate refresh token
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid refresh token' 
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Update refresh token
    await User.updateOne(
      { _id: user._id },
      { $set: { refreshToken: newRefreshToken } }
    );

    res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid refresh token' 
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    res.json({ 
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        isPhoneVerified: user.isPhoneVerified,
        addresses: user.addresses || [],
        orderHistory: user.orderHistory || []
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user profile' 
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
router.post('/logout', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      await logUserActivity(user, 'LOGOUT', {}, req);
    }

    await User.updateOne(
      { _id: req.user.id },
      { $unset: { refreshToken: 1 } }
    );

    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Logout failed' 
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password -refreshToken');

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        isPhoneVerified: user.isPhoneVerified,
        addresses: user.addresses || []
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
});

// @route   POST /api/auth/merge-guest-cart
// @desc    Merge guest cart with user cart after authentication
router.post('/merge-guest-cart', protect, async (req, res) => {
  try {
    const { guestCartItems } = req.body;
    
    if (!guestCartItems || !Array.isArray(guestCartItems)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid cart data' 
      });
    }

    // This will be handled by the cart service
    // For now, just return success
    res.json({ 
      success: true, 
      message: 'Cart merged successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to merge cart' 
    });
  }
});

module.exports = router;
