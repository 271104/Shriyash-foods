const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @route   POST /api/payment/create-order
// @desc    Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    
    if (!orderId || !amount) {
      console.error('❌ Missing required fields for order creation:', { orderId, amount });
      return res.status(400).json({ 
        success: false, 
        message: 'Missing orderId or amount' 
      });
    }
    
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: orderId,
      payment_capture: 1
    };
    
    console.log('📝 Creating Razorpay order:', { orderId, amountInPaise: options.amount });
    
    const razorpayOrder = await getRazorpay().orders.create(options);
    
    console.log('✅ Razorpay order created:', { razorpayOrderId: razorpayOrder.id, orderId });
    
    // Update order with Razorpay order ID
    await Order.findOneAndUpdate(
      { orderId },
      { razorpayOrderId: razorpayOrder.id }
    );
    
    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error.message, error.response?.data);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment order: ' + error.message 
    });
  }
});

// @route   POST /api/payment/verify
// @desc    Verify Razorpay payment
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    
    // Validate inputs
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      console.error('❌ Missing payment verification fields:', { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId });
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required payment fields' 
      });
    }
    
    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');
    
    console.log('🔐 Payment Verification Attempt:', {
      orderId,
      razorpay_payment_id,
      signatureMatch: razorpay_signature === expectedSign
    });
    
    if (razorpay_signature !== expectedSign) {
      console.error('❌ Invalid payment signature:', {
        expected: expectedSign,
        received: razorpay_signature,
        orderId
      });
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment signature - verification failed' 
      });
    }
    
    // Update order
    const order = await Order.findOneAndUpdate(
      { orderId },
      {
        paymentStatus: 'PAID',
        razorpayPaymentId: razorpay_payment_id,
        orderStatus: 'CONFIRMED',
        $push: {
          statusHistory: {
            status: 'CONFIRMED',
            note: 'Payment successful'
          }
        }
      },
      { new: true }
    );
    
    if (!order) {
      console.error('❌ Order not found after payment verification:', orderId);
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    console.log('✅ Payment verified successfully for order:', orderId);
    res.json({ success: true, message: 'Payment verified successfully', order });
  } catch (error) {
    console.error('❌ Payment verification error:', error.message, error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Payment verification failed: ' + error.message 
    });
  }
});

// @route   POST /api/payment/failed
// @desc    Handle payment failure
router.post('/failed', async (req, res) => {
  try {
    const { orderId, error } = req.body;
    
    if (!orderId) {
      console.error('❌ Missing orderId in failed payment handler');
      return res.status(400).json({ 
        success: false, 
        message: 'Missing orderId' 
      });
    }
    
    console.log('❌ Recording payment failure for order:', { orderId, error });
    
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      {
        paymentStatus: 'FAILED',
        $push: {
          statusHistory: {
            status: 'FAILED',
            note: `Payment failed: ${error || 'Unknown error'}`
          }
        }
      },
      { new: true }
    );
    
    if (!updatedOrder) {
      console.error('❌ Order not found when recording payment failure:', orderId);
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Payment failure recorded',
      order: updatedOrder
    });
  } catch (error) {
    console.error('❌ Error recording payment failure:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to record payment failure: ' + error.message 
    });
  }
});

// @route   GET /api/payment/diagnostics
// @desc    Check payment configuration and diagnose issues
router.get('/diagnostics', (req, res) => {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      razorpay: {
        keyIdExists: !!process.env.RAZORPAY_KEY_ID,
        keyIdStart: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 10) + '***' : 'MISSING',
        keySecretExists: !!process.env.RAZORPAY_KEY_SECRET,
        keySecretStart: process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.substring(0, 5) + '***' : 'MISSING',
        isLiveKey: process.env.RAZORPAY_KEY_ID?.startsWith('rzp_live_')
      },
      issues: []
    };

    // Check for issues
    if (!process.env.RAZORPAY_KEY_ID) {
      diagnostics.issues.push('❌ RAZORPAY_KEY_ID is not set');
    }
    if (!process.env.RAZORPAY_KEY_SECRET) {
      diagnostics.issues.push('❌ RAZORPAY_KEY_SECRET is not set');
    }
    if (!diagnostics.razorpay.isLiveKey) {
      diagnostics.issues.push('⚠️ Using TEST keys instead of LIVE keys');
    }

    console.log('📊 Payment Diagnostics:', diagnostics);
    res.json({ success: true, diagnostics });
  } catch (error) {
    console.error('❌ Error in diagnostics:', error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
