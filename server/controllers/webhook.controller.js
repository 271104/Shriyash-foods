const Order = require('../models/Order');
const { appendOrderLog } = require('../utils/activityLogger');

/**
 * Shiprocket Webhook Controller
 * Receives and processes webhook events from Shiprocket.
 * Updates MongoDB orders with tracking updates.
 */

const SHIPROCKET_STATUS_MAP = {
  0: { status: 'PENDING', orderStatus: 'PENDING' },
  1: { status: 'SHIPMENT_CREATED', orderStatus: 'CONFIRMED' },
  2: { status: 'SHIPMENT_CREATED', orderStatus: 'PROCESSING' },
  3: { status: 'PICKUP_GENERATED', orderStatus: 'PROCESSING' },
  4: { status: 'PICKED_UP', orderStatus: 'SHIPPED' },
  5: { status: 'IN_TRANSIT', orderStatus: 'SHIPPED' },
  6: { status: 'OUT_FOR_DELIVERY', orderStatus: 'SHIPPED' },
  7: { status: 'DELIVERED', orderStatus: 'DELIVERED' },
  8: { status: 'FAILED_ATTEMPT', orderStatus: 'SHIPPED' },
  9: { status: 'CANCELLED', orderStatus: 'CANCELLED' },
  10: { status: 'RTO', orderStatus: 'RTO' }
};

const SHIPROCKET_TEXT_STATUS_MAP = {
  NEW: { status: 'PENDING', orderStatus: 'PENDING' },
  PENDING: { status: 'PENDING', orderStatus: 'PENDING' },
  ORDER_CREATED: { status: 'SHIPMENT_CREATED', orderStatus: 'CONFIRMED' },
  SHIPMENT_CREATED: { status: 'SHIPMENT_CREATED', orderStatus: 'CONFIRMED' },
  PICKUP_SCHEDULED: { status: 'PICKUP_GENERATED', orderStatus: 'PROCESSING' },
  PICKUP_GENERATED: { status: 'PICKUP_GENERATED', orderStatus: 'PROCESSING' },
  PICKED_UP: { status: 'PICKED_UP', orderStatus: 'SHIPPED' },
  SHIPPED: { status: 'IN_TRANSIT', orderStatus: 'SHIPPED' },
  IN_TRANSIT: { status: 'IN_TRANSIT', orderStatus: 'SHIPPED' },
  OUT_FOR_DELIVERY: { status: 'OUT_FOR_DELIVERY', orderStatus: 'SHIPPED' },
  DELIVERED: { status: 'DELIVERED', orderStatus: 'DELIVERED' },
  UNDELIVERED: { status: 'FAILED_ATTEMPT', orderStatus: 'SHIPPED' },
  FAILED_DELIVERY: { status: 'FAILED_ATTEMPT', orderStatus: 'SHIPPED' },
  CANCELLED: { status: 'CANCELLED', orderStatus: 'CANCELLED' },
  CANCELED: { status: 'CANCELLED', orderStatus: 'CANCELLED' },
  RTO: { status: 'RTO', orderStatus: 'RTO' },
  RTO_INITIATED: { status: 'RTO', orderStatus: 'RTO' },
  RTO_DELIVERED: { status: 'RTO', orderStatus: 'RTO' }
};

const normalizeStatusText = (status) => String(status || '')
  .trim()
  .toUpperCase()
  .replace(/[^A-Z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '');

/**
 * Handle Shiprocket webhook event.
 *
 * Shiprocket may send shipment_status as a text value like "IN TRANSIT",
 * while some older examples use numeric status IDs.
 */
exports.handleWebhook = async (req, res) => {
  try {
    const {
      awb,
      shipment_status,
      current_status,
      current_status_id,
      courier_name,
      shipment_id
    } = req.body;

    if (!awb && !shipment_id) {
      console.warn('Webhook received without awb or shipment_id');
      return res.json({
        success: true,
        message: 'Webhook received without order identifier',
        webhookProcessed: false
      });
    }

    if (shipment_status === undefined && current_status === undefined && current_status_id === undefined) {
      console.warn('Webhook received without status fields');
      return res.json({
        success: true,
        message: 'Webhook received without shipment status',
        webhookProcessed: false
      });
    }

    console.log('Shiprocket webhook received:', {
      awb,
      shipment_status,
      current_status,
      current_status_id,
      courier_name,
      shipment_id
    });

    const order = awb
      ? await Order.findOne({ awbCode: awb })
      : await Order.findOne({ shiprocketShipmentId: shipment_id });

    if (!order) {
      console.warn(`Webhook: Order not found (awb: ${awb}, shipment_id: ${shipment_id})`);
      return res.json({
        success: true,
        message: 'Webhook received (order not found - may be from external system)',
        webhookProcessed: false
      });
    }

    const numericStatus = Number.isInteger(Number(shipment_status))
      ? Number(shipment_status)
      : Number.isInteger(Number(current_status_id))
        ? Number(current_status_id)
        : null;
    const statusText = normalizeStatusText(current_status || shipment_status);
    const statusMapping = SHIPROCKET_STATUS_MAP[numericStatus]
      || SHIPROCKET_TEXT_STATUS_MAP[statusText]
      || {};
    const newStatus = statusMapping.status || statusText || 'PENDING';
    const newOrderStatus = statusMapping.orderStatus || order.orderStatus;

    const lastStatus = order.statusHistory?.[order.statusHistory.length - 1]?.status;
    if (lastStatus === newStatus) {
      console.log(`Status already updated: ${newStatus}`);
      return res.json({
        success: true,
        message: 'Webhook received (status already updated)',
        webhookProcessed: false
      });
    }

    const updatePayload = {
      shippingStatus: newStatus,
      orderStatus: newOrderStatus,
      courierName: courier_name || order.courierName,
      $push: {
        statusHistory: {
          status: newStatus,
          note: current_status ? `${current_status} via ${courier_name || 'courier'}` : newStatus,
          timestamp: new Date(),
          source: 'shiprocket'
        },
        shippingLog: {
          status: newStatus,
          timestamp: new Date(),
          awbCode: awb || order.awbCode,
          courierName: courier_name || order.courierName,
          shipmentId: shipment_id || order.shiprocketShipmentId,
          message: current_status || shipment_status,
          raw: req.body
        }
      }
    };

    if (newStatus === 'IN_TRANSIT' || newStatus === 'PICKED_UP') {
      updatePayload.shippedAt = new Date();
    }
    if (newOrderStatus === 'DELIVERED') {
      updatePayload.deliveredAt = new Date();
    }
    if (newOrderStatus === 'CANCELLED') {
      updatePayload.cancelledAt = new Date();
    }

    await Order.findByIdAndUpdate(order._id, updatePayload, { new: true });

    await appendOrderLog(order.orderId, 'SHIPPING_STATUS_UPDATED', {
      previousStatus: lastStatus,
      newStatus,
      orderStatus: newOrderStatus,
      awb,
      shipment_id,
      courier_name
    }, 'shiprocket');

    console.log(`Order updated: ${order.orderId}`);
    console.log(`   Status: ${lastStatus} -> ${newStatus}`);
    console.log(`   Order Status: ${order.orderStatus} -> ${newOrderStatus}`);

    res.json({
      success: true,
      message: 'Webhook processed successfully',
      webhookProcessed: true,
      orderId: order.orderId,
      previousStatus: lastStatus,
      newStatus,
      orderStatus: newOrderStatus
    });

  } catch (error) {
    console.error('Webhook processing error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error.message
    });
  }
};

/**
 * Webhook test endpoint.
 * Simulate webhook event for testing.
 */
exports.testWebhook = async (req, res) => {
  try {
    const { orderId, shipment_status, current_status } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await exports.handleWebhook(
      {
        body: {
          awb: order.awbCode,
          shipment_status: shipment_status || 7,
          current_status: current_status || 'Test Status',
          courier_name: order.courierName,
          shipment_id: order.shiprocketShipmentId
        }
      },
      res
    );

  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Test webhook failed'
    });
  }
};

/**
 * Get order tracking status.
 * Returns current shipping status and history.
 */
exports.getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'orderId is required'
      });
    }

    const order = await Order.findOne({ orderId }).select(
      'orderId shippingStatus orderStatus awbCode courierName trackingUrl statusHistory'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order: {
        orderId: order.orderId,
        shippingStatus: order.shippingStatus,
        orderStatus: order.orderStatus,
        awbCode: order.awbCode,
        courierName: order.courierName,
        trackingUrl: order.trackingUrl,
        statusHistory: (order.statusHistory || []).map(entry => ({
          status: entry.status,
          timestamp: entry.timestamp,
          note: entry.note
        }))
      }
    });

  } catch (error) {
    console.error('Get tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tracking information'
    });
  }
};

/**
 * Manual status update.
 * Useful for correcting status or manual reconciliation.
 */
exports.manualStatusUpdate = async (req, res) => {
  try {
    const { orderId, shippingStatus, orderStatus, note } = req.body;

    if (!orderId || !shippingStatus) {
      return res.status(400).json({
        success: false,
        message: 'orderId and shippingStatus are required'
      });
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
      {
        shippingStatus,
        ...(orderStatus && { orderStatus }),
        $push: {
          statusHistory: {
            status: shippingStatus,
            note: note || 'Manual status update',
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log(`Manual status update: ${orderId} -> ${shippingStatus}`);

    res.json({
      success: true,
      message: 'Status updated successfully',
      orderId: order.orderId,
      shippingStatus: order.shippingStatus,
      orderStatus: order.orderStatus
    });

  } catch (error) {
    console.error('Manual status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
};
