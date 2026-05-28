# 🔴 Razorpay Payment Failures - Complete Troubleshooting Guide

## Summary of Issues Found & Fixed

Your transactions are failing due to **multiple issues**:

1. **❌ Missing Error Handlers** - Payment errors weren't being caught or displayed
2. **❌ No Error Logging** - Backend couldn't identify why verification was failing  
3. **❌ Inadequate Signature Verification** - Silent failures on signature mismatch
4. **❌ No Error Communication** - Frontend users didn't know what went wrong

---

## Changes Applied ✅

### Frontend (Checkout.js)
✅ Added `payment.failed` error handler to Razorpay
✅ Added proper error responses with user-friendly messages
✅ Added logging for debugging
✅ Record failed payments for analysis

### Backend (paymentRoutes.js)
✅ Enhanced logging at every step
✅ Better error messages with specific failure reasons
✅ Input validation for all endpoints
✅ Added diagnostic endpoint
✅ Improved failed payment recording

---

## How to Debug Current Issues

### Step 1: Check Payment Configuration
```bash
curl http://localhost:5000/api/payment/diagnostics
```

You should see:
```json
{
  "success": true,
  "diagnostics": {
    "timestamp": "2026-05-28T...",
    "razorpay": {
      "keyIdExists": true,
      "keyIdStart": "rzp_live_***",
      "keySecretExists": true,
      "isLiveKey": true
    },
    "issues": []
  }
}
```

**If you see issues here, that's your problem!** ⚠️

### Step 2: Check Server Logs
When a payment fails, look at your server terminal for detailed logs like:
```
🔐 Payment Verification Attempt: {
  orderId: "ORD-xxx",
  razorpay_payment_id: "pay_xxx",
  signatureMatch: false
}

❌ Invalid payment signature: { expected: "...", received: "...", orderId: "ORD-xxx" }
```

### Step 3: Enable Browser Console Debugging
1. Open your app in Chrome
2. Press **F12** → Console tab
3. Try making a payment
4. Look for detailed error messages like:
   ```
   ❌ Razorpay payment failed: {
     error: {
       code: "BAD_REQUEST_ERROR",
       description: "Invalid order ID format",
       reason: "invalid_order_id"
     }
   }
   ```

---

## Common Failure Reasons & Solutions

### Issue 1: Invalid Signature Error
**Error Message:** `"Invalid payment signature - verification failed"`

**Causes:**
- RAZORPAY_KEY_SECRET is wrong
- Signature algorithm mismatch
- Order ID/Payment ID mismatch

**Solution:**
```bash
# 1. Verify your Razorpay keys in .env
RAZORPAY_KEY_ID=rzp_live_SpYqlyq4F9ZQbZ
RAZORPAY_KEY_SECRET=kEsE26i313HEtwHI64mvFQrU  # Should be exactly from Razorpay dashboard

# 2. Check Razorpay Dashboard:
# - Go to https://dashboard.razorpay.com/
# - Settings → API Keys
# - Copy EXACT key_id and key_secret
# - Paste into .env
```

### Issue 2: Order Not Found
**Error Message:** `"Order not found"`

**Causes:**
- Order wasn't created before payment
- Order ID mismatch between frontend and backend

**Solution:**
```javascript
// Check browser console before payment
console.log('Order ID being used:', data.order.orderId);  // Should be non-empty

// Check MongoDB - order should exist with this orderId
db.orders.findOne({ orderId: "ORD-xxx" })
```

### Issue 3: UPI Payment Failure (From Your Dashboard)
**Observed:** All 3 failed payments used UPI method

**Possible Causes:**
- UPI not enabled on your Razorpay account for test
- Bank/UPI provider rejecting transaction
- Account verification incomplete

**Solution:**
```
1. Open Razorpay Dashboard: https://dashboard.razorpay.com/
2. Settings → Payment Methods
3. Ensure UPI is enabled and verified
4. If using TEST keys, some UPI providers don't work
5. Try with different payment method (Card, Netbanking)
```

### Issue 4: Missing Environment Variables
**Error Message:** `"Missing required payment fields"` or payment order creation fails

**Solution:**
```bash
# In .env, ensure ALL these exist:
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# Restart your server after changing .env
npm start
```

### Issue 5: Razorpay Script Not Loaded
**Error Message:** `"Payment gateway not loaded. Please refresh the page."`

**Solution:**
```html
<!-- Check public/index.html has this line: -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

<!-- If missing, add it before closing </body> tag -->
```

---

## Testing Payment Flow Manually

### For Development (TEST Keys)
```bash
# Generate test keys from: https://dashboard.razorpay.com/app/keys

# Update .env with TEST keys:
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

### Test Payment Card Details
- Card: `4111 1111 1111 1111`
- Expiry: `12/25` (any future date)
- CVV: `123`

---

## Monitoring & Analytics

### Check Failed Payments in Razorpay
1. Go to https://dashboard.razorpay.com/
2. Payments → All
3. Filter by "Failed"
4. Click each payment to see:
   - Error code
   - Error description
   - Why it failed

### Check Your Database
```javascript
// In MongoDB, find failed orders:
db.orders.find({ paymentStatus: "FAILED" }).pretty()

// View payment failure reasons:
db.orders.findOne({ orderId: "ORD-xxx" }).statusHistory
```

---

## Emergency Checklist

✅ Run this to verify everything:
```bash
# 1. Check configuration
curl http://localhost:5000/api/payment/diagnostics

# 2. Verify .env file exists
cat .env | grep RAZORPAY

# 3. Check server logs for errors
npm start

# 4. Test a simple order creation
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{"items":[...],"shippingAddress":{...},"paymentMethod":"PREPAID"}'

# 5. Monitor live logs while testing payment
# Keep server terminal open and watch for payment logs
```

---

## Prevention Going Forward

### 1. Environment Variables
```bash
# Use environment variable management:
# - Never commit .env to Git
# - Add .env to .gitignore
# - Store secrets securely (use environment secrets in production)
```

### 2. Monitoring
```javascript
// All payment operations now log detailed info:
// ✅ Order creation logs: 📝
// ✅ Signature verification logs: 🔐
// ✅ Payment failure logs: ❌
// Monitor these in your server terminal
```

### 3. User Feedback
```
Users now see:
✅ Success: "Order placed! Confirmation sent to email"
❌ Failure: Specific error message explaining what went wrong
⚠️ Cancelled: "Payment cancelled - you can retry anytime"
```

---

## Still Having Issues?

1. **Check server logs** → Look for ❌ or 🔐 messages
2. **Check browser console** → Press F12, see payment errors
3. **Run diagnostics** → `curl /api/payment/diagnostics`
4. **Check Razorpay dashboard** → Verify keys and payment status
5. **Reset and retry** → Clear browser cache, refresh page, try again

---

## Production Deployment Checklist

Before going to production:
- [ ] Switch to LIVE keys (rzp_live_xxxx)
- [ ] Test with real payment card
- [ ] Verify email notifications work
- [ ] Monitor first 24 hours of payments
- [ ] Set up error alerts/logging service
- [ ] Have Razorpay support number ready
- [ ] Update privacy policy with payment info

---

**Last Updated:** May 28, 2026  
**Version:** 2.0 (Enhanced Error Handling)
