const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const shippingController = require('../controllers/shipping.controller');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * POST /api/shipping/auth
 * Authenticate with Shiprocket and get token
 */
router.post('/auth', shippingController.authenticate);

/**
 * GET /api/shipping/serviceability
 * Check delivery serviceability and get courier options
 * Query params: pickup_postcode, delivery_postcode, weight, cod
 */
router.get(
  '/serviceability',
  query('delivery_postcode').trim().notEmpty().withMessage('delivery_postcode is required'),
  query('pickup_postcode').optional().trim(),
  query('weight').optional().isFloat({ min: 0 }).withMessage('weight must be a positive number'),
  query('cod').optional().isInt({ min: 0, max: 1 }).withMessage('cod must be 0 or 1'),
  handleValidationErrors,
  shippingController.checkServiceability
);

/**
 * POST /api/shipping/create-order
 * Create shipment in Shiprocket from ecommerce order
 */
router.post(
  '/create-order',
  body('orderId').trim().notEmpty().withMessage('orderId is required'),
  handleValidationErrors,
  shippingController.createShipment
);

/**
 * POST /api/shipping/assign-awb
 * Assign AWB and courier to shipment
 */
router.post(
  '/assign-awb',
  body('shipmentId').trim().notEmpty().withMessage('shipmentId is required'),
  handleValidationErrors,
  shippingController.assignAWB
);

/**
 * POST /api/shipping/generate-pickup
 * Generate pickup request for courier
 */
router.post(
  '/generate-pickup',
  body('shipmentId').trim().notEmpty().withMessage('shipmentId is required'),
  handleValidationErrors,
  shippingController.generatePickup
);

/**
 * GET /api/shipping/track/:awb
 * Track shipment by AWB code
 */
router.get(
  '/track/:awb',
  param('awb').trim().notEmpty().withMessage('AWB code is required'),
  handleValidationErrors,
  shippingController.trackShipment
);

/**
 * POST /api/shipping/generate-label
 * Generate shipping label PDF
 */
router.post(
  '/generate-label',
  body('shipmentId').trim().notEmpty().withMessage('shipmentId is required'),
  handleValidationErrors,
  shippingController.generateLabel
);

/**
 * POST /api/shipping/generate-invoice
 * Generate invoice PDF
 */
router.post(
  '/generate-invoice',
  body('shiprocketOrderId').trim().notEmpty().withMessage('shiprocketOrderId is required'),
  handleValidationErrors,
  shippingController.generateInvoice
);

/**
 * POST /api/shipping/cancel-order
 * Cancel order in Shiprocket
 */
router.post(
  '/cancel-order',
  body('shiprocketOrderId').trim().notEmpty().withMessage('shiprocketOrderId is required'),
  handleValidationErrors,
  shippingController.cancelOrder
);

/**
 * GET /api/shipping/token-info
 * Get Shiprocket token information (debugging)
 */
router.get('/token-info', shippingController.getTokenInfo);

module.exports = router;
