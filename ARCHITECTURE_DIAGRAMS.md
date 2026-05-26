# 🏗️ SHIPROCKET INTEGRATION - ARCHITECTURE DIAGRAMS

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                           │
│  - Order confirmation                                           │
│  - Payment submission                                           │
│  - Tracking page                                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS ROUTES LAYER                         │
│  /api/shipping/*        /api/webhooks/*                        │
│  - Input validation     - Webhook receiver                      │
│  - Request handling     - Status updates                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CONTROLLERS LAYER                            │
│  shipping.controller.js  webhook.controller.js                 │
│  - HTTP request validation                                      │
│  - Response formatting                                          │
│  - Error handling                                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICES LAYER                               │
│  shipping.service.js                                            │
│  - Business logic                                               │
│  - Data transformation                                          │
│  - Service methods (9 functions)                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                UTILITIES & CONFIGURATION                        │
│  tokenManager.js (singleton)                                    │
│  - Token lifecycle management                                   │
│  - Auto-refresh on expiry                                       │
│  - Memory caching                                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│             SHIPROCKET CONFIG & AXIOS INSTANCE                  │
│  shiprocket.js                                                  │
│  - Base URL configuration                                       │
│  - Interceptors                                                 │
│  - Endpoint definitions                                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              SHIPROCKET API SERVERS                             │
│  https://apiv2.shiprocket.in/v1/external                       │
│  - Authentication                                               │
│  - Shipment creation                                            │
│  - Courier assignment                                           │
│  - Tracking                                                     │
│  - Webhooks                                                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MONGODB DATABASE                              │
│  Order Collection                                               │
│  - shiprocketOrderId                                            │
│  - shiprocketShipmentId                                         │
│  - awbCode                                                      │
│  - courierName                                                  │
│  - statusHistory (timeline)                                     │
│  - trackingUrl, labelUrl, invoiceUrl                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Request-Response Flow

### 1️⃣ CREATE SHIPMENT FLOW

```
Client          Controller          Service           Token Mgr      Shiprocket
  │                │                  │                 │              │
  ├─ POST ─────────>│                  │                 │              │
  │ /create-order   │                  │                 │              │
  │ {orderId}       │                  │                 │              │
  │                 ├─ Validate ──────>│                 │              │
  │                 │                  │                 │              │
  │                 │ Call service ────>│                 │              │
  │                 │                  ├─ getToken ─────>│              │
  │                 │                  │                 ├─ Login ─────>│
  │                 │                  │                 │<─ token ─────┤
  │                 │                  │<─ token ────────┤              │
  │                 │                  │                 │              │
  │                 │                  ├─ Create ───────────────────────>│
  │                 │                  │ shipment        │              │
  │                 │                  │                 │<─ response ──┤
  │                 │                  │                 │              │
  │                 │                  ├─ Update MongoDB             │
  │                 │<─ response ──────┤                 │              │
  │<─ 200 JSON ─────┤                  │                 │              │
  │ {shipmentId}    │                  │                 │              │
```

### 2️⃣ WEBHOOK UPDATE FLOW

```
Shiprocket         Webhook Route      Controller        MongoDB
    │                  │                  │              │
    ├─ POST ──────────>│                  │              │
    │ /webhooks/       │ Validate         │              │
    │ shiprocket       │ webhook ────────>│              │
    │ {awb, status}    │                  │              │
    │                  │                  ├─ Find order─>│
    │                  │                  │<─ order ─────┤
    │                  │                  │              │
    │                  │                  ├─ Update ────>│
    │                  │                  │ status       │
    │<─ 200 OK ────────┤                  │<─ done ──────┤
    │                  │<─ 200 JSON ──────┤              │
```

---

## Service Layer - 9 Core Functions

```
┌────────────────────────────────────────────────────────────┐
│              shipping.service.js - 9 Functions            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  1️⃣  authenticate()          → Get/return auth token     │
│      POST /auth/login                                      │
│                                                            │
│  2️⃣  checkServiceability()    → Get courier options     │
│      GET /courier/serviceability                          │
│                                                            │
│  3️⃣  createShipment()         → Create order             │
│      POST /orders/create/v2                               │
│      Trigger: ✅ Order confirmed (payment received)      │
│                                                            │
│  4️⃣  assignAWB()              → Assign courier & AWB     │
│      POST /courier/assign/awb                             │
│      Trigger: ✅ Shipment created                        │
│                                                            │
│  5️⃣  generatePickup()         → Schedule pickup          │
│      POST /pickups/new                                    │
│      Trigger: ✅ AWB assigned                            │
│                                                            │
│  6️⃣  trackShipment()          → Get tracking data        │
│      GET /trackings/tracking_data                         │
│      Trigger: 🔄 On-demand by customer                   │
│                                                            │
│  7️⃣  generateLabel()          → Generate label PDF       │
│      POST /labels/generate/v2                             │
│      Trigger: 🔄 On-demand for packing                   │
│                                                            │
│  8️⃣  generateInvoice()        → Generate invoice PDF     │
│      POST /invoices/generate/v2                           │
│      Trigger: 🔄 On-demand                               │
│                                                            │
│  9️⃣  cancelOrder()            → Cancel shipment          │
│      POST /orders/cancel/v2                               │
│      Trigger: 🔄 Customer cancels order                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Token Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│              Token Manager - Lifecycle                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Controller/Service                                        │
│      │                                                      │
│      ├─ Call: tokenManager.getToken()                     │
│      │                                                      │
│      ▼                                                      │
│  Is token valid?                                           │
│      │                                                      │
│      ├─ YES: Return cached token (instant)                │
│      │                                                      │
│      └─ NO: Refresh token                                  │
│           │                                                 │
│           ├─ POST /auth/login (Shiprocket)                │
│           │   └─ Get new token (10 day expiry)           │
│           │                                                 │
│           ├─ Store in memory                              │
│           │                                                 │
│           └─ Return new token                             │
│                                                             │
│  5-Minute Buffer: Refresh if < 5 min remaining            │
│  Prevents: Token expiry failures during requests          │
│                                                             │
│  Locking: Prevents duplicate refresh calls                │
│  Multiple simultaneous requests → Single refresh          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Order Status Lifecycle

```
┌────────────────────────────────────────────────────────────┐
│           Order Status Progression in MongoDB              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  PENDING                                                   │
│    │ (Payment confirmed)                                   │
│    ▼                                                        │
│  CONFIRMED  ───────────────────────────┐                 │
│    │                                    │                 │
│    │ (Create shipment)                 │                 │
│    ▼                                    │                 │
│  SHIPMENT_CREATED                      │                 │
│    │                                    │                 │
│    │ (Assign AWB)                      │                 │
│    ▼                                    │                 │
│  AWB_ASSIGNED                          │ (If CANCELLED)  │
│    │                                    │                 │
│    │ (Generate pickup)                 │                 │
│    ▼                                    │                 │
│  PICKUP_GENERATED                      │                 │
│    │                                    │                 │
│    │ (Courier picks up)                │                 │
│    ▼                                    │                 │
│  PICKED_UP / IN_TRANSIT                │                 │
│    │                                    │                 │
│    │ (Out for delivery)                │                 │
│    ▼                                    │                 │
│  OUT_FOR_DELIVERY                      │                 │
│    │                                    │                 │
│    │ (Delivered)                       │                 │
│    ▼                                    │                 │
│  DELIVERED                             │                 │
│                                         │                 │
│         OR (Webhook update)            │                 │
│                                        │                 │
│    ┌────────────────────────────────┘  │                 │
│    │                                    │                 │
│    ▼                                    ▼                 │
│  FAILED_ATTEMPT                     CANCELLED            │
│    │                                                      │
│    ▼                                                      │
│  RTO (Return to Origin)                                  │
│                                                            │
│  Status History: Every change is logged with timestamp   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Webhook Event Processing

```
┌──────────────────────────────────────────────────────────┐
│         Shiprocket Webhook Event Handling                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Shiprocket Sends:                                      │
│  {                                                       │
│    "awb": "14112366035400",                            │
│    "shipment_status": 7,                                │
│    "current_status": "Delivered",                       │
│    "courier_name": "Xpressbees",                        │
│    "shipment_id": 1360828812                            │
│  }                                                       │
│                                                          │
│  Webhook Receiver:                                      │
│  1. Validate payload ✓                                   │
│  2. Find order by AWB or shipment_id ✓                 │
│  3. Map status code to enum ✓                           │
│  4. Check if already processed (idempotency) ✓          │
│  5. Update MongoDB order ✓                               │
│  6. Add to statusHistory ✓                               │
│  7. Return 200 OK ✓                                      │
│                                                          │
│  Status Code Mapping:                                   │
│  0  → PENDING                                            │
│  3  → PICKUP_GENERATED                                   │
│  4  → PICKED_UP                                          │
│  5  → IN_TRANSIT                                         │
│  6  → OUT_FOR_DELIVERY                                   │
│  7  → DELIVERED         ← Most common                    │
│  10 → RTO                                                │
│                                                          │
│  MongoDB Update:                                        │
│  {                                                       │
│    shippingStatus: "DELIVERED",                         │
│    orderStatus: "DELIVERED",                            │
│    statusHistory: [                                      │
│      { status: "DELIVERED", timestamp: ..., note: ... } │
│    ]                                                     │
│  }                                                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## File Dependencies

```
server/server.js
    │
    ├─ Routes Layer
    │   ├─ shipping.routes.js ────────────────┐
    │   └─ webhook.routes.js                  │
    │                                          │
    ├─ Controllers                            │
    │   ├─ shipping.controller.js             │
    │   └─ webhook.controller.js              │
    │                                          │
    ├─ Services                               │
    │   └─ shipping.service.js ─────────┐     │
    │                                    │     │
    ├─ Utils                            │     │
    │   └─ tokenManager.js ─────────┐   │     │
    │                                │   │     │
    ├─ Config                        │   │     │
    │   └─ shiprocket.js ──────────┐ │   │     │
    │                               │ │   │     │
    ├─ Models                       │ │   │     │
    │   └─ Order.js ────────────────┼─┼───┘     │
    │                               │ │         │
    └─ .env (credentials) ──────────┼─┼─────────┘
                                    │ │
                                    ▼ ▼
                            Shiprocket API
```

---

## Request Validation Flow

```
POST /api/shipping/create-order

    ▼
Input Validation (express-validator)
    │
    ├─ Check body.orderId exists ✓
    ├─ Check orderId not empty ✓
    
    ▼
Validation Results
    │
    ├─ If errors: Return 400 with error details
    └─ If valid: Call handler
        │
        ▼
    Controller Handler
        │
        ├─ Fetch order from MongoDB ✓
        ├─ Check if order exists ✓
        │
        ▼
    Service Layer
        │
        ├─ Get token ✓
        ├─ Call Shiprocket API ✓
        ├─ Handle errors ✓
        │
        ▼
    Return Response (200 or 500)
```

---

## Error Handling Strategy

```
┌───────────────────────────────────────────────┐
│         Error Handling Hierarchy              │
├───────────────────────────────────────────────┤
│                                               │
│  Service Layer                                │
│  └─ Catch error from Shiprocket API           │
│     └─ Log detailed error                     │
│        └─ Throw custom error object           │
│                                               │
│  Controller Layer                             │
│  └─ Catch service error                       │
│     └─ Format for HTTP response               │
│        └─ Send 500 with error message         │
│                                               │
│  Route Layer (validation)                     │
│  └─ Catch validation errors                   │
│     └─ Format validation response             │
│        └─ Send 400 with field errors          │
│                                               │
│  Global Error Handler (optional)              │
│  └─ Catch uncaught errors                     │
│     └─ Log & respond with 500                 │
│                                               │
└───────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                 PRODUCTION SETUP                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Environment                                        │
│  ├─ Node.js runtime (v20.x)                        │
│  ├─ Express.js server                              │
│  ├─ MongoDB Atlas (cloud database)                 │
│  └─ Nodemailer (email notifications)               │
│                                                     │
│  Environment Variables (secure)                    │
│  ├─ SHIPROCKET_EMAIL                              │
│  ├─ SHIPROCKET_PASSWORD                           │
│  ├─ SHIPROCKET_WEBHOOK_SECRET                     │
│  └─ Other secrets                                  │
│                                                     │
│  Monitoring & Logging                              │
│  ├─ Console logs for debugging                     │
│  ├─ Error tracking (optional: Sentry)              │
│  ├─ MongoDB logs                                   │
│  └─ Request logs                                   │
│                                                     │
│  Security                                          │
│  ├─ HTTPS only (in production)                     │
│  ├─ Webhook secret verification (optional)         │
│  ├─ Rate limiting on shipping endpoints            │
│  ├─ JWT authentication for protected routes        │
│  └─ CORS configured                                │
│                                                     │
│  Scalability                                        │
│  ├─ Token manager handles concurrent requests     │
│  ├─ MongoDB indexing on order lookups              │
│  ├─ Webhook idempotency prevents duplicates        │
│  └─ Status history for audit trail                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Maintainability and scalability
- ✅ Proper error handling
- ✅ Production-grade security
- ✅ Real-time tracking
- ✅ Complete audit trail
