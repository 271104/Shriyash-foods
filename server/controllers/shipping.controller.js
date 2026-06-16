const shippingService = require('../services/shipping.service');
const Order = require('../models/Order');

/**
 * Shiprocket Shipping Controller
 * Handles HTTP requests and responses for shipping operations
 * All business logic delegated to shippingService
 */

exports.authenticate = async (req, res) => {
  try {
    const result = await shippingService.authenticate();
    
    res.json({
      success: true,
      token: result.token,
      expiresIn: result.expiresIn
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Authentication failed'
    });
  }
};

/**
 * Check serviceability for delivery
 * Query params: pickup_postcode, delivery_postcode, weight, cod
 */
exports.checkServiceability = async (req, res) => {
  try {
    const { pickup_postcode, delivery_postcode, weight, cod } = req.query;

    // Validation
    if (!delivery_postcode) {
      return res.status(400).json({
        success: false,
        message: 'delivery_postcode is required'
      });
    }

    if (!pickup_postcode) {
      return res.status(400).json({
        success: false,
        message: 'pickup_postcode is required'
      });
    }

    const pickupPostcode = pickup_postcode || '413005'; // Default warehouse postcode
    const result = await shippingService.checkServiceability(
      pickupPostcode,
      delivery_postcode,
      parseFloat(weight) || 0.5,
      parseInt(cod) || 1
    );

    res.json(result);
  } catch (error) {
    console.error('Serviceability check error:', error);
    res.status(502).json({
      success: false,
      serviceable: false,
      message: 'Unable to calculate Shiprocket shipping charges. Please try again.'
    });
  }
};

/**
 * Create shipment order in Shiprocket
 * Body: orderId, customer, shippingAddress, items, paymentMethod, pricing, dimensions
 */
exports.createShipment = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Validation
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'orderId is required'
      });
    }

    // Fetch order from MongoDB
    const order = await Order.findOne({ orderId }).populate('items.product');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create shipment
    const result = await shippingService.createShipment(order.toObject());

    res.json(result);
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create shipment'
    });
  }
};

/**
 * Assign AWB to shipment
 * Body: shipmentId
 */
exports.assignAWB = async (req, res) => {
  try {
    const { shipmentId } = req.body;

    // Validation
    if (!shipmentId) {
      return res.status(400).json({
        success: false,
        message: 'shipmentId is required'
      });
    }

    // Assign AWB
    const result = await shippingService.assignAWB(shipmentId);

    // Update MongoDB order with AWB and courier info
    const order = await Order.findOneAndUpdate(
      { shiprocketShipmentId: shipmentId },
      {
        awbCode: result.awbCode,
        courierName: result.courierName,
        trackingUrl: result.trackingUrl,
        shippingStatus: 'AWB_ASSIGNED',
        $push: {
          statusHistory: {
            status: 'AWB_ASSIGNED',
            note: `AWB assigned: ${result.awbCode} by ${result.courierName}`
          }
        }
      },
      { new: true }
    );

    res.json(result);
  } catch (error) {
    console.error('Assign AWB error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to assign AWB'
    });
  }
};

/**
 * Generate pickup request
 * Body: shipmentId
 */
exports.generatePickup = async (req, res) => {
  try {
    const { shipmentId } = req.body;

    // Validation
    if (!shipmentId) {
      return res.status(400).json({
        success: false,
        message: 'shipmentId is required'
      });
    }

    // Generate pickup
    const result = await shippingService.generatePickup(shipmentId);

    // Update MongoDB order
    await Order.findOneAndUpdate(
      { shiprocketShipmentId: shipmentId },
      {
        pickupReference: result.pickupReference,
        shippingStatus: 'PICKUP_GENERATED',
        $push: {
          statusHistory: {
            status: 'PICKUP_GENERATED',
            note: `Pickup scheduled for: ${result.pickupScheduledDate}`
          }
        }
      }
    );

    res.json(result);
  } catch (error) {
    console.error('Generate pickup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate pickup'
    });
  }
};

/**
 * Track shipment by AWB code
 * Params: awb (AWB number)
 */
exports.trackShipment = async (req, res) => {
  try {
    const { awb } = req.params;

    // Validation
    if (!awb) {
      return res.status(400).json({
        success: false,
        message: 'AWB code is required'
      });
    }

    // Track shipment
    const result = await shippingService.trackShipment(awb);

    res.json({
      success: true,
      tracking: result
    });
  } catch (error) {
    console.error('Track shipment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to track shipment'
    });
  }
};

/**
 * Generate shipping label PDF
 * Body: shipmentId
 */
exports.generateLabel = async (req, res) => {
  try {
    const { shipmentId } = req.body;

    // Validation
    if (!shipmentId) {
      return res.status(400).json({
        success: false,
        message: 'shipmentId is required'
      });
    }

    // Generate label
    const result = await shippingService.generateLabel(shipmentId);

    // Update MongoDB order
    await Order.findOneAndUpdate(
      { shiprocketShipmentId: shipmentId },
      { labelUrl: result.labelUrl }
    );

    res.json(result);
  } catch (error) {
    console.error('Generate label error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate label'
    });
  }
};

/**
 * Generate invoice PDF
 * Body: shiprocketOrderId
 */
exports.generateInvoice = async (req, res) => {
  try {
    const { shiprocketOrderId } = req.body;

    // Validation
    if (!shiprocketOrderId) {
      return res.status(400).json({
        success: false,
        message: 'shiprocketOrderId is required'
      });
    }

    // Generate invoice
    const result = await shippingService.generateInvoice(shiprocketOrderId);

    // Update MongoDB order
    await Order.findOneAndUpdate(
      { shiprocketOrderId },
      { invoiceUrl: result.invoiceUrl }
    );

    res.json(result);
  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate invoice'
    });
  }
};

/**
 * Cancel order/shipment
 * Body: shiprocketOrderId
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { shiprocketOrderId } = req.body;

    // Validation
    if (!shiprocketOrderId) {
      return res.status(400).json({
        success: false,
        message: 'shiprocketOrderId is required'
      });
    }

    // Cancel order
    const result = await shippingService.cancelOrder(shiprocketOrderId);

    // Update MongoDB order
    await Order.findOneAndUpdate(
      { shiprocketOrderId },
      {
        orderStatus: 'CANCELLED',
        shippingStatus: 'CANCELLED',
        $push: {
          statusHistory: {
            status: 'CANCELLED',
            note: 'Order cancelled via Shiprocket'
          }
        }
      }
    );

    res.json(result);
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel order'
    });
  }
};

/**
 * Get Shiprocket token info (debugging)
 */
exports.getTokenInfo = async (req, res) => {
  try {
    const tokenInfo = shippingService.getTokenInfo();
    
    res.json({
      success: true,
      tokenInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get token info'
    });
  }
};
