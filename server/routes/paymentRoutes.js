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
    
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: orderId,
      payment_capture: 1
    };
    
    const razorpayOrder = await getRazorpay().orders.create(options);
    
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
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/payment/verify
// @desc    Verify Razorpay payment
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    
    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');
    
    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
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
    
    res.json({ success: true, message: 'Payment verified successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/payment/failed
// @desc    Handle payment failure
router.post('/failed', async (req, res) => {
  try {
    const { orderId, error } = req.body;
    
    await Order.findOneAndUpdate(
      { orderId },
      {
        paymentStatus: 'FAILED',
        $push: {
          statusHistory: {
            status: 'FAILED',
            note: `Payment failed: ${error}`
          }
        }
      }
    );
    
    res.json({ success: true, message: 'Payment failure recorded' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
