# 🚀 Shriyash Foods - Complete Implementation Guide
## Order Tracking + WhatsApp Notifications + Guest Account Linking

**Status:** Project ~70% Complete | Remaining Work: 20-30 hours
**Updated:** May 28, 2026

---

## 📋 WHAT'S EXISTING vs WHAT'S MISSING

### ✅ EXISTING (Working)
| Feature | Status | Files |
|---------|--------|-------|
| **OTP Authentication** | ✅ Complete | `authRoutes.js`, `otpService.js` |
| **Guest Checkout** | ✅ Complete | `Checkout.js`, `CheckoutAuthModal.js` |
| **Razorpay Payment** | ✅ Complete | `paymentRoutes.js` |
| **Shiprocket Integration** | ✅ 90% | `shipping.service.js`, `shipping.routes.js` |
| **Webhook Handlers** | ✅ Partial | `webhook.controller.js` |
| **Order Model** | ✅ Well-designed | `Order.js` (has all fields needed) |

### ❌ MISSING - PRIORITY 1 (Do First!)
| Feature | Impact | Effort | Files |
|---------|--------|--------|-------|
| **Guest Order Tracking** | HIGH | 4-6h | Create `guestTrackingRoutes.js`, `GuestTrackOrder.js` page |
| **WhatsApp Order Notifications** | HIGH | 5-7h | Create `whatsapp.service.js`, enhance webhooks |
| **Account Linking (Guest→User)** | HIGH | 6-8h | Modify `authRoutes.js`, `Order.js`, new logic |
| **Tracking Timeline (Real History)** | MEDIUM | 3-4h | Enhance `OrderTracking.js` component |
| **Download Invoice/Label UI** | MEDIUM | 2-3h | Add buttons to `OrderSuccess.js`, `OrderTracking.js` |

### ⚠️ MISSING - PRIORITY 2 (After Priority 1)
- Real-time tracking (WebSocket/SSE)
- Dedicated login/register pages
- Webhook idempotency fixes
- Message queue system
- Admin dashboard

---

## 🎯 IMPLEMENTATION ROADMAP

### Phase 1: Guest Order Tracking (4-6 hours)
**What:** Guests can retrieve their orders without login
**Impact:** Solves "Guest can't track after checkout"
**Tasks:**
1. Create `POST /api/orders/track-guest` route
2. Create `GET /guest-track` frontend page
3. OTP verification for guest order lookup
4. Security: Phone + Order ID validation

### Phase 2: WhatsApp Notifications (5-7 hours)
**What:** Automatic WhatsApp messages at key order milestones
**Impact:** Customers get real-time updates
**Tasks:**
1. Create `whatsapp.service.js` for order notifications
2. Trigger on payment success
3. Trigger on each Shiprocket webhook status
4. Track notification delivery
5. Add retry logic for failed sends

### Phase 3: Guest Account Linking (6-8 hours)
**What:** Guests can convert to full accounts, linking all history
**Impact:** Better customer retention + repeat orders
**Tasks:**
1. Add fields to User model
2. Create `POST /api/auth/guest-to-account` endpoint
3. Link existing guest orders automatically
4. Frontend flow: "Create Account" prompt on OrderSuccess
5. Merge cart logic

### Phase 4: Polish & Testing (3-4 hours)
**What:** UI enhancements, error handling, security
**Impact:** Production-ready quality
**Tasks:**
1. Fix tracking timeline display (show actual history)
2. Add invoice/label download UI
3. Add real-time updates (optional: WebSocket)
4. Comprehensive testing

---

## 🏗️ ARCHITECTURE OVERVIEW

```
Frontend Structure:
├── pages/
│   ├── GuestTrackOrder.js          (NEW - Guest tracking)
│   ├── OrderSuccess.js             (ENHANCE - "Create Account" button)
│   └── OrderTracking.js            (ENHANCE - Show real history + downloads)
├── components/
│   ├── TrackingTimeline.js         (NEW - Dynamic status history)
│   └── OrderDownloads.js           (NEW - Invoice/Label buttons)
└── hooks/
    └── useOrderTracking.js         (NEW - Fetch + poll tracking data)

Backend Structure:
├── routes/
│   ├── guestTrackingRoutes.js      (NEW - Guest tracking endpoints)
│   ├── authRoutes.js               (ENHANCE - Guest to account conversion)
│   └── orderRoutes.js              (ENHANCE - Add tracking endpoints)
├── controllers/
│   ├── guestTracking.controller.js (NEW - Guest tracking logic)
│   ├── auth.controller.js          (ENHANCE - Account linking)
│   └── webhook.controller.js       (ENHANCE - Add notifications)
├── services/
│   ├── whatsapp.service.js         (NEW - Notification service)
│   ├── shipping.service.js         (ENHANCE - Add tracking)
│   └── otpService.js               (ENHANCE - Guest linking OTP)
└── models/
    ├── Order.js                    (ENHANCE - Add fields for linking)
    └── User.js                     (ENHANCE - Add guest linking fields)

Database:
├── orders collection               (Add: linkedFromGuest, linkedAt fields)
├── users collection                (Add: linkedGuestOrders, guestSessionId)
└── whatsapp_notifications         (NEW - Track notification delivery)
```

---

## 📊 DATABASE SCHEMA ADDITIONS

### Order Model - Add These Fields
```javascript
// Linking field - when guest converts to account
linkedFromGuest: {
  type: Boolean,
  default: false
},
linkedAt: Date,
guestSessionId: String,  // Track which guest session

// Additional tracking
estimatedDeliveryDate: Date,
isNotificationSent: {
  orderConfirmation: Boolean,
  shipmentCreated: Boolean,
  pickupScheduled: Boolean,
  outForDelivery: Boolean,
  delivered: Boolean
}
```

### User Model - Add These Fields
```javascript
// For linking guest orders
linkedGuestOrders: [{
  orderId: String,
  linkedAt: Date,
  phone: String  // Guest phone number used
}],

// Guest session tracking
previousGuestSessions: [{
  guestSessionId: String,
  phone: String,
  startedAt: Date,
  convertedAt: Date
}],

// Account creation source
accountCreatedFrom: {
  type: String,
  enum: ['direct_registration', 'guest_conversion', 'admin_creation'],
  default: 'direct_registration'
}
```

### New Collection: WhatsApp Notifications
```javascript
{
  _id: ObjectId,
  orderId: String,
  phone: String,
  messageType: String,  // 'order_confirmation', 'shipment_created', etc
  messageContent: String,
  status: String,       // 'pending', 'sent', 'failed', 'retry'
  attempts: Number,
  lastAttempt: Date,
  nextRetry: Date,
  response: Object,     // WhatsApp API response
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔑 API ENDPOINTS TO CREATE

### Guest Order Tracking
```
POST /api/orders/track-guest
- Body: { phone, orderId, otp (optional) }
- Returns: Full order details with tracking
- Security: Verify phone matches guest order

GET /api/orders/guest/:orderId/verify
- Body: { phone, otp }
- Returns: { isValid, order }

POST /api/orders/guest/send-otp
- Body: { phone, orderId }
- Returns: { success }
```

### Guest to Account Conversion
```
POST /api/auth/guest-to-account
- Body: { phone, name, email, otp }
- Returns: { user, token, linkedOrders }
- Logic: Link all guest orders to new account
```

### Enhanced Tracking
```
GET /api/orders/:id/full-tracking
- Returns: Order + full statusHistory + Shiprocket tracking

GET /api/orders/:id/invoices-labels
- Returns: { invoiceUrl, labelUrl, awbCode }

POST /api/orders/:id/resend-notification
- Type: { type: 'whatsapp' }
```

### Admin/Debug Endpoints
```
POST /api/webhooks/test-whatsapp
- Body: { phone, messageType, orderId }
- Use for testing notification service

GET /api/webhooks/notifications/:orderId
- Returns: All notifications sent for order
```

---

## 📝 FILES TO CREATE (Complete List)

### 1. BACKEND
#### New Files
- `server/services/whatsapp.service.js` (250 lines)
- `server/controllers/guestTracking.controller.js` (150 lines)
- `server/routes/guestTrackingRoutes.js` (100 lines)
- `server/models/WhatsAppNotification.js` (80 lines)

#### Modify
- `server/routes/authRoutes.js` - Add guest-to-account endpoint
- `server/controllers/auth.controller.js` - Add account linking logic
- `server/controllers/webhook.controller.js` - Add WhatsApp trigger
- `server/models/Order.js` - Add linking fields
- `server/models/User.js` - Add linking fields
- `server/routes/orderRoutes.js` - Add new tracking endpoints

### 2. FRONTEND
#### New Files
- `client/src/pages/GuestTrackOrder.js` (200 lines)
- `client/src/components/TrackingTimeline.js` (150 lines)
- `client/src/components/OrderDownloads.js` (100 lines)
- `client/src/hooks/useOrderTracking.js` (80 lines)

#### Modify
- `client/src/pages/OrderSuccess.js` - Add account creation prompt
- `client/src/pages/OrderTracking.js` - Show real status history
- `client/src/App.js` - Add `/guest-track` route

---

## 🔐 SECURITY CHECKLIST

✅ **Guest Order Lookup:**
- [ ] Require BOTH phone + orderId (not just orderId)
- [ ] Optional OTP verification for sensitive access
- [ ] Rate limit: 5 requests per minute per phone
- [ ] Log all guest tracking requests
- [ ] Don't expose user data for guest orders

✅ **Account Linking:**
- [ ] Verify OTP before linking
- [ ] Only link orders with matching phone
- [ ] Don't link orders > 90 days old (optional security)
- [ ] Prevent account takeover via OTP brute force
- [ ] Add rate limiting to convert endpoint

✅ **WhatsApp Notifications:**
- [ ] Validate phone numbers before sending
- [ ] Rate limit: 1 message per order per status
- [ ] Log all message sends
- [ ] Handle webhook verification properly
- [ ] Use environment variables for credentials

---

## 📱 WHATSAPP MESSAGES TO SEND

### 1. Order Confirmation (After Payment Success)
```
🎉 Your order has been confirmed!

Order ID: SHR177994037215
Amount: ₹549
Payment Status: Paid

📍 Track your order:
https://shriyashfoods.com/guest-track

Expected Delivery: 3-5 days

Thank you for shopping with Shriyash Foods ❤️
```

### 2. Shipment Created
```
🚚 Your order is on the way!

Courier: Xpressbees Surface
Tracking No: 14112366035400

📍 Live tracking:
https://shriyashfoods.com/guest-track

Expected Delivery: Tomorrow by 6 PM
```

### 3. Out For Delivery
```
📦 Your order is out for delivery today!

Delivery Agent: Raj Kumar
Contact: +91-XXXXX-XXXXX

Keep your phone available.

📍 Track here:
https://shriyashfoods.com/guest-track
```

### 4. Delivered
```
✅ Your order has been delivered!

Thank you for choosing Shriyash Foods ❤️

Rate your experience:
https://shriyashfoods.com/reviews/SHR177994037215

🎁 Get 10% off on your next order!
```

---

## 🧪 TESTING CHECKLIST

### Frontend Testing
- [ ] Guest can enter phone + orderId to track
- [ ] OTP verification works for guest orders
- [ ] Full order details display correctly
- [ ] Timeline shows actual status history
- [ ] Download invoice/label buttons work
- [ ] "Create Account" prompt appears
- [ ] Mobile responsive

### Backend Testing
- [ ] Guest tracking API returns correct order
- [ ] Phone verification works
- [ ] Guest to account conversion links orders
- [ ] WhatsApp messages send on order confirmation
- [ ] WhatsApp messages send on each webhook
- [ ] Duplicate messages prevented
- [ ] Failed messages retried
- [ ] Webhook signature validation works

### Integration Testing
- [ ] End-to-end guest checkout + tracking
- [ ] End-to-end guest → account conversion
- [ ] WhatsApp integration with real API
- [ ] Shiprocket webhook triggers notifications
- [ ] Razorpay payment → WhatsApp flow
- [ ] COD order → WhatsApp flow

### Security Testing
- [ ] Can't access other guests' orders
- [ ] Can't brute force OTP
- [ ] Rate limiting works
- [ ] Phone number validation works
- [ ] No sensitive data leakage

---

## 📊 CURRENT STATUS SUMMARY

### By Module:
| Module | Status | Progress | Priority |
|--------|--------|----------|----------|
| Authentication | ✅ | 95% | - |
| Products | ✅ | 100% | - |
| Cart | ✅ | 90% | Low |
| Checkout (Auth) | ✅ | 95% | - |
| Checkout (Guest) | ✅ | 90% | - |
| Payment (Razorpay) | ✅ | 95% | - |
| Shipping (Shiprocket) | ✅ | 90% | - |
| Order Tracking (Auth) | ⚠️ | 50% | **HIGH** |
| Order Tracking (Guest) | ❌ | 0% | **CRITICAL** |
| Guest→Account Link | ❌ | 0% | **CRITICAL** |
| WhatsApp Notifications | ❌ | 0% | **CRITICAL** |
| Webhooks | ⚠️ | 60% | **HIGH** |
| Invoice/Label Download | ⚠️ | 30% | Medium |

### Timeline Estimate:
```
Phase 1: Guest Tracking      → 4-6 hours  → Start immediately
Phase 2: WhatsApp Notify     → 5-7 hours  → After Phase 1
Phase 3: Account Linking     → 6-8 hours  → After Phase 2
Phase 4: Polish & Testing    → 3-4 hours  → Final phase
─────────────────────────────────────────────────────
Total: 18-25 hours           → 2-3 days intensive work
```

---

## 🚀 NEXT STEPS

1. **Review this document** ← You are here
2. **Create implementation files** (I'll generate these next)
3. **Database migrations** (add fields to existing models)
4. **Test each phase locally**
5. **Deploy to production**

---

**Version:** 1.0 | **Last Updated:** May 28, 2026
