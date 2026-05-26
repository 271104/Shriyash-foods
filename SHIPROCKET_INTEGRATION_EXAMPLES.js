/**
 * EXAMPLE: How to Integrate Shiprocket into Your Checkout Flow
 * 
 * This example shows how to call the shipping service after payment confirmation
 * Add this to your existing orderRoutes.js or paymentRoutes.js
 */

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const shippingService = require('../services/shipping.service');

/**
 * EXAMPLE 1: Complete Order-to-Shipment Flow
 * 
 * After payment is confirmed (PAID or COD), trigger shipping automation
 */
router.post('/confirm-and-ship', async (req, res) => {
  try {
    const { orderId } = req.body;

    // Step 1: Find order
    const order = await Order.findOne({ orderId }).populate('items.product');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Step 2: Verify payment is confirmed
    if (order.paymentStatus !== 'PAID' && order.paymentMethod !== 'COD') {
      return res.status(400).json({
        success: false,
        message: 'Payment not confirmed'
      });
    }

    // Step 3: Check serviceability before creating shipment
    const serviceability = await shippingService.checkServiceability(
      '413005', // Your warehouse postcode
      order.shippingAddress.pincode,
      0.5, // Average weight
      order.paymentMethod === 'COD' ? 1 : 0
    );

    if (!serviceability.success || serviceability.couriers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Delivery not available for this pincode',
        couriers: []
      });
    }

    // Step 4: Create shipment
    console.log(`📦 Creating shipment for order: ${orderId}`);
    const shipment = await shippingService.createShipment(order.toObject());
    
    if (!shipment.success) {
      throw new Error(shipment.message);
    }

    const shipmentId = shipment.shipmentId;
    console.log(`✅ Shipment created: ${shipmentId}`);

    // Step 5: Assign AWB
    console.log(`🏷️  Assigning AWB...`);
    const awb = await shippingService.assignAWB(shipmentId);
    
    if (!awb.success) {
      throw new Error(awb.message);
    }

    console.log(`✅ AWB assigned: ${awb.awbCode} (${awb.courierName})`);

    // Step 6: Generate pickup
    console.log(`📍 Generating pickup...`);
    const pickup = await shippingService.generatePickup(shipmentId);
    
    if (!pickup.success) {
      throw new Error(pickup.message);
    }

    console.log(`✅ Pickup scheduled: ${pickup.pickupScheduledDate}`);

    // Step 7: Update order status
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      {
        orderStatus: 'SHIPPED',
        shiprocketOrderId: shipment.shiprocketOrderId,
        shiprocketShipmentId: shipmentId,
        awbCode: awb.awbCode,
        courierName: awb.courierName,
        trackingUrl: awb.trackingUrl,
        pickupReference: pickup.pickupReference,
        shippingStatus: 'PICKUP_GENERATED',
        $push: {
          statusHistory: [
            {
              status: 'SHIPMENT_CREATED',
              note: `Shiprocket shipment: ${shipmentId}`
            },
            {
              status: 'AWB_ASSIGNED',
              note: `AWB: ${awb.awbCode} via ${awb.courierName}`
            },
            {
              status: 'PICKUP_GENERATED',
              note: `Pickup scheduled: ${pickup.pickupScheduledDate}`
            }
          ]
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Order confirmed and shipped successfully',
      order: {
        orderId: updatedOrder.orderId,
        orderStatus: updatedOrder.orderStatus,
        awbCode: updatedOrder.awbCode,
        courierName: updatedOrder.courierName,
        trackingUrl: updatedOrder.trackingUrl
      }
    });

  } catch (error) {
    console.error('❌ Order confirmation error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to confirm order and create shipment',
      error: error.message
    });
  }
});

/**
 * EXAMPLE 2: Razorpay Webhook Handler with Shiprocket Integration
 * 
 * Called when Razorpay payment is successful
 */
router.post('/razorpay-webhook', async (req, res) => {
  try {
    const { paymentId, orderId, status } = req.body;

    if (status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: 'Payment not captured'
      });
    }

    // Step 1: Update order payment status
    const order = await Order.findOneAndUpdate(
      { orderId },
      {
        paymentStatus: 'PAID',
        razorpayPaymentId: paymentId
      },
      { new: true }
    ).populate('items.product');

    // Step 2: Trigger automatic shipping (same as Example 1)
    const shipment = await shippingService.createShipment(order.toObject());
    const awb = await shippingService.assignAWB(shipment.shipmentId);
    await shippingService.generatePickup(shipment.shipmentId);

    // Step 3: Update order with shipping info
    await Order.findOneAndUpdate(
      { orderId },
      {
        orderStatus: 'SHIPPED',
        shiprocketOrderId: shipment.shiprocketOrderId,
        shiprocketShipmentId: shipment.shipmentId,
        awbCode: awb.awbCode,
        courierName: awb.courierName,
        trackingUrl: awb.trackingUrl
      }
    );

    // Step 4: Send confirmation email with tracking link
    // (Add email sending logic here)

    res.json({
      success: true,
      message: 'Payment processed and shipment created'
    });

  } catch (error) {
    console.error('❌ Razorpay webhook error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

/**
 * EXAMPLE 3: Get Shipping Cost Before Checkout
 * 
 * Called during checkout to show shipping options and cost
 */
router.post('/calculate-shipping', async (req, res) => {
  try {
    const { pincode, weight } = req.body;

    if (!pincode) {
      return res.status(400).json({
        success: false,
        message: 'Pincode is required'
      });
    }

    // Check serviceability and get courier options
    const result = await shippingService.checkServiceability(
      '413005', // Warehouse pincode
      pincode,
      parseFloat(weight) || 0.5,
      1 // COD available
    );

    // Format response for frontend
    const shippingOptions = result.couriers.map(courier => ({
      name: courier.name,
      cost: courier.freightCharges,
      codCharges: courier.codCharges,
      eta: courier.etd,
      isSelected: false
    }));

    res.json({
      success: true,
      serviceable: shippingOptions.length > 0,
      options: shippingOptions,
      recommendedOption: shippingOptions[0] || null
    });

  } catch (error) {
    console.error('❌ Shipping calculation error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate shipping'
    });
  }
});

/**
 * EXAMPLE 4: Cancel Order with Shiprocket
 * 
 * Called when customer wants to cancel an order
 */
router.post('/cancel-order', async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only allow cancellation before pickup
    const allowedStatuses = [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPMENT_CREATED',
      'AWB_ASSIGNED'
    ];

    if (!allowedStatuses.includes(order.shippingStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.shippingStatus}`
      });
    }

    // Cancel in Shiprocket if order exists there
    if (order.shiprocketOrderId) {
      const result = await shippingService.cancelOrder(order.shiprocketOrderId);
      
      if (!result.success) {
        console.warn('⚠️  Shiprocket cancellation failed but continuing:', result.message);
      }
    }

    // Update order status
    const cancelledOrder = await Order.findOneAndUpdate(
      { orderId },
      {
        orderStatus: 'CANCELLED',
        shippingStatus: 'CANCELLED',
        $push: {
          statusHistory: {
            status: 'CANCELLED',
            note: 'Order cancelled by customer'
          }
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: {
        orderId: cancelledOrder.orderId,
        orderStatus: cancelledOrder.orderStatus
      }
    });

  } catch (error) {
    console.error('❌ Order cancellation error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
});

/**
 * EXAMPLE 5: Cron Job for Abandoned Orders
 * 
 * Run periodically (every hour) to process abandoned COD orders
 * Automatically create shipments for orders that reached payment deadline
 */
async function processAbandonedOrders() {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Find orders that need shipping
    const pendingOrders = await Order.find({
      paymentMethod: 'COD',
      shippingStatus: 'PENDING',
      createdAt: { $lt: oneHourAgo },
      orderStatus: 'CONFIRMED'
    }).populate('items.product');

    console.log(`⏰ Processing ${pendingOrders.length} abandoned COD orders...`);

    for (const order of pendingOrders) {
      try {
        // Create shipment automatically
        const shipment = await shippingService.createShipment(order.toObject());
        const awb = await shippingService.assignAWB(shipment.shipmentId);
        await shippingService.generatePickup(shipment.shipmentId);

        await Order.findOneAndUpdate(
          { orderId: order.orderId },
          {
            orderStatus: 'SHIPPED',
            shiprocketOrderId: shipment.shiprocketOrderId,
            shiprocketShipmentId: shipment.shipmentId,
            awbCode: awb.awbCode
          }
        );

        console.log(`✅ Processed: ${order.orderId}`);
      } catch (error) {
        console.error(`❌ Failed to process ${order.orderId}:`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ Cron job error:', error.message);
  }
}

/**
 * Schedule cron job (add to your server.js)
 * 
 * // In server.js, add:
 * const schedule = require('node-schedule');
 * schedule.scheduleJob('0 * * * *', () => {
 *   require('./routes/orderRoutes').processAbandonedOrders();
 * });
 */

module.exports = router;

// Export cron function for external scheduling
module.exports.processAbandonedOrders = processAbandonedOrders;

/**
 * INTEGRATION CHECKLIST:
 * 
 * 1. Add shippingService import to your actual orderRoutes.js
 * 2. Choose which flow suits your needs:
 *    - POST /confirm-and-ship: Manual shipping trigger
 *    - Razorpay webhook: Automatic on payment
 *    - Cron job: Automatic for abandoned COD orders
 * 3. Add email notifications after shipment creation
 * 4. Test with sample orders before going live
 * 5. Monitor logs for any Shiprocket API errors
 * 6. Set up webhook to receive status updates
 */
