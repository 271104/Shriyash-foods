# Shiprocket Integration Debugging Guide

## Problem Statement
Razorpay payments are successful but orders are not appearing in Shiprocket dashboard.

## Quick Diagnosis Steps

### Step 1: Verify Shiprocket Credentials
Check `.env` file in root directory:
```env
SHIPROCKET_EMAIL=your_email@shiprocket.com
SHIPROCKET_PASSWORD=your_password
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1/external
SHIPROCKET_WEBHOOK_SECRET=your_webhook_secret
```

⚠️ **IMPORTANT**: Verify these values match your Shiprocket account.

### Step 2: Test Token Authentication
1. Start your server: `npm run start` (in root folder)
2. Open Postman and create new request:
   ```
   POST http://localhost:5000/api/shipping/auth
   ```
3. Expected response (success):
   ```json
   {
     "success": true,
     "token": "eyJhbGc...",
     "expiresIn": "10 days"
   }
   ```
4. If error, check:
   - SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in .env are correct
   - Shiprocket account is active and not suspended
   - No typos in credentials

### Step 3: Check Recent Server Logs
1. Look at server console when payment is completed
2. Search for these exact log messages:
   - `📦 Creating Shiprocket shipment for order:` ← Should appear immediately after payment
   - `✅ Shiprocket shipment created successfully:` ← Should appear if successful
   - `❌ Error creating Shiprocket shipment:` ← If error
   - `⚠️ Shiprocket shipment creation failed:` ← If API returns error

3. Copy the ENTIRE log output and analyze

### Step 4: Check MongoDB Order Record
After completing payment through UI:

1. Connect to MongoDB:
   - Use MongoDB Compass or Atlas UI
   - Find the order you just created

2. Check these fields in the Order document:
   ```json
   {
     "_id": "...",
     "orderId": "ORD-123...",
     "paymentStatus": "PAID",
     "orderStatus": "CONFIRMED",
     "shiprocketOrderId": "should_be_populated",
     "shiprocketShipmentId": "should_be_populated",
     "statusHistory": [
       {
         "status": "CONFIRMED",
         "note": "Payment successful"
       },
       {
         "status": "SHIPMENT_CREATED",
         "note": "Shiprocket shipment created: ..."
       }
     ]
   }
   ```

3. **If shiprocketOrderId is NULL/missing**:
   - Shipment creation failed
   - Check server logs for error message
   - Likely causes:
     - Invalid credentials
     - Order payload has missing fields
     - Shiprocket API returned error

---

## Common Issues & Solutions

### Issue 1: "Failed to get Shiprocket token"
**Cause**: Credentials are incorrect
**Solution**:
1. Go to Shiprocket Dashboard → Settings → API
2. Copy your EMAIL and PASSWORD exactly as shown
3. Update `.env` file
4. Restart server
5. Test `/api/shipping/auth` again

### Issue 2: "Rate limit exceeded"
**Cause**: Too many API requests
**Solution**:
1. Wait 1 minute before trying again
2. Check if other processes are hitting Shiprocket API
3. Consider implementing request queuing

### Issue 3: "Invalid order format"
**Cause**: Order payload missing required fields
**Solution**:
Check that order has all these fields before shipment creation:
```javascript
{
  orderId: "ORD-123",
  customer: {
    name: "Full Name",
    phone: "+91XXXXXXXXXX",
    email: "email@example.com"
  },
  shippingAddress: {
    addressLine1: "Full Address",
    addressLine2: "Optional",
    city: "City Name",
    state: "State Name",
    pincode: "123456",
    country: "India"
  },
  items: [
    {
      name: "Product Name",
      sku: "SKU-123",
      quantity: 1,
      price: 999,
      product: ObjectId
    }
  ],
  pricing: {
    subtotal: 999,
    total: 999,
    shipping: 0
  },
  paymentMethod: "PREPAID" or "COD",
  weight: 0.5
}
```

### Issue 4: Shiprocket Webhook Not Receiving Updates
**Cause**: Webhook URL not configured in Shiprocket Dashboard
**Solution**:
1. Log into Shiprocket Dashboard
2. Go to Settings → Webhooks/Integrations
3. Add webhook URL:
   - URL: `https://yourdomain.com/api/webhooks/order-status`
   - Method: POST
   - x-api-key header: Set same value as `SHIPROCKET_WEBHOOK_SECRET` in `.env`
4. Test webhook configuration in Shiprocket dashboard

---

## Advanced Debugging

### Enable Detailed Logging
Modify `server/routes/paymentRoutes.js` line ~164 to add more logging:

```javascript
// 🚀 Create Shiprocket shipment order
try {
  console.log('📦 Creating Shiprocket shipment for order:', orderId);
  console.log('📝 Order data being sent:', {
    orderId: order.orderId,
    customer: order.customer,
    items_count: order.items.length,
    total: order.pricing.total,
    paymentMethod: order.paymentMethod,
    shippingAddress: order.shippingAddress
  });
  
  const shiprocketResult = await shippingService.createShipment(order.toObject());
  
  if (shiprocketResult.success) {
    console.log('✅ Shiprocket shipment created successfully:', {
      orderId,
      shiprocketOrderId: shiprocketResult.shiprocketOrderId,
      shipmentId: shiprocketResult.shipmentId
    });
    // ... rest of code
  } else {
    console.warn('⚠️ Shiprocket shipment creation failed:', shiprocketResult);
  }
} catch (shiprocketError) {
  console.error('❌ Shiprocket error details:', {
    message: shiprocketError.message,
    response: shiprocketError.response?.data,
    error: shiprocketError
  });
}
```

### Test Order Creation Directly
Use Postman to manually create order:

```
POST /api/shipping/create-order

Body (JSON):
{
  "orderId": "ORD-TEST-123"
}
```

This will look up the order in MongoDB and try to create Shiprocket shipment directly.

### Check Shiprocket API Documentation
1. Go to Shiprocket API Docs: https://apiv2.shiprocket.in/v1/doc/
2. Check `/orders/create/v2` endpoint
3. Verify all required fields in payload
4. Check response format expectations

---

## Verification Checklist Before Production

- [ ] `.env` contains correct SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD
- [ ] `/api/shipping/auth` returns valid token
- [ ] Test order through Postman shows successful creation in Shiprocket
- [ ] MongoDB order document has shiprocketOrderId populated after payment
- [ ] Server logs show "✅ Shiprocket shipment created successfully" for test order
- [ ] Shiprocket Dashboard shows new order in Orders list
- [ ] Webhook URL configured in Shiprocket Settings
- [ ] x-api-key header matches SHIPROCKET_WEBHOOK_SECRET in .env
- [ ] Test webhook sends successfully (use Shiprocket "Send Test" button)
- [ ] Order status updates appear in MongoDB via webhook
- [ ] WhatsApp notifications sent when status changes

---

## Production Deployment Checklist

Before pushing to production (Vercel):

1. ✅ All environment variables set in Vercel/Render dashboard:
   ```
   SHIPROCKET_EMAIL
   SHIPROCKET_PASSWORD
   SHIPROCKET_BASE_URL
   SHIPROCKET_WEBHOOK_SECRET
   MONGO_URI
   RAZORPAY_KEY_ID
   RAZORPAY_KEY_SECRET
   ```

2. ✅ Test complete order flow in production:
   - Browse products
   - Add to cart
   - Checkout
   - Complete payment via Razorpay
   - Wait 30 seconds
   - Check Shiprocket dashboard - order should appear

3. ✅ Monitor first production order:
   - Watch server logs for errors
   - Check MongoDB for order record
   - Check Shiprocket for shipment creation
   - Verify webhook fires within 1 minute
   - Verify WhatsApp notification sent

4. ✅ Have rollback plan ready:
   - Keep previous version available
   - Document exact rollback steps
   - Test rollback in staging first

---

## Quick Reference: Key Endpoints

| Endpoint | Method | Purpose | Expected Response |
|----------|--------|---------|-------------------|
| `/api/shipping/auth` | POST | Get Shiprocket token | `{success: true, token: "..."}` |
| `/api/payment/verify` | POST | Verify payment & create shipment | `{success: true, order: {...}}` |
| `/api/shipping/track/:awb` | GET | Track shipment | `{success: true, tracking: {...}}` |
| `/api/webhooks/order-status` | POST | Receive status updates | `{success: true}` |

---

## Getting Help

If problem persists after these steps:

1. **Collect these logs and error messages**:
   - Full server log output when payment is completed
   - MongoDB order document (as JSON)
   - Response from `/api/shipping/auth` call
   - Error message from Shiprocket API (if visible)

2. **Check Shiprocket Status**:
   - Is Shiprocket API up? (Check https://status.shiprocket.in/)
   - Is your Shiprocket account active?
   - Are there any IP whitelist restrictions?

3. **Contact Shiprocket Support** with:
   - Timestamp of failed order
   - Order ID
   - Shiprocket auth credentials (masked for security)
   - API response logs
