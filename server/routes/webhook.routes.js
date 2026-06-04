const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const webhookController = require('../controllers/webhook.controller');

/**

* Verify Shiprocket webhook requests
  */
  const verifyShiprocketApiKey = (req, res, next) => {
  const expectedApiKey = process.env.SHIPROCKET_WEBHOOK_SECRET;
  const receivedApiKey = req.get('x-api-key');

if (!expectedApiKey) {
console.error('SHIPROCKET_WEBHOOK_SECRET is not configured');

```
return res.status(500).json({
  success: false,
  message: 'Webhook authentication is not configured'
});
```

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

* Handle validation errors
  */
  const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

if (!errors.isEmpty()) {
return res.status(400).json({
success: false,
message: 'Validation failed',
errors: errors.array()
});
}

next();
};

/**

* Shiprocket Webhook Handler Stack
  */
  const shiprocketWebhookHandlers = [
  verifyShiprocketApiKey,
  webhookController.handleWebhook
  ];

/**

* ======================================================
* SHIPROCKET WEBHOOKS
* ======================================================
  */

/**

* POST /api/webhooks/order-status
*
* Recommended webhook URL for Shiprocket dashboard
  */
  router.post('/order-status', shiprocketWebhookHandlers);

/**

* Legacy endpoint
  */
  router.post('/shiprocket', shiprocketWebhookHandlers);

/**

* ======================================================
* TRACKING
* ======================================================
  */

/**

* GET /api/webhooks/tracking/:orderId
*
* Get tracking data from MongoDB
  */
  router.get(
  '/tracking/:orderId',
  param('orderId')
  .trim()
  .notEmpty()
  .withMessage('orderId is required'),
  handleValidationErrors,
  webhookController.getOrderTracking
  );

/**

* ======================================================
* TESTING
* ======================================================
  */

/**

* POST /api/webhooks/test
*
* Simulate Shiprocket webhook locally
  */
  router.post(
  '/test',
  body('orderId')
  .trim()
  .notEmpty()
  .withMessage('orderId is required'),

body('shipment_status')
.optional()
.isInt()
.withMessage('shipment_status must be numeric'),

body('current_status')
.optional()
.trim(),

handleValidationErrors,
webhookController.testWebhook
);

/**

* ======================================================
* ADMIN
* ======================================================
  */

/**

* POST /api/webhooks/manual-update
*
* Manual order status update
  */
  router.post(
  '/manual-update',

body('orderId')
.trim()
.notEmpty()
.withMessage('orderId is required'),

body('shippingStatus')
.trim()
.notEmpty()
.withMessage('shippingStatus is required'),

body('orderStatus')
.optional()
.trim(),

body('note')
.optional()
.trim(),

handleValidationErrors,
webhookController.manualStatusUpdate
);

/**

* ======================================================
* HEALTH CHECK
* ======================================================
  */

/**

* GET /api/webhooks/health
  */
  router.get('/health', (req, res) => {
  res.json({
  success: true,
  service: 'Shiprocket Webhooks',
  status: 'Running'
  });
  });

module.exports = router;
