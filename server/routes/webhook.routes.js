const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const webhookController = require('../controllers/webhook.controller');

/**
 * Verify Shiprocket webhook requests.
 * Configure the same value in Shiprocket's x-api-key header and .env.
 */
const verifyShiprocketApiKey = (req, res, next) => {
  const expectedApiKey = process.env.SHIPROCKET_WEBHOOK_SECRET;
  const receivedApiKey = req.get('x-api-key');

  if (!expectedApiKey) {
    console.error('SHIPROCKET_WEBHOOK_SECRET is not configured');
    return res.status(500).json({
      success: false,
      message: 'Webhook authentication is not configured'
    });
  }

  if (!receivedApiKey || receivedApiKey !== expectedApiKey) {
    return res.status(401).json({
      success: false,
      message: 'Invalid webhook API key'
    });
  }

  next();
};

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

const shiprocketWebhookHandlers = [
  verifyShiprocketApiKey,
  webhookController.handleWebhook
];

/**
 * POST /api/webhooks/order-status
 * Receive shipment status webhook events from Shiprocket.
 *
 * Payload format:
 * {
 *   "awb": "14112366035400",
 *   "shipment_status": 7,
 *   "current_status": "Delivered",
 *   "courier_name": "Xpressbees Surface",
 *   "shipment_id": 1360828812
 * }
 */
router.post('/order-status', shiprocketWebhookHandlers);

/**
 * Legacy endpoint. Shiprocket may reject this URL because it contains the
 * word "shiprocket", so use /api/webhooks/order-status in their dashboard.
 */
router.post('/shiprocket', shiprocketWebhookHandlers);

/**
 * GET /api/tracking/:orderId
 * Get order tracking information
 */
router.get(
  '/tracking/:orderId',
  param('orderId').trim().notEmpty().withMessage('orderId is required'),
  handleValidationErrors,
  webhookController.getOrderTracking
);

/**
 * POST /api/webhooks/test
 * Test webhook (for development/testing)
 */
router.post(
  '/test',
  body('orderId').trim().notEmpty().withMessage('orderId is required'),
  body('shipment_status').optional().isInt().withMessage('shipment_status must be a number'),
  body('current_status').optional().trim(),
  handleValidationErrors,
  webhookController.testWebhook
);

/**
 * POST /api/webhooks/manual-update
 * Manual status update (admin endpoint - add auth in production)
 */
router.post(
  '/manual-update',
  body('orderId').trim().notEmpty().withMessage('orderId is required'),
  body('shippingStatus').trim().notEmpty().withMessage('shippingStatus is required'),
  body('orderStatus').optional().trim(),
  body('note').optional().trim(),
  handleValidationErrors,
  webhookController.manualStatusUpdate
);

module.exports = router;
