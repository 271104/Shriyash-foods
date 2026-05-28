# Shriyash Foods MERN E-Commerce - Comprehensive Codebase Analysis

**Date:** May 2026 | **Project:** Ragnor (Shriyash Foods)

---

## 1. EXISTING IMPLEMENTATIONS ✅

### 1.1 Order Model Architecture
**File:** `server/models/Order.js`

**Fields:**
- `orderId` (String, unique) - Format: `SHR{timestamp}`
- `user` (ObjectId ref: User) - For authenticated users
- `guestDetails` - For guest orders (name, phone, email)
- `items[]` - Product array with:
  - `product` (ObjectId)
  - `name, variant, price, quantity, sku`
- `shippingAddress` - Separate from user address:
  - fullName, phone, email (required)
  - addressLine1, addressLine2, landmark
  - city, state, pincode (required)
- `pricing` - Object with:
  - subtotal, shipping, discount, total
- `paymentMethod` - Enum: `['COD', 'PREPAID']`
- `paymentStatus` - Enum: `['PENDING', 'PAID', 'FAILED', 'REFUNDED']`
- `razorpayPaymentId, razorpayOrderId` - Payment tracking
- `orderStatus` - Enum: `['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RTO']` (default: 'PENDING')
- **Shiprocket Fields:**
  - `shiprocketOrderId, shiprocketShipmentId`
  - `awbCode, courierName, trackingUrl, labelUrl, invoiceUrl`
  - `pickupReference`
  - `shippingStatus` - Enum: `['PENDING', 'SHIPMENT_CREATED', 'AWB_ASSIGNED', 'PICKUP_GENERATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED_ATTEMPT', 'CANCELLED', 'RTO']`
- `isOTPVerified` (Boolean, default: false)
- `isFirstOrder` (Boolean)
- `statusHistory[]` - Array of status changes with timestamps & notes
- Timestamps: createdAt, updatedAt

### 1.2 User Model
**File:** `server/models/User.js`

**Authentication Fields:**
- `phone` (String, unique, required)
- `password` (hashed with bcryptjs)
- `isPhoneVerified` (Boolean, default: false)
- `refreshToken` - For token refresh

**User Profile:**
- `name, email`
- `addresses[]` - Multiple saved addresses

**Account Status:**
- `isGuest` (Boolean, default: false)
- `guestSessionId` (String, sparse)
- `isBlocked` (Boolean, default: false)
- `failedDeliveries` (Number, default: 0)
- `otpAttempts` - Tracks failed OTP attempts:
  - `count` (default: 0)
  - `lastAttempt` (Date)

**Metadata:**
- `orderHistory[]` - References to Order ObjectIds
- `lastLogin` (Date)
- Timestamps: createdAt, updatedAt

### 1.3 OTP Model
**File:** `server/models/OTP.js`

**Fields:**
- `phone` (String, indexed, required)
- `otp` (String)
- `purpose` - Enum: `['login', 'register', 'checkout_guest', 'verification']`
- `attempts` (Number, default: 0, max: 3)
- `isUsed` (Boolean, default: false)
- `expiresAt` (Date, TTL index)
- Compound index: `{phone, purpose, isUsed}`

**Auto-cleanup:** Expires after 5 minutes, cleaned up every 10 minutes

### 1.4 Checkout Flow (Authenticated Users)
**File:** `client/src/pages/Checkout.js`

**Flow:**
1. User navigates to checkout, sees `CheckoutAuthModal` if not authenticated
2. If authenticated:
   - Form pre-fills with user name, phone, email
   - User selects delivery address
   - Validates pincode via Shiprocket
   - Calculates shipping cost
   - Selects payment method (COD/PREPAID)
   - Applies discount if PREPAID (₹25)
   - Creates order on backend
   - If PREPAID: Opens Razorpay modal
   - If COD: Redirects to OrderSuccess page
3. **Phone verification:** 
   - User's phone must be verified before checkout
   - OTP-verified during login/registration

**Key Validations:**
- Pincode must be serviceable via Shiprocket
- COD limit enforcement:
  - First order: ₹1,500 max
  - Subsequent orders: ₹3,000 max
- Order value > 500 or first order requires OTP verification
- User must not be blocked to use COD

### 1.5 Guest Checkout Flow
**File:** `client/src/pages/Checkout.js` + `client/src/components/CheckoutAuthModal.js`

**Flow:**
1. Unauthenticated user clicks checkout → `CheckoutAuthModal` shows options:
   - "Continue as Guest" (recommended)
   - "Login to Your Account"
2. **Guest checkout:**
   - User enters phone number
   - System sends OTP via WhatsApp (WasenderAPI) or SMS (MSG91)
   - User verifies OTP
   - JWT token created with `purpose: 'checkout_guest'` and `phone` (30min expiry)
   - Guest can now proceed with checkout using same form as authenticated users
   - `guestVerificationToken` passed to order creation
3. **Guest details stored in Order:**
   - `order.guestDetails`: {name, phone, email}
   - `order.user`: null (no user account)

### 1.6 Authentication System
**File:** `server/routes/authRoutes.js` + `client/src/context/AuthContext.js`

**OTP-Based Authentication:**

**Route:** `POST /api/auth/send-otp`
- Params: `{phone, purpose}` (purposes: 'login', 'register', 'checkout_guest')
- Rate limit: 5 requests per 15 minutes per phone
- Validations:
  - 10-digit Indian phone (starts with 6-9)
  - Checks if account exists
  - Prevents new registrations on existing numbers (for 'register' purpose)
  - Checks if user is blocked
- Response includes `userExists` flag

**Route:** `POST /api/auth/verify-otp`
- Params: `{phone, otp, purpose, userData, guestData}`
- Validates OTP (max 3 attempts)
- For 'checkout_guest': Returns `guestVerificationToken`
- For 'register': Creates new user or updates guest to verified
- For 'login': Validates existing verified user
- Returns JWT tokens: `accessToken` (15min) + `refreshToken` (7days)

**Token Management:**
- Stored in localStorage: `accessToken`, `refreshToken`
- Axios interceptor auto-adds `Authorization: Bearer {token}` header
- 401 + 'TOKEN_EXPIRED' triggers token refresh
- Failed refresh logs out user

### 1.7 OTP Delivery Services
**File:** `server/services/otpService.js`

**Primary:** WhatsApp via WasenderAPI
- `sendWhatsAppOTP()` - Sends via `https://www.wasenderapi.com/api/send-message`
- Environment: `WASENDER_API_KEY`, `WASENDER_API_URL`

**Fallback:** SMS via MSG91
- `sendSMSOTP()` - Uses MSG91 API
- Environment: `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`

**Development:** Console logs OTP to stdout

**Message Format:**
```
Your Shriyash Foods OTP is: {OTP}

Valid for 5 minutes. Do not share this code with anyone.

- Team Shriyash Foods
```

### 1.8 Razorpay Payment Integration
**File:** `server/routes/paymentRoutes.js` + `client/src/pages/Checkout.js`

**Routes:**

**POST /api/payment/create-order**
- Creates Razorpay order with amount in paise
- Updates Order.razorpayOrderId
- Returns: `razorpayOrderId, amount, currency, keyId`

**POST /api/payment/verify**
- Signature verification: `HMAC-SHA256(orderId|paymentId)`
- Updates Order: `paymentStatus='PAID', orderStatus='CONFIRMED'`
- Pushes status history entry
- Returns updated order

**POST /api/payment/failed**
- Records failed payment in statusHistory
- Updates paymentStatus to 'FAILED'

**GET /api/payment/diagnostics**
- Checks if Razorpay credentials exist
- Validates if using LIVE vs TEST keys
- Returns configuration status

**Frontend Flow:**
1. After order creation, calls `/api/payment/create-order`
2. Opens Razorpay modal with prefilled data
3. On success: Calls `/api/payment/verify`
4. On failure: Calls `/api/payment/failed` + shows error
5. Error handler listens for `razorpay.on('payment.failed', ...)`

### 1.9 Shiprocket Integration
**Files:** 
- `server/services/shipping.service.js` (business logic)
- `server/controllers/shipping.controller.js` (HTTP handlers)
- `server/routes/shipping.routes.js` (endpoints)

**Token Management:** `server/utils/tokenManager.js`
- Caches authentication token
- Auto-refreshes before expiry
- Uses: `SHIPROCKET_CLIENT_ID`, `SHIPROCKET_CLIENT_SECRET`

**Routes:**

**POST /api/shipping/auth**
- Gets Shiprocket token
- Returns: `{token, expiresIn}`

**GET /api/shipping/serviceability**
- Query: `pickup_postcode, delivery_postcode, weight, cod`
- Returns: 
  - `serviceable` (Boolean)
  - `couriers[]` with `name, freightCharges, codCharges, etd`
  - `shippingCharge` (cheapest)
  - `codAvailable` (Boolean)
  - `estimatedDays`

**POST /api/shipping/create-order**
- Converts MongoDB Order to Shiprocket format
- Maps items, customer, shipping, pricing
- Returns: `shiprocketOrderId, shipmentId, status`
- Updates Order with Shiprocket IDs

**POST /api/shipping/assign-awb**
- Assigns AWB code to shipment
- Updates Order: `awbCode, courierName, trackingUrl`
- Pushes status history: 'AWB_ASSIGNED'

**POST /api/shipping/generate-pickup**
- Generates pickup request
- Updates Order: `pickupReference`
- Pushes status history: 'PICKUP_GENERATED'

**GET /api/shipping/track/:awb**
- Returns Shiprocket tracking data

**POST /api/shipping/generate-label**
- Generates shipping label PDF
- Updates Order: `labelUrl`

**POST /api/shipping/generate-invoice**
- Generates invoice PDF
- Updates Order: `invoiceUrl`

**POST /api/shipping/cancel-order**
- Cancels order in Shiprocket

**Webhook Handling:**
- File: `server/controllers/webhook.controller.js`
- Receives status updates from Shiprocket
- Status mapping: Numeric (0-10) and text status maps to Order statuses
- Updates `shippingStatus` and `orderStatus`
- Prevents duplicate updates (checks last status)
- Pushes to `statusHistory` with timestamp & note

**Weight Calculation:**
- Extracts from variant string (e.g., "500g", "1kg")
- Converts to kg
- Minimum 0.5kg for calculations

### 1.10 Shiprocket Status Mapping
**Numeric Mapping (0-10):**
- 0: PENDING → PENDING
- 1-2: SHIPMENT_CREATED → CONFIRMED/PROCESSING
- 3: PICKUP_GENERATED → PROCESSING
- 4: PICKED_UP → SHIPPED
- 5: IN_TRANSIT → SHIPPED
- 6: OUT_FOR_DELIVERY → SHIPPED
- 7: DELIVERED → DELIVERED
- 8: FAILED_ATTEMPT → SHIPPED
- 9: CANCELLED → CANCELLED
- 10: RTO → RTO

**Text Status Mapping:**
- NEW, PENDING, ORDER_CREATED, SHIPMENT_CREATED → SHIPMENT_CREATED
- PICKUP_SCHEDULED, PICKUP_GENERATED → PICKUP_GENERATED
- SHIPPED, IN_TRANSIT → IN_TRANSIT
- OUT_FOR_DELIVERY → OUT_FOR_DELIVERY
- DELIVERED → DELIVERED
- UNDELIVERED, FAILED_DELIVERY → FAILED_ATTEMPT
- CANCELLED, CANCELED → CANCELLED
- RTO, RTO_INITIATED, RTO_DELIVERED → RTO

### 1.11 Order Tracking - Logged-In Users
**File:** `client/src/pages/OrderTracking.js`

**Features:**
- Timeline visualization (PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED)
- Displays current status badge
- Shows AWB code + courier tracking link
- Shows order details (items, total)
- Shows delivery address
- Fetches order from `/api/orders/:orderId`

**Limitations:**
- Only fetches order details, doesn't show shipping status history
- No real-time updates
- Timeline is hardcoded (doesn't reflect actual status history)

### 1.12 Frontend Pages
**Client-side routes:**

- `/` - Home page (`Home.js`)
- `/products` - Product listing (`Products.js`)
- `/products/:productId` - Product detail (`ProductDetail.js`)
- `/cart` - Shopping cart (`Cart.js`)
- `/checkout` - Checkout form (`Checkout.js`)
- `/order-success/:orderId` - Order confirmation (`OrderSuccess.js`)
- `/track/:orderId` - Order tracking (`OrderTracking.js`)
- `/profile` - User profile (`Profile.js`)
- `/auth` - Login/Register (`Auth.js` + components)
- `/about` - About page (`AboutUs.js`)
- `/our-journey` - Our Journey (`OurJourney.js`)
- `/contact` - Contact Us (`ContactUs.js`)
- `/privacy` - Privacy Policy (`PrivacyPolicy.js`)
- `/terms` - Terms & Conditions (`TermsConditions.js`)
- `/refund` - Refund Policy (`RefundPolicy.js`)

### 1.13 Context Providers
**AuthContext** (`client/src/context/AuthContext.js`):
- State: `user, loading, isAuthenticated, isGuest`
- Methods: `sendOTP(), verifyOTPAndLogin(), logout(), updateProfile(), mergeGuestCart()`
- Auto-setup axios interceptors for token management

**CartContext** (`client/src/context/CartContext.js`):
- State: `cartItems, cartTotal`
- Methods: `addToCart(), removeFromCart(), updateQuantity(), clearCart(), mergeGuestCart()`

### 1.14 API Routes Structure

**Authentication Routes (`/api/auth`):**
- `POST /send-otp` - Send OTP
- `POST /verify-otp` - Verify OTP & login/register
- `POST /refresh-token` - Refresh access token
- `GET /me` - Get current user
- `POST /logout` - Logout
- `PUT /profile` - Update profile
- `POST /merge-guest-cart` - Merge guest cart

**Orders Routes (`/api/orders`):**
- `POST /create` - Create new order
- `GET /:orderId` - Get order by ID
- `GET /` - Get user's orders (protected)
- `POST /:orderId/verify-otp` - Deprecated

**Payment Routes (`/api/payment`):**
- `POST /create-order` - Create Razorpay order
- `POST /verify` - Verify payment
- `POST /failed` - Record failed payment
- `GET /diagnostics` - Payment config diagnostics

**Shipping Routes (`/api/shipping`):**
- `POST /auth` - Authenticate with Shiprocket
- `GET /serviceability` - Check delivery serviceability
- `POST /create-order` - Create shipment
- `POST /assign-awb` - Assign AWB
- `POST /generate-pickup` - Generate pickup
- `GET /track/:awb` - Track shipment
- `POST /generate-label` - Generate label
- `POST /generate-invoice` - Generate invoice
- `POST /cancel-order` - Cancel order

**Webhook Routes (`/api/webhooks`):**
- `POST /order-status` - Shiprocket webhook (requires x-api-key header)
- `POST /shiprocket` - Legacy webhook endpoint
- `GET /tracking/:orderId` - Get order tracking info
- `POST /test` - Test webhook
- `POST /manual-update` - Manual status update

**Cart Routes (`/api/cart`):**
- Session/user-based cart management

**Products Routes (`/api/products`):**
- Product listing, details, search

**OTP Routes (`/api/otp`):**
- `POST /send` - Send OTP (legacy)
- `POST /verify` - Verify OTP (legacy)
- `POST /resend` - Resend OTP (legacy)

---

## 2. MISSING IMPLEMENTATIONS ❌

### 2.1 Guest Order Tracking System
**Currently:** Guest users cannot track orders after checkout without order ID in URL

**Missing:**
1. **Guest Order Lookup Page**
   - Route: `/guest-track` or `/track-guest-order`
   - Fields: Phone number + Order ID
   - OTP verification to confirm ownership
   - Shows same tracking info as authenticated users

2. **Guest Account Linking**
   - After order delivery/few days later, prompt guest to "Create Account"
   - Link guest order to new account
   - Pre-fill phone number (OTP verified)
   - Allow setting password + profile details
   - Convert `user: null` orders to `user: userId`

3. **Guest Order History**
   - No way for guests to see all their orders
   - Would need guest account linking first

4. **Guest to Registered User Flow**
   - After guest checkout, send link: "Create Account to Track"
   - Frontend: Link in email/SMS points to registration with phone pre-filled
   - Backend: Allow guest email/phone to create account after X days

### 2.2 WhatsApp Order Status Notifications
**File:** `server/services/otpService.js` (exists but only for OTP)

**Missing:**
1. **WhatsApp Message Service**
   - Separate service for transactional messages (not OTP)
   - Different message template/purpose
   - Should integrate with:
     - Order confirmation after payment
     - Shipment created notification
     - AWB assigned notification
     - Out for delivery notification
     - Delivery confirmation

2. **Webhook Trigger Points**
   - On order payment confirmation: Send WhatsApp
   - On Shiprocket webhook received (each status change): Send WhatsApp
   - Template format:
     ```
     Order {orderId} confirmed!
     Tracking: {link}
     Expected delivery: {date}
     ```

3. **Message Queue/Retry Logic**
   - No queue for failed message sends
   - No retry mechanism
   - No delivery confirmation tracking

### 2.3 Shiprocket Webhook Handlers
**File:** `server/controllers/webhook.controller.js` (partial implementation)

**Implemented:**
- Basic webhook receiver
- Status mapping
- Order update logic
- Duplicate prevention

**Missing:**
1. **Webhook Event Type Handlers**
   - Currently handles only shipment_status updates
   - Missing: RTO events, Delivery failure events, Signature issues
   - No differentiation between event types

2. **Webhook Signature Verification**
   - Uses `x-api-key` header (basic)
   - Missing: Full Shiprocket signature verification if they provide it
   - No webhook request logging for debugging

3. **Advanced Tracking Events**
   - Exception handling (address issues, unable to locate)
   - Return to origin (RTO) reason codes
   - Failed delivery attempts with reasons
   - Delivery time windows

4. **Customer Notifications on Webhook**
   - Currently updates database only
   - Missing: WhatsApp/Email notifications to customer
   - No in-app notification system

### 2.4 Order Tracking Timeline Component
**File:** `client/src/pages/OrderTracking.js` (basic implementation)

**Current:**
- Hardcoded timeline steps
- Shows current status position
- No actual status history display

**Missing:**
1. **Dynamic Status History Timeline**
   - Display `order.statusHistory[]` items
   - Show timestamps for each status change
   - Show notes/descriptions
   - Format: "Picked up - 2 hours ago by Xpressbees"

2. **Real-Time Updates**
   - WebSocket integration for live status
   - Server Sent Events (SSE) alternative
   - Polling fallback (every 30 seconds)

3. **Expected Delivery Date**
   - Calculated from Shiprocket ETD
   - Should be stored in Order model
   - Updated when AWB assigned

4. **Detailed Tracking Events**
   - Exception reasons (if failed attempt)
   - Courier contact info
   - Delivery attempts details
   - RTO status details

5. **Advanced Features**
   - Shipment location on map
   - Courier contact button (WhatsApp/Phone)
   - Delivery updates SMS/Email opt-in
   - Delay notifications

### 2.5 Invoice & Label Download
**Backend:** Routes exist but frontend not integrated
**Files:** `server/routes/shipping.routes.js` endpoints exist

**Missing:**

1. **Order Success Page Enhancement**
   - Add buttons: "Download Invoice", "Download Label"
   - Show AWB code
   - Show estimated delivery date
   - Links to track order + download documents

2. **Tracking Page Integration**
   - Conditionally show download buttons after AWB assigned
   - Disabled until Shiprocket generates files

3. **Frontend Components**
   - Download button UI component
   - Loading state handling
   - Error handling for failed downloads
   - Success toast notifications

4. **Backend Enhancement**
   - Error handling if label/invoice not ready
   - Retry logic if Shiprocket generation fails
   - Cache generated URLs if available

### 2.6 OTP Login System - Complete Implementation
**Partially Implemented:** Basic OTP verification in authRoutes

**Missing:**

1. **Dedicated Login Page**
   - Route: `/login`
   - Phone input + OTP verification
   - Currently: Only checkout modal flow
   - Need standalone login UI

2. **Registration Page**
   - Route: `/register`
   - Phone input → OTP → Name + Email form
   - Currently: Only during checkout

3. **Phone Update in Profile**
   - Cannot change phone after account creation
   - Missing: Phone change with OTP verification flow

4. **Password Reset**
   - No password recovery mechanism
   - Pure OTP-based auth (no password field)
   - This is OK but needs documentation

### 2.7 Account Linking for Guest Orders
**Currently:** Guest orders stay as guest (user: null)

**Missing:**

1. **Guest to Account Conversion**
   - Post-delivery prompt: "Create account to track future orders"
   - Links guest order to new account
   - Updates Order.user field

2. **Account Merge Logic**
   - When guest creates account with same phone
   - Find existing guest orders with same phone
   - Link them to new user account
   - Update orderHistory

3. **Guest Session Tracking**
   - Currently: `guestSessionId` field in User model unused
   - Should track guest session UUID
   - Use for matching guest orders to same session

### 2.8 Status History Tracking Gaps
**Implemented:** `statusHistory[]` in Order model

**Missing:**

1. **Automatic Status Notes**
   - Currently: Generic notes like "Picked up via {courier}"
   - Missing: Detailed failure reasons, exception info
   - Should include: delivery attempt address, contact issues

2. **Payment Status History**
   - Currently: Not tracked separately
   - Should record: Payment initiated, verification failed, refunded

3. **Order Status History**
   - Currently: Only major statuses recorded
   - Missing: Intermediate states during processing

4. **Status History API**
   - Currently: Included in order fetch
   - Missing: Dedicated endpoint to fetch only history
   - Missing: Filtering/pagination for large histories

### 2.9 Auto-Linking Logic - Not Implemented
**Concept:** Automatically link guest orders when account created

**Missing:**

1. **Phone-Based Matching**
   - When user registers, find orders with:
     - `user: null`
     - `guestDetails.phone === registeredPhone`
   - Link them to new user account
   - Update Order.user
   - Push status history note: "Account linked"

2. **Email-Based Matching**
   - Secondary matching if phone doesn't match
   - Find by guest email

3. **Session-Based Matching**
   - If guest created account same session
   - Use sessionId to match

4. **User Notification**
   - Notify user of linked orders
   - Show in "My Orders" immediately

### 2.10 Shipping Tracking Display Gaps
**Tracking page shows:**
- Current status
- Hardcoded timeline
- AWB code
- Courier link

**Missing:**
- Actual status history with timestamps
- Expected delivery date
- Last update time
- Exception details (if any)
- Courier name per step (if changed)

---

## 3. POTENTIAL ISSUES 🔴

### 3.1 Architecture Issues

#### 3.1.1 **No Real-Time Notifications**
- All tracking updates are pull-based (user refreshes page)
- No WebSocket or Server-Sent Events
- WhatsApp notifications missing
- Impact: Users don't know order status updates

#### 3.1.2 **Guest Order Orphaning**
- Guest orders (user: null) cannot be tracked after URL expires
- No way to retrieve guest order without direct link
- Guest cannot create account after checkout
- Impact: Lost customer relationship, no order history

#### 3.1.3 **No Message Queue**
- OTP delivery direct HTTP calls
- No retry mechanism for failed sends
- No message delivery tracking
- Impact: Silent OTP failures if service down

#### 3.1.4 **Webhook Resilience**
- No idempotency keys for duplicate webhooks
- Only checks last status (not idempotent)
- Could process same status twice if replayed
- Impact: Potential duplicate notifications/records

#### 3.1.5 **Session Management Issues**
- Guest session tracking unused (`guestSessionId` field never set)
- Cannot link guest orders to logged-in account
- No cart persistence across sessions
- Impact: Loss of guest cart when tab closed

### 3.2 Data Model Issues

#### 3.2.1 **Missing Fields in Order Model**
```javascript
// Should add:
expectedDeliveryDate: Date,
actualDeliveryDate: Date,
lastStatusUpdateTime: Date,
shippingProvider: String, // 'shiprocket' vs future providers
// Guest order reference tracking:
linkedUserId: ObjectId, // for account linking
originalGuestPhone: String, // for linking after registration
```

#### 3.2.2 **User Model Gaps**
```javascript
// Should add:
loginMethod: String, // 'otp' vs 'password'
guestOrdersLinked: Number, // count of guest orders linked
phoneChangeAttempts: [{phone, timestamp, status}], // audit
accountCreatedFrom: String, // 'guest_checkout', 'direct_registration'
```

#### 3.2.3 **No Audit Trail**
- No tracking of who modified orders
- No admin update tracking
- Missing: Authorization level tracking
- Impact: Cannot trace issues or disputes

#### 3.2.4 **Cart Model Issues**
- Cart can be orphaned (guest checkout clears it)
- No automatic cleanup of old carts
- No cart merge logic when guest registers
- Impact: Duplicate items in cart after login

### 3.3 Integration Gaps

#### 3.3.1 **Shiprocket Integration Fragility**
- No caching of token between requests
- Token manager exists but used inconsistently
- No fallback if Shiprocket down
- Missing: Graceful degradation
- Impact: Full application failure if Shiprocket unavailable

#### 3.3.2 **Payment & Shipping Mismatch**
- Shipping calculated at checkout, may change
- No validation that final amount matches Razorpay
- Could allow manipulation of shipping cost
- Impact: Revenue loss or price discrepancies

#### 3.3.3 **Multiple Shipping Route Files**
- Both `shippingRoutes.js` and `shipping.routes.js` exist
- Unclear which is used
- Could cause routing confusion
- Impact: Dead code, maintainability issues

### 3.4 Security Concerns

#### 3.4.1 **OTP Security Issues**
- OTP sent in response body for development mode
- Need to hide in production
- OTP attempts counter may not prevent brute force
- Rate limiting at 5 per 15 minutes (good but check if sufficient)

#### 3.4.2 **JWT Token Issues**
- Access token 15 minutes (good)
- Refresh token 7 days (long - consider 7 days for refresh OK)
- No token blacklisting on logout
- Refresh token not invalidated on logout
- Impact: Old tokens could be reused if stolen before expiry

#### 3.4.3 **COD Fraud Prevention Insufficient**
- Blocks based on `isBlocked` flag only
- No IP-based fraud detection
- No repeat failed delivery tracking
- No address validation
- Impact: Potential fraudulent orders

#### 3.4.4 **Guest Checkout Verification**
- Guest verified via JWT token with phone
- Could allow bypass if token replayed
- No rate limiting on order creation
- Impact: Potential for automated fraudulent orders

#### 3.4.5 **Webhook Authentication**
- Only checks `x-api-key` header
- Basic authentication method
- No HMAC signature verification of payload
- Impact: Could accept forged webhooks

#### 3.4.6 **Input Validation Gaps**
- Shipping address not validated (exists in DB?)
- No address format validation
- SKU field optional (could be null)
- Item quantity not validated (could be 0 or negative)

#### 3.4.7 **CORS Configuration**
- Allows any localhost origin in dev
- Process.env.CLIENT_URL included without validation
- Could expose API to misconfigured client URLs
- Impact: CSRF or cross-origin attacks

#### 3.4.8 **No Rate Limiting on Orders**
- Can create unlimited orders once OTP verified
- No throttling per user
- Impact: Spam orders, inventory manipulation

### 3.5 Data Quality Issues

#### 3.5.1 **Address Validation**
- Shipping address not validated against pincode
- Pincode format only checked in checkout (6 digits)
- No state/city/pincode matching
- Impact: Invalid deliveries

#### 3.5.2 **Phone Number Validation**
- Only checks 10-digit format starting with 6-9
- Doesn't validate actual number existence
- No check if number is actually a mobile phone
- Impact: Orders to invalid numbers

#### 3.5.3 **Product Variant Parsing**
- Weight extracted by regex from variant string
- Fragile parsing: "500g", "1 kg" vs "1kg"
- Could fail silently, defaulting to 0.5kg
- Impact: Incorrect shipping calculations

#### 3.5.4 **Order ID Collision Risk**
- Format: `SHR{timestamp}` (milliseconds)
- Could collide in high-concurrency scenario
- Should add random suffix
- Impact: Duplicate orders possible

### 3.6 Testing & Documentation

#### 3.6.1 **No Automated Tests**
- No unit tests for models or services
- No integration tests for API flows
- No E2E tests for checkout
- Impact: Regressions not caught

#### 3.6.2 **API Documentation Incomplete**
- No Swagger/OpenAPI docs
- Route documentation minimal
- Webhook payload format not documented
- Impact: Integration difficulties

#### 3.6.3 **Error Handling Inconsistent**
- Some endpoints return `{success: false, message}`
- Others may throw unhandled errors
- No global error handler pattern
- Impact: Unpredictable error responses

---

## 4. RECOMMENDATIONS 📋

### Priority 1: Critical (Implement First)

#### 4.1 Guest Order Tracking System
**Why:** Customers lose ability to track orders after checkout

**Implementation Steps:**
1. Create `/guest-track` page
2. Implement guest lookup API: `GET /api/orders/guest/:phone/:orderId` with OTP verification
3. Add "Track Order" button to OrderSuccess page
4. Implement phone + order ID input form

**Files to Create:**
- `client/src/pages/GuestOrderTracking.js`
- `server/routes/guestOrderRoutes.js` (new)

**Estimated Effort:** 4-6 hours

#### 4.2 Guest to Account Linking
**Why:** Recovers lost customer relationships

**Implementation Steps:**
1. Add `originalGuestPhone` and `linkedFromGuest` to User model
2. Create `/register?phone={phone}&orderId={orderId}` flow
3. On registration, auto-link guest orders by phone
4. Show notification: "X previous orders linked"

**Files to Modify:**
- `server/models/User.js`
- `server/routes/authRoutes.js`
- `client/src/components/CheckoutAuthModal.js`

**Estimated Effort:** 6-8 hours

#### 4.3 WhatsApp Order Notifications
**Why:** Current status updates invisible to customers

**Implementation Steps:**
1. Create `server/services/notificationService.js`
2. Add notification triggers in webhook handler
3. Template messages for each status
4. Test with WasenderAPI

**Files to Create/Modify:**
- `server/services/notificationService.js` (new)
- `server/controllers/webhook.controller.js`
- `server/routes/paymentRoutes.js` (add notification on payment)

**Estimated Effort:** 5-7 hours

#### 4.4 Fix Order Tracking Timeline
**Why:** Shows hardcoded timeline instead of actual history

**Implementation Steps:**
1. Query `order.statusHistory` from backend
2. Render actual timeline with timestamps
3. Add "last updated X minutes ago"
4. Show delivery address and AWB

**Files to Modify:**
- `client/src/pages/OrderTracking.js`
- `server/routes/webhook.routes.js` (add `/tracking` endpoint if missing)

**Estimated Effort:** 3-4 hours

#### 4.5 Secure Order ID Generation
**Why:** Risk of ID collisions in concurrent scenarios

**Implementation Steps:**
1. Change Order ID format to: `SHR{timestamp}{randomString}`
2. Example: `SHR1705084200000ABC123`
3. Use crypto.randomBytes(6).toString('hex')

**Files to Modify:**
- `server/routes/orderRoutes.js` (order creation)

**Estimated Effort:** 1-2 hours

### Priority 2: High (Implement Next)

#### 4.6 Webhook Idempotency
**Why:** Duplicate webhooks could cause issues

**Implementation Steps:**
1. Add `webhookId` field to Order model
2. Check `webhookId` before processing
3. Return success without updating if duplicate

**Files to Modify:**
- `server/models/Order.js`
- `server/controllers/webhook.controller.js`

**Estimated Effort:** 2-3 hours

#### 4.7 Add Expected Delivery Date
**Why:** Customers want to know when to expect delivery

**Implementation Steps:**
1. Add `expectedDeliveryDate` to Order model
2. Calculate from Shiprocket ETD + current date
3. Update on AWB assignment
4. Display on tracking page

**Files to Modify:**
- `server/models/Order.js`
- `server/services/shipping.service.js`
- `client/src/pages/OrderTracking.js`

**Estimated Effort:** 3-4 hours

#### 4.8 Invoice & Label Download Buttons
**Why:** Users need these documents

**Implementation Steps:**
1. Add buttons to OrderSuccess page (after payment)
2. Add buttons to OrderTracking page (after AWB assigned)
3. Call backend download endpoints
4. Handle disabled state until ready

**Files to Create/Modify:**
- `client/src/components/DocumentDownloadButtons.js` (new)
- `client/src/pages/OrderSuccess.js`
- `client/src/pages/OrderTracking.js`

**Estimated Effort:** 4-5 hours

#### 4.9 Real-Time Tracking Updates (SSE or WebSocket)
**Why:** Users see outdated information

**Implementation Steps:**
1. Add Server-Sent Events (simpler than WebSocket)
2. Client connects to `/api/webhooks/track/{orderId}`
3. Server pushes updates when status changes
4. Fallback to polling every 30 seconds

**Files to Create/Modify:**
- `server/routes/webhook.routes.js` (add SSE endpoint)
- `client/src/pages/OrderTracking.js`

**Estimated Effort:** 6-8 hours

#### 4.10 Order Amount Validation
**Why:** Could allow shipping cost manipulation

**Implementation Steps:**
1. On payment verify, recalculate order total
2. Check against Razorpay amount
3. Reject if mismatch > ₹10

**Files to Modify:**
- `server/routes/paymentRoutes.js`

**Estimated Effort:** 2-3 hours

### Priority 3: Medium (Implement After Priority 1 & 2)

#### 4.11 Message Queue for Notifications
**Why:** OTP/notification delivery unreliable without queue

**Implementation Steps:**
1. Add Bull queue library
2. Create job queue for OTP sends
3. Retry failed sends with exponential backoff
4. Track delivery status

**Files to Create/Modify:**
- `server/queues/notificationQueue.js` (new)
- `server/services/otpService.js`

**Estimated Effort:** 5-6 hours

#### 4.12 Dedicated Login/Register Pages
**Why:** Currently only in checkout flow

**Implementation Steps:**
1. Create `/login` page component
2. Create `/register` page component
3. Routes in App.js
4. Flows same as checkout modal but standalone

**Files to Create:**
- `client/src/pages/Login.js` (new)
- `client/src/pages/Register.js` (new)

**Estimated Effort:** 4-5 hours

#### 4.13 Enhanced Address Validation
**Why:** Invalid addresses waste shipping costs

**Implementation Steps:**
1. Validate pincode-state-city combinations
2. Use postal code database
3. Show suggestions (autocomplete)
4. Reject clearly invalid combinations

**Files to Modify:**
- `client/src/pages/Checkout.js`
- `server/middleware/validation.js`

**Estimated Effort:** 4-6 hours

#### 4.14 COD Fraud Prevention Enhancement
**Why:** Current method insufficient

**Implementation Steps:**
1. Track order creation per IP address
2. Limit orders per IP per day
3. Flag suspicious patterns
4. Add admin manual review for flagged orders

**Files to Modify:**
- `server/middleware/auth.js` (add IP tracking)
- `server/routes/orderRoutes.js`

**Estimated Effort:** 4-5 hours

#### 4.15 Comprehensive Error Handling
**Why:** Inconsistent error responses

**Implementation Steps:**
1. Create custom error classes
2. Global error handler middleware
3. Consistent response format: `{success, message, code, details}`
4. Proper HTTP status codes

**Files to Create/Modify:**
- `server/middleware/errorHandler.js` (new)
- `server/server.js`
- All route files

**Estimated Effort:** 5-7 hours

### Priority 4: Nice to Have (Polish & Enhancement)

#### 4.16 Swagger/OpenAPI Documentation
**Why:** Better API integration and testing

#### 4.17 Admin Dashboard
**Why:** Manage orders, refunds, disputes

#### 4.18 Email Notifications (Fallback)
**Why:** Some users may not have WhatsApp

#### 4.19 Push Notifications
**Why:** Real-time alerts to mobile app users

#### 4.20 Refund Management System
**Why:** Currently no refund workflow

---

## 5. IMPLEMENTATION PRIORITY MATRIX

```
┌─────────────────────────────────────────────────────────┐
│ IMPACT (High/Low) vs EFFORT (High/Low)                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ HIGH IMPACT    │ Do First  │ Do Next                  │
│ LOW EFFORT     │ (4.1-4.5) │ (4.6-4.7)               │
│                │           │                          │
├─────────────────────────────────────────────────────────┤
│                │           │ Do Later  │ Don't Do     │
│ HIGH IMPACT    │ Do Soon   │ (4.14)    │ (4.16-4.20) │
│ HIGH EFFORT    │ (4.3,4.6) │ (4.15)    │              │
│                │ (4.9)     │           │              │
├─────────────────────────────────────────────────────────┤
│ LOW IMPACT     │           │           │              │
│ LOW EFFORT     │ (4.8)     │ Skip      │ Skip         │
│                │           │           │              │
└─────────────────────────────────────────────────────────┘
```

**Quick Order to Implement:**
1. **4.1** - Guest Order Tracking (4-6h) ← START HERE
2. **4.4** - Fix Order Timeline (3-4h)
3. **4.5** - Secure Order IDs (1-2h)
4. **4.2** - Guest Account Linking (6-8h)
5. **4.3** - WhatsApp Notifications (5-7h)

**Total for Priority 1:** ~20-30 hours

---

## 6. ENVIRONMENT VARIABLES REQUIRED

### Must Have (Already Set)
- `MONGO_URI` - MongoDB connection
- `JWT_SECRET` - Token signing
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `SHIPROCKET_CLIENT_ID`, `SHIPROCKET_CLIENT_SECRET`
- `WASENDER_API_KEY` - WhatsApp OTP

### Should Have
- `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID` - SMS fallback
- `SHIPROCKET_WEBHOOK_SECRET` - Webhook verification
- `NODE_ENV` - Set to 'production' for live
- `CLIENT_URL` - Frontend URL for CORS

### Optional
- `JWT_REFRESH_SECRET` - Separate from JWT_SECRET (better security)
- `OTP_EXPIRY` - OTP validity duration
- `SESSION_SECRET` - For session management (if added)

---

## 7. KEY FILES SUMMARY

### Critical Files to Know
| File | Purpose | Status |
|------|---------|--------|
| `server/models/Order.js` | Order schema | Complete |
| `server/models/User.js` | User schema | Needs fields |
| `server/services/shipping.service.js` | Shiprocket ops | Complete |
| `server/controllers/webhook.controller.js` | Webhook handling | Partial |
| `client/src/pages/Checkout.js` | Checkout flow | Complete |
| `client/src/pages/OrderTracking.js` | Tracking display | Basic |
| `server/services/otpService.js` | OTP delivery | Complete |

### Files Needing Creation
| File | Purpose |
|------|---------|
| `client/src/pages/GuestOrderTracking.js` | Guest tracking page |
| `server/services/notificationService.js` | WhatsApp notifications |
| `client/src/pages/Login.js` | Standalone login |
| `client/src/pages/Register.js` | Standalone registration |
| `server/queues/notificationQueue.js` | Message queue |
| `server/middleware/errorHandler.js` | Global error handling |

---

## 8. TESTING CHECKLIST

### Manual Testing Steps
- [ ] Register new user via OTP
- [ ] Login existing user
- [ ] Guest checkout with OTP verification
- [ ] Create COD order
- [ ] Create PREPAID order with payment
- [ ] Check order appears in /orders
- [ ] Verify Shiprocket webhook updates status
- [ ] Check tracking page shows updated status
- [ ] Verify OTP sent via WhatsApp
- [ ] Download invoice/label
- [ ] Track guest order without account

---

## Summary

**Codebase Status:** ~70% Complete
- ✅ Core MERN stack functional
- ✅ Razorpay integration working
- ✅ Shiprocket integration working
- ✅ OTP authentication implemented
- ⚠️ Guest tracking missing
- ⚠️ Real-time notifications missing
- ⚠️ Account linking missing
- ⚠️ Some security gaps

**Next Actions:**
1. Implement guest order tracking (single highest value item)
2. Add WhatsApp notifications (improves UX)
3. Fix order timeline display (quick win)
4. Implement account linking (recovers lost customers)
5. Add real-time tracking (polish)

**Estimated Total Effort for Priority 1-2:** 40-50 hours development + 5-10 hours testing
