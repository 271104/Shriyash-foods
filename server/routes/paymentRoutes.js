const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { appendOrderLog, appendPaymentLog } = require('../utils/activityLogger');
const { sendOrderConfirmationNotifications } = require('../services/orderNotification.service');
const shippingService = require('../services/shipping.service');

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

    await appendOrderLog(orderId, 'PAYMENT_INITIATED', {
      razorpayOrderId: razorpayOrder.id,
      amount
    }, 'payment');

    await appendPaymentLog(orderId, {
      status: 'INITIATED',
      razorpayOrderId: razorpayOrder.id,
      amount,
      message: 'Razorpay payment order created'
    });
    
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
        paidAt: new Date(),
        $push: {
          statusHistory: {
            status: 'CONFIRMED',
            note: 'Payment successful',
            source: 'payment'
          }
        }
      },
      { new: true }
    );

    if (order) {
      await appendOrderLog(orderId, 'PAYMENT_SUCCESS', {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id
      }, 'payment');

      await appendPaymentLog(orderId, {
        status: 'PAID',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount: order.pricing?.total,
        message: 'Payment verified successfully'
      });
    }
    
    if (!order) {
      console.error('❌ Order not found after payment verification:', orderId);
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    console.log('✅ Payment verified successfully for order:', orderId);
    console.log('📋 Order details before Shiprocket call:', {
      orderId: order.orderId,
      customer: order.customer?.name,
      itemCount: order.items?.length,
      total: order.pricing?.total,
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress?.city
    });

    // 🚀 Create Shiprocket shipment order
    try {
      console.log('📦 STARTING: Creating Shiprocket shipment for order:', orderId);
      console.log('🔍 Calling shippingService.createShipment()...');
      const shiprocketResult = await shippingService.createShipment(order.toObject());
      console.log('📦 RESPONSE from shippingService.createShipment():', shiprocketResult);
      
      if (shiprocketResult && shiprocketResult.success) {
        console.log('✅ SUCCESS: Shiprocket shipment created successfully:', {
          orderId,
          shiprocketOrderId: shiprocketResult.shiprocketOrderId,
          shipmentId: shiprocketResult.shipmentId,
          message: shiprocketResult.message
        });

        await appendOrderLog(orderId, 'SHIPMENT_CREATED', {
          shiprocketOrderId: shiprocketResult.shiprocketOrderId,
          shipmentId: shiprocketResult.shipmentId
        }, 'shiprocket');

        console.log('🚚 STARTING: Assigning AWB...');

        const awbResult = await shippingService.assignAWB(
          shiprocketResult.shipmentId
        );

        console.log('🚚 AWB RESULT:', awbResult);

        console.log('📦 STARTING: Generating Pickup...');

        const pickupResult = await shippingService.generatePickup(
          shiprocketResult.shipmentId
        );

        console.log('📦 PICKUP RESULT:', pickupResult);

        await Order.findOneAndUpdate(
          { orderId },
          {
            awbCode: awbResult.awbCode,
            courierName: awbResult.courierName,

            $push: {
              shippingLog: {
                status: 'AWB_ASSIGNED',
                awbCode: awbResult.awbCode,
                courierName: awbResult.courierName,
                shipmentId: awbResult.shipmentId,
                message: 'AWB assigned successfully'
              }
            }
          }
        );
        await Order.findOneAndUpdate(
          { orderId },
          {
            pickupReference: pickupResult.pickupReference,
            shippingStatus: 'PICKUP_GENERATED',

            $push: {
              shippingLog: {
                status: 'PICKUP_GENERATED',
                awbCode: awbResult.awbCode,
                courierName: awbResult.courierName,
                shipmentId: awbResult.shipmentId,
                message: pickupResult.message
              }
            }
          }
        );

        console.log('✅ Pickup details saved to MongoDB');
      
      } else {
        console.warn('⚠️ FAILED: Shiprocket shipment creation failed:', {
          orderId,
          message: shiprocketResult?.message,
          error: shiprocketResult?.error,
          fullResponse: shiprocketResult
        });
        // Don't fail the payment verification, just log the warning
        await appendOrderLog(orderId, 'SHIPMENT_CREATION_FAILED', {
          error: shiprocketResult?.message || 'Unknown error',
          fullResponse: shiprocketResult
        }, 'shiprocket');
      }
    } catch (shiprocketError) {
      console.error('❌ EXCEPTION: Error creating Shiprocket shipment:', {
        orderId,
        message: shiprocketError.message,
        error: shiprocketError.error,
        stack: shiprocketError.stack,
        fullError: shiprocketError
      });
      // Don't fail the payment verification, just log the error
      await appendOrderLog(orderId, 'SHIPMENT_CREATION_ERROR', {
        error: shiprocketError.message || shiprocketError.toString(),
        fullError: shiprocketError
      }, 'shiprocket');
    }

    sendOrderConfirmationNotifications(orderId).catch((err) => {
      console.error('Prepaid order notification error:', err.message);
    });

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
            note: `Payment failed: ${error || 'Unknown error'}`,
            source: 'payment'
          }
        }
      },
      { new: true }
    );

    if (updatedOrder) {
      await appendOrderLog(orderId, 'PAYMENT_FAILED', { error: error || 'Unknown error' }, 'payment');
      await appendPaymentLog(orderId, {
        status: 'FAILED',
        amount: updatedOrder.pricing?.total,
        message: error || 'Payment failed'
      });
    }
    
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
