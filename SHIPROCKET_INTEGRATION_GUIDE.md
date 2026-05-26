# 🚚 Shiprocket Integration Guide - Shriyash Foods

**Complete Step-by-Step Implementation Manual for Your Project**

---

## 📋 Table of Contents

1. [Before You Start](#before-you-start)
2. [Step 1: Complete Shiprocket Account Setup](#step-1-complete-shiprocket-account-setup)
3. [Step 2: Add Pickup Location](#step-2-add-pickup-location)
4. [Step 3: Create API User](#step-3-create-api-user)
5. [Step 4: Select API Modules](#step-4-select-api-modules)
6. [Step 5: Store Credentials](#step-5-store-credentials)
7. [Step 6: Test Authentication (Postman)](#step-6-test-authentication-postman)
8. [Step 7: Update Product Model](#step-7-update-product-model)
9. [Step 8: Update Order Model](#step-8-update-order-model)
10. [Step 9: Build Backend Service Layer](#step-9-build-backend-service-layer)
11. [Step 10: Add Shipping Routes](#step-10-add-shipping-routes)
12. [Step 11: Configure Webhook](#step-11-configure-webhook)
13. [Step 12: Design Order Flow](#step-12-design-order-flow)
14. [Step 13: Frontend Tracking UI](#step-13-frontend-tracking-ui)
15. [Step 14: Pincode Verification](#step-14-pincode-verification)
16. [Step 15: Testing Sequence](#step-15-testing-sequence)

---

## 🎯 Before You Start

**IMPORTANT**: Do NOT code immediately. Follow this sequence:

1. ✅ Complete Shiprocket dashboard setup (Steps 1-6)
2. ✅ Test authentication via Postman
3. ✅ Then integrate into backend

**Why?** Shiprocket won't work without:
- Business profile complete
- Pickup address registered
- API credentials working
- Bank details verified

---

## ✅ STEP 1: Complete Shiprocket Account Setup

### What You Need to Do

Inside **Shiprocket Dashboard** (https://app.shiprocket.in):

### 1.1 Business Profile

**Navigate to:**
```
Settings → Profile Settings
```

**Complete:**
- Business name: `Shriyash Foods`
- Business type: `Food & Beverages`
- Registration number (if applicable)
- Business category: `Grocery/Food Products`

### 1.2 Pickup Address (CRITICAL)

**Navigate to:**
```
Settings → Pickup Addresses
```

**Add Information:**
```
Name: Shriyash Foods Warehouse
Phone: [Your contact number]
Address: [Your warehouse/office complete address]
City: [City name]
State: [State name]
Pincode: [Pincode]
Country: India
```

**Example:**
```
Name: Shriyash Foods Warehouse
Phone: 9876543210
Address: 123 Main Street, Plot No. 45, Business Complex
City: Bangalore
State: Karnataka
Pincode: 560001
Country: India
```

### 1.3 Bank Details

**Navigate to:**
```
Settings → Business → Bank Details
```

**Enter:**
- Account number
- IFSC code
- Account holder name
- Account type

### 1.4 KYC Verification

**Navigate to:**
```
Settings → KYC Status
```

**Complete:**
- Upload PAN card
- Upload Aadhar card (optional but recommended)
- Upload business proof

### 1.5 GST Details (if applicable)

**Navigate to:**
```
Settings → GST Details
```

**Enter:**
- GST registration number
- Company name
- Address

---

## 📍 STEP 2: Add Pickup Location

**Why This Matters:**
Without a registered pickup location:
- Shiprocket cannot generate AWB (Air Waybill)
- Pickup scheduling will fail
- Shipment creation will fail

### 2.1 Navigate to Pickup Addresses

```
Dashboard → Settings → Pickup Addresses
```

### 2.2 Click "Add Pickup Address"

**Form Fields to Complete:**

| Field | Example Value |
|-------|---------------|
| Address Name | Shriyash Foods Main Warehouse |
| Contact Person | [Your name] |
| Phone Number | 9876543210 |
| Email | shriyash@gmail.com |
| Address Line 1 | 123 Main Street, Plot 45 |
| Address Line 2 | Business Complex |
| City | Bangalore |
| State | Karnataka |
| Pincode | 560001 |
| Country | India |
| Pickup Time (From) | 09:00 AM |
| Pickup Time (To) | 06:00 PM |

### 2.3 Set as Default

- Toggle "Set as Default Pickup Address"
- This becomes your primary `pickup_location` in API calls

### 2.4 Verify

After saving, you should see:
```
✅ Shriyash Foods Main Warehouse
📍 Bangalore, Karnataka 560001
📞 9876543210
```

**Store this**: You'll need the `pickup_location_id` for API calls.

---

## 🔑 STEP 3: Create API User

**CRITICAL**: Use a DIFFERENT email than your Shiprocket login.

### 3.1 Navigate to API Settings

```
Dashboard → Settings → API Settings → Add New API User
```

### 3.2 Create API User Form

**Important Fields:**

| Field | Value |
|-------|-------|
| Email | `shriyash.api@gmail.com` (NOT your login email) |
| Name | Shriyash Foods API |
| Mobile | 9876543210 |
| Role | API User |

### 3.3 Password Handling

- Shiprocket generates a password automatically
- **Password is sent to your registered seller email** (not the API email)
- Save this password securely

**Example email you'll receive:**
```
From: Shiprocket Support
Subject: API User Created Successfully

Your API User has been created:
Email: shriyash.api@gmail.com
Temporary Password: [password]
Login: https://app.shiprocket.in
```

### 3.4 First Login

1. Login to Shiprocket with API user credentials
2. Change the temporary password
3. **Save new password to your backend `.env` file**

---

## 🛠️ STEP 4: Select API Modules

### 4.1 Navigate to API Permissions

After creating API user, go to:
```
Settings → API Settings → [Select your API user]
```

### 4.2 Enable Required Modules

**Check/Enable these:**

- ✅ **Orders** - Create, update, cancel orders
- ✅ **Shipping** - Create shipments, get rates
- ✅ **Tracking** - Track packages
- ✅ **Pickup** - Schedule pickups
- ✅ **Labels** - Generate shipping labels
- ✅ **Webhooks** - Receive real-time updates

### 4.3 Save Permissions

After selecting, click **Save/Update**.

### 4.4 Verify in API Settings

You should see a green checkmark ✅ for each module.

---

## 📝 STEP 5: Store Credentials in Backend

### 5.1 Update Your `.env` File

Create or update `server/.env`:

```env
# Shiprocket API Configuration
SHIPROCKET_EMAIL=shriyash.api@gmail.com
SHIPROCKET_PASSWORD=your_actual_password_here
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1/external
SHIPROCKET_WEBHOOK_SECRET=your_custom_webhook_secret

# Pickup Location ID (get from Shiprocket dashboard)
SHIPROCKET_PICKUP_LOCATION_ID=123456

# For local testing
SHIPROCKET_WEBHOOK_URL=http://localhost:5000/api/shipping/webhook
```

### 5.2 .env.example (for GitHub)

Create `server/.env.example` (without actual values):

```env
SHIPROCKET_EMAIL=your_api_email@example.com
SHIPROCKET_PASSWORD=your_api_password
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1/external
SHIPROCKET_WEBHOOK_SECRET=your_custom_webhook_secret
SHIPROCKET_PICKUP_LOCATION_ID=your_pickup_location_id
SHIPROCKET_WEBHOOK_URL=http://localhost:5000/api/shipping/webhook
```

### 5.3 Update `server.js`

Make sure your `server.js` loads these:

```javascript
require('dotenv').config();

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;
const SHIPROCKET_BASE_URL = process.env.SHIPROCKET_BASE_URL;
const SHIPROCKET_WEBHOOK_SECRET = process.env.SHIPROCKET_WEBHOOK_SECRET;
```

---

## 🧪 STEP 6: Test Authentication (Postman)

**DO NOT skip this step.** Test authentication first before integration.

### 6.1 Open Postman

Download from: https://www.postman.com/downloads/

### 6.2 Create New Request

**Method:** `POST`

**URL:**
```
https://apiv2.shiprocket.in/v1/external/auth/login
```

### 6.3 Request Headers

Go to **Headers** tab:

```
Content-Type: application/json
```

### 6.4 Request Body

Go to **Body** tab, select **raw** and **JSON**:

```json
{
  "email": "shriyash.api@gmail.com",
  "password": "your_actual_password"
}
```

### 6.5 Send Request

Click **Send**.

### 6.6 Expected Success Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400
}
```

**If you see this**: ✅ Your API credentials work!

### 6.7 Common Errors

**Error 1: 401 Unauthorized**
```json
{
  "error": "Invalid credentials"
}
```
**Fix:** Double-check email/password

**Error 2: 404 Not Found**
```
Check URL is correct: https://apiv2.shiprocket.in/v1/external/auth/login
```

**Error 3: 422 Validation Error**
```json
{
  "error": "Email field is required"
}
```
**Fix:** Ensure JSON format is correct

### 6.8 Save This Token

Once you get a token, copy it. You'll use it for other API calls.

---

## 🗄️ STEP 7: Update Product Model

### 7.1 Current Product Model

Your `server/models/Product.js` currently has:

```javascript
weight: String,  // e.g., "250g"
```

### 7.2 Problem

Shiprocket needs:
- Actual numerical weight (in kg)
- Length, breadth, height (in cm)

To calculate shipping costs accurately.

### 7.3 Updated Product.js Schema

Open `server/models/Product.js` and add this field:

```javascript
shippingDetails: {
  weight: {
    type: Number,           // in kg
    required: true,
    default: 0.5
  },
  length: {
    type: Number,           // in cm
    required: true,
    default: 15
  },
  breadth: {
    type: Number,           // in cm
    required: true,
    default: 10
  },
  height: {
    type: Number,           // in cm
    required: true,
    default: 4
  }
}
```

### 7.4 Example Data

For a typical vegetable product:

```javascript
{
  name: "Fresh Tomatoes",
  price: 60,
  weight: "500g",  // Keep this for display
  
  // NEW: Add shipping dimensions
  shippingDetails: {
    weight: 0.5,      // 500g = 0.5 kg
    length: 25,       // 25 cm
    breadth: 20,      // 20 cm
    height: 10        // 10 cm
  }
}
```

### 7.5 Update Existing Products

Run this in MongoDB or create a migration:

```javascript
db.products.updateMany(
  {},
  {
    $set: {
      "shippingDetails.weight": 0.5,
      "shippingDetails.length": 15,
      "shippingDetails.breadth": 10,
      "shippingDetails.height": 4
    }
  }
)
```

---

## 📦 STEP 8: Update Order Model

### 8.1 Current Order Model

Your `server/models/Order.js` may not have shipping fields.

### 8.2 Add Shipping Fields

Open `server/models/Order.js` and add:

```javascript
// Shipping Information
shiprocketShipmentId: {
  type: String,
  default: null
},

awb: {
  type: String,
  description: "Air Waybill number from Shiprocket",
  default: null
},

courierName: {
  type: String,
  description: "e.g., Delhivery, Ecom Express",
  default: null
},

trackingId: {
  type: String,
  default: null
},

estimatedDeliveryDate: {
  type: Date,
  default: null
},

labelUrl: {
  type: String,
  description: "Shipping label PDF URL",
  default: null
},

invoiceUrl: {
  type: String,
  description: "Invoice PDF URL",
  default: null
},

manifestUrl: {
  type: String,
  description: "Manifest PDF URL",
  default: null
},

pickupScheduled: {
  type: Boolean,
  default: false,
  description: "Whether pickup has been scheduled"
},

shippingStatus: {
  type: String,
  enum: ['pending', 'pickup_scheduled', 'picked_up', 'shipped', 'delivered', 'failed'],
  default: 'pending'
},

shippingTimeline: [{
  status: String,
  timestamp: Date,
  location: String,
  remarks: String
}]
```

### 8.3 Complete Order Schema Example

```javascript
{
  orderId: "ORD123",
  userId: ObjectId,
  items: [...],
  totalAmount: 1500,
  paymentStatus: "completed",
  
  // NEW: Shiprocket fields
  shiprocketShipmentId: "19842947",
  awb: "DLV12345678",
  courierName: "Delhivery",
  trackingId: "DLV12345678",
  estimatedDeliveryDate: "2024-03-25",
  pickupScheduled: true,
  shippingStatus: "shipped",
  
  // Timeline for tracking
  shippingTimeline: [
    {
      status: "pickup_scheduled",
      timestamp: "2024-03-23T10:00:00Z",
      location: "Warehouse",
      remarks: "Pickup scheduled"
    },
    {
      status: "picked_up",
      timestamp: "2024-03-23T14:00:00Z",
      location: "Warehouse",
      remarks: "Package picked up"
    }
  ]
}
```

---

## 🔧 STEP 9: Build Backend Service Layer

### 9.1 Create shiprocketService.js

Create new file: `server/services/shiprocketService.js`

```javascript
/**
 * Shiprocket API Integration Service
 * Handles all communication with Shiprocket API
 */

const axios = require('axios');

const BASE_URL = process.env.SHIPROCKET_BASE_URL;
const API_EMAIL = process.env.SHIPROCKET_EMAIL;
const API_PASSWORD = process.env.SHIPROCKET_PASSWORD;

let cachedToken = null;
let tokenExpiry = null;

/**
 * 1. AUTHENTICATE - Get API Token
 */
async function authenticate() {
  try {
    // Check if cached token is still valid
    if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
      console.log('✅ Using cached Shiprocket token');
      return cachedToken;
    }

    console.log('🔄 Requesting new Shiprocket token...');

    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: API_EMAIL,
      password: API_PASSWORD
    });

    cachedToken = response.data.token;
    
    // Token expires in 24 hours (86400 seconds)
    // Set expiry to 23 hours to be safe
    tokenExpiry = new Date(Date.now() + 23 * 60 * 60 * 1000);

    console.log('✅ Authentication successful');
    return cachedToken;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    throw new Error('Shiprocket authentication failed');
  }
}

/**
 * 2. CHECK SERVICEABILITY - Can we ship to this pincode?
 */
async function checkServiceability(pincode, weight, length, breadth, height) {
  try {
    const token = await authenticate();

    const response = await axios.post(
      `${BASE_URL}/courier/serviceability/`,
      {
        pincode: pincode,
        weight: weight,
        length: length,
        breadth: breadth,
        height: height
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Serviceability check passed for pincode:', pincode);
    return response.data;
  } catch (error) {
    console.error('❌ Serviceability check failed:', error.response?.data || error.message);
    throw new Error('Pincode not serviceable');
  }
}

/**
 * 3. CREATE SHIPMENT - Create order shipment
 */
async function createShipment(orderData) {
  try {
    const token = await authenticate();

    const payload = {
      order_id: orderData.orderId,
      order_date: new Date().toISOString(),
      pickup_location_id: process.env.SHIPROCKET_PICKUP_LOCATION_ID,
      
      // Shipping address
      shipping_address: {
        name: orderData.customerName,
        address: orderData.shippingAddress,
        city: orderData.city,
        state: orderData.state,
        pincode: orderData.pincode,
        phone: orderData.phone,
        email: orderData.email
      },
      
      // Order items
      order_items: orderData.items.map(item => ({
        name: item.name,
        sku: item.sku || item._id,
        units: item.quantity,
        selling_price: item.price
      })),
      
      // Dimensions
      length: orderData.length,
      breadth: orderData.breadth,
      height: orderData.height,
      weight: orderData.weight,
      
      // Payment
      payment_method: orderData.paymentMethod,
      sub_total: orderData.subtotal,
      length_unit: 'cm',
      weight_unit: 'kg'
    };

    const response = await axios.post(`${BASE_URL}/orders/create/adhoc`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Shipment created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Shipment creation failed:', error.response?.data || error.message);
    throw new Error('Shipment creation failed');
  }
}

/**
 * 4. ASSIGN AWB - Assign Air Waybill number
 */
async function assignAWB(shipmentId, courierCompanyId) {
  try {
    const token = await authenticate();

    const response = await axios.post(
      `${BASE_URL}/courier/assign/awb`,
      {
        shipment_id: shipmentId,
        courier_company_id: courierCompanyId
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ AWB assigned:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ AWB assignment failed:', error.response?.data || error.message);
    throw new Error('AWB assignment failed');
  }
}

/**
 * 5. SCHEDULE PICKUP - Schedule pickup from warehouse
 */
async function schedulePickup(pickupDetails) {
  try {
    const token = await authenticate();

    const response = await axios.post(
      `${BASE_URL}/pickups/schedule`,
      {
        shipment_id: pickupDetails.shipmentId,
        pickup_location_id: process.env.SHIPROCKET_PICKUP_LOCATION_ID,
        expected_date: pickupDetails.expectedDate || new Date().toISOString().split('T')[0]
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Pickup scheduled:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Pickup scheduling failed:', error.response?.data || error.message);
    throw new Error('Pickup scheduling failed');
  }
}

/**
 * 6. TRACK SHIPMENT - Get tracking info
 */
async function trackShipment(awb) {
  try {
    const token = await authenticate();

    const response = await axios.get(
      `${BASE_URL}/courier/track/awb/${awb}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Tracking info retrieved:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Tracking failed:', error.response?.data || error.message);
    throw new Error('Tracking failed');
  }
}

/**
 * 7. HANDLE WEBHOOK - Parse webhook from Shiprocket
 */
function handleWebhook(webhookData) {
  try {
    const event = webhookData.event;
    const data = webhookData.data;

    console.log(`📨 Webhook received - Event: ${event}`);

    // Different event types
    switch (event) {
      case 'order_picked_up':
        return {
          status: 'picked_up',
          timestamp: webhookData.timestamp,
          awb: data.awb
        };
      
      case 'order_in_transit':
        return {
          status: 'in_transit',
          timestamp: webhookData.timestamp,
          currentLocation: data.current_location
        };
      
      case 'order_delivered':
        return {
          status: 'delivered',
          timestamp: webhookData.timestamp,
          deliveredDate: data.delivery_date
        };
      
      case 'order_rto':
        return {
          status: 'rto',
          timestamp: webhookData.timestamp,
          reason: data.reason
        };
      
      default:
        console.log('Unknown webhook event:', event);
        return null;
    }
  } catch (error) {
    console.error('❌ Webhook handling failed:', error.message);
    throw new Error('Webhook parsing failed');
  }
}

module.exports = {
  authenticate,
  checkServiceability,
  createShipment,
  assignAWB,
  schedulePickup,
  trackShipment,
  handleWebhook
};
```

### 9.2 Install Axios (if not already installed)

```bash
cd server
npm install axios
```

---

## 📡 STEP 10: Add Shipping Routes

### 10.1 Update `server/routes/shippingRoutes.js`

Your project already has this file. Update it:

```javascript
const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const shiprocketService = require('../services/shiprocketService');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * Route 1: Check Serviceability
 * GET /api/shipping/serviceability?pincode=560001
 */
router.get('/serviceability', async (req, res) => {
  try {
    const { pincode } = req.query;

    if (!pincode) {
      return res.status(400).json({ error: 'Pincode required' });
    }

    // Default dimensions for testing
    const serviceability = await shiprocketService.checkServiceability(
      pincode,
      0.5,      // weight in kg
      15,       // length in cm
      10,       // breadth in cm
      4         // height in cm
    );

    res.json({
      serviceable: true,
      data: serviceability
    });
  } catch (error) {
    res.status(400).json({
      serviceable: false,
      error: error.message
    });
  }
});

/**
 * Route 2: Create Shipment
 * POST /api/shipping/create
 * Body: { orderId, shipmentDetails }
 */
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { orderId, items, customerName, shippingAddress, city, state, pincode, phone, email, totalAmount } = req.body;

    // Validate
    if (!orderId || !items || !customerName || !pincode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check serviceability
    const serviceability = await shiprocketService.checkServiceability(
      pincode,
      0.5, 15, 10, 4
    );

    if (!serviceability) {
      return res.status(400).json({ error: 'Pincode not serviceable' });
    }

    // Create shipment
    const shipmentData = {
      orderId,
      customerName,
      shippingAddress,
      city,
      state,
      pincode,
      phone,
      email,
      items,
      subtotal: totalAmount,
      weight: 0.5,
      length: 15,
      breadth: 10,
      height: 4,
      paymentMethod: 'Prepaid'
    };

    const shipment = await shiprocketService.createShipment(shipmentData);

    // Update Order with shipment details
    await Order.findByIdAndUpdate(orderId, {
      shiprocketShipmentId: shipment.shipment_id,
      shippingStatus: 'pending'
    });

    res.json({
      success: true,
      shipmentId: shipment.shipment_id,
      message: 'Shipment created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Route 3: Assign AWB
 * POST /api/shipping/assign-awb
 * Body: { shipmentId, courierCompanyId }
 */
router.post('/assign-awb', authMiddleware, async (req, res) => {
  try {
    const { shipmentId, courierCompanyId } = req.body;

    const awbData = await shiprocketService.assignAWB(shipmentId, courierCompanyId);

    res.json({
      success: true,
      awb: awbData.awb,
      courierName: awbData.courier_name
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Route 4: Track Shipment
 * GET /api/shipping/track/:awb
 */
router.get('/track/:awb', async (req, res) => {
  try {
    const { awb } = req.params;

    const tracking = await shiprocketService.trackShipment(awb);

    res.json({
      success: true,
      tracking: tracking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Route 5: Get Order Tracking
 * GET /api/shipping/order/:orderId
 */
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).select(
      'orderId awb courierName trackingId estimatedDeliveryDate shippingStatus shippingTimeline'
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      order: {
        orderId: order.orderId,
        awb: order.awb,
        courier: order.courierName,
        trackingId: order.trackingId,
        estimatedDelivery: order.estimatedDeliveryDate,
        status: order.shippingStatus,
        timeline: order.shippingTimeline
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Route 6: Webhook Handler
 * POST /api/shipping/webhook
 */
router.post('/webhook', async (req, res) => {
  try {
    const webhookData = req.body;

    // Verify webhook signature
    const signature = req.headers['x-shiprocket-signature'];
    if (!signature) {
      return res.status(401).json({ error: 'Missing signature' });
    }

    // Parse webhook
    const parsed = shiprocketService.handleWebhook(webhookData);

    if (parsed) {
      // Update order
      const order = await Order.findOneAndUpdate(
        { awb: parsed.awb },
        {
          shippingStatus: parsed.status,
          $push: {
            shippingTimeline: {
              status: parsed.status,
              timestamp: new Date(),
              location: parsed.currentLocation || 'N/A',
              remarks: `Status update from Shiprocket`
            }
          }
        }
      );

      if (order) {
        console.log('✅ Order updated:', order._id);
      }
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 10.2 Register Routes in `server.js`

Make sure your `server.js` includes:

```javascript
const shippingRoutes = require('./routes/shippingRoutes');

// Register shipping routes
app.use('/api/shipping', shippingRoutes);
```

---

## 🔗 STEP 11: Configure Webhook

### 11.1 Generate Webhook Secret

Add to your `.env`:

```env
SHIPROCKET_WEBHOOK_SECRET=your_secret_key_here_min_16_chars
```

Example:
```env
SHIPROCKET_WEBHOOK_SECRET=shriyash_webhook_secure_key_2024
```

### 11.2 Add Webhook Middleware

Create: `server/middleware/verifyShiprocketWebhook.js`

```javascript
const crypto = require('crypto');

function verifyShiprocketWebhook(req, res, next) {
  try {
    const signature = req.headers['x-shiprocket-signature'];
    const body = JSON.stringify(req.body);
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.SHIPROCKET_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Webhook verification failed' });
  }
}

module.exports = verifyShiprocketWebhook;
```

### 11.3 Register Webhook Endpoint in Shiprocket Dashboard

**Go to:**
```
Settings → API → Webhooks
```

**Add Webhook URL:**

**For Production (Render):**
```
https://your-render-app.onrender.com/api/shipping/webhook
```

**For Local Testing (ngrok):**
```
https://abc123.ngrok.io/api/shipping/webhook
```

### 11.4 Select Events to Receive

Check these events:
- ✅ Order Picked Up
- ✅ Order In Transit
- ✅ Order Delivered
- ✅ Order RTO (Return to Origin)
- ✅ Order Exception

### 11.5 Test Webhook

Shiprocket provides a "Send Test" button. Click it to verify your endpoint receives data.

---

## 📊 STEP 12: Design Order Flow

### 12.1 Order Flow Decision: PREPAID vs COD

#### PREPAID Flow (Recommended for Food)

```
User places order
    ↓
Payment processed successfully
    ↓
✅ Create Shiprocket shipment
    ↓
Assign AWB
    ↓
Schedule pickup
    ↓
Order state: "pending_pickup"
    ↓
Customer can track immediately
```

#### COD Flow

```
User places order (payment pending)
    ↓
OTP verified (authentication)
    ↓
❌ DON'T create shipment yet
    ↓
Order state: "awaiting_delivery_confirmation"
    ↓
(Optional) Create shipment after payment confirmation
```

### 12.2 Updated Order Routes

Update `server/routes/orderRoutes.js`:

```javascript
// After order creation
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();

    // ONLY create Shiprocket shipment if payment is prepaid
    if (order.paymentStatus === 'completed') {
      try {
        const shipment = await shiprocketService.createShipment({
          orderId: order._id,
          // ... other details
        });

        // Update order with shipment ID
        order.shiprocketShipmentId = shipment.shipment_id;
        order.shippingStatus = 'created';
        await order.save();
      } catch (err) {
        console.error('Shipment creation failed:', err);
        // Continue - manual shipment creation later
      }
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 👥 STEP 13: Frontend Tracking UI

### 13.1 Create Tracking Component

Create: `client/src/components/OrderTracking.js`

```javascript
import React, { useState, useEffect } from 'react';
import './OrderTracking.css';

const OrderTracking = ({ orderId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderTracking();
  }, [orderId]);

  const fetchOrderTracking = async () => {
    try {
      const response = await fetch(`/api/shipping/order/${orderId}`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.order);
      }
    } catch (err) {
      setError('Failed to load tracking information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!order) return <div>Order not found</div>;

  const statusSteps = [
    { key: 'created', label: 'Order Placed', icon: '📦' },
    { key: 'picked_up', label: 'Picked Up', icon: '🚚' },
    { key: 'in_transit', label: 'In Transit', icon: '🚛' },
    { key: 'delivered', label: 'Delivered', icon: '✅' }
  ];

  return (
    <div className="order-tracking">
      <h2>Order #{order.orderId}</h2>
      
      <div className="tracking-status">
        <p><strong>Courier:</strong> {order.courier || 'Pending'}</p>
        <p><strong>Tracking ID:</strong> {order.trackingId || 'N/A'}</p>
        <p><strong>Status:</strong> <span className={`status-${order.status}`}>{order.status}</span></p>
        <p><strong>Est. Delivery:</strong> {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'N/A'}</p>
      </div>

      <div className="timeline">
        {statusSteps.map((step, index) => (
          <div key={step.key} className={`step ${order.status === step.key ? 'active' : ''}`}>
            <div className="step-icon">{step.icon}</div>
            <div className="step-label">{step.label}</div>
          </div>
        ))}
      </div>

      <div className="timeline-details">
        {order.timeline && order.timeline.map((event, idx) => (
          <div key={idx} className="timeline-event">
            <div className="event-time">
              {new Date(event.timestamp).toLocaleString()}
            </div>
            <div className="event-status">{event.status}</div>
            <div className="event-location">{event.location}</div>
            <div className="event-remarks">{event.remarks}</div>
          </div>
        ))}
      </div>

      <button onClick={fetchOrderTracking} className="refresh-btn">
        Refresh Tracking
      </button>
    </div>
  );
};

export default OrderTracking;
```

### 13.2 Add Styling

Create: `client/src/components/OrderTracking.css`

```css
.order-tracking {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
}

.tracking-status {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 5px;
  margin: 15px 0;
}

.tracking-status p {
  margin: 8px 0;
}

.status-pending { color: #ff9800; font-weight: bold; }
.status-picked_up { color: #2196f3; font-weight: bold; }
.status-in_transit { color: #2196f3; font-weight: bold; }
.status-delivered { color: #4caf50; font-weight: bold; }

.timeline {
  display: flex;
  justify-content: space-between;
  margin: 30px 0;
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 2px;
  background: #ddd;
}

.step {
  flex: 1;
  text-align: center;
  position: relative;
  z-index: 1;
}

.step.active .step-icon {
  background: #4caf50;
  color: white;
}

.step-icon {
  width: 40px;
  height: 40px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 20px;
  transition: all 0.3s;
}

.step-label {
  margin-top: 10px;
  font-size: 12px;
  color: #666;
}

.timeline-details {
  margin-top: 30px;
}

.timeline-event {
  padding: 15px;
  border-left: 3px solid #2196f3;
  margin: 15px 0;
  background: #f9f9f9;
}

.event-time {
  font-weight: bold;
  color: #2196f3;
}

.event-status {
  font-size: 14px;
  color: #333;
  margin: 5px 0;
}

.event-location {
  font-size: 12px;
  color: #666;
}

.event-remarks {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.refresh-btn {
  background: #2196f3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  margin-top: 20px;
}

.refresh-btn:hover {
  background: #1976d2;
}
```

---

## 🏠 STEP 14: Pincode Verification Before Checkout

### 14.1 Why This Matters

**Problem:**
- Customer enters pincode
- Places order
- Later: Order marked as "undeliverable"
- Customer money is refunded
- Bad experience

**Solution:**
- Check pincode BEFORE checkout
- Show error upfront
- Prevent failed orders

### 14.2 Create Pincode Checker Component

Create: `client/src/components/PincodeChecker.js`

```javascript
import React, { useState } from 'react';
import './PincodeChecker.css';

const PincodeChecker = ({ onServiceabilityCheck }) => {
  const [pincode, setPincode] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCheck = async () => {
    if (!pincode || pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    setChecking(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/shipping/serviceability?pincode=${pincode}`);
      const data = await response.json();

      if (data.serviceable) {
        setResult({
          success: true,
          message: 'This pincode is serviceable!'
        });
        
        // Callback to parent
        if (onServiceabilityCheck) {
          onServiceabilityCheck(pincode, true);
        }
      } else {
        setError('Delivery not available to this pincode');
        if (onServiceabilityCheck) {
          onServiceabilityCheck(pincode, false);
        }
      }
    } catch (err) {
      setError('Failed to check serviceability. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="pincode-checker">
      <h3>📍 Verify Delivery Location</h3>
      <p>Enter your pincode to check if delivery is available</p>
      
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter 6-digit pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength="6"
          disabled={checking}
        />
        <button 
          onClick={handleCheck}
          disabled={checking || pincode.length !== 6}
          className="check-btn"
        >
          {checking ? 'Checking...' : 'Check'}
        </button>
      </div>

      {error && <div className="error-message">❌ {error}</div>}
      {result && (
        <div className="success-message">
          ✅ {result.message}
        </div>
      )}
    </div>
  );
};

export default PincodeChecker;
```

### 14.3 Add Styling

Create: `client/src/components/PincodeChecker.css`

```css
.pincode-checker {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  border: 1px solid #e0e0e0;
}

.pincode-checker h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.pincode-checker p {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 14px;
}

.input-group {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.input-group input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.input-group input:focus {
  outline: none;
  border-color: #2196f3;
}

.check-btn {
  padding: 10px 20px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.check-btn:hover:not(:disabled) {
  background: #1976d2;
}

.check-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 5px;
  margin-top: 10px;
  border-left: 4px solid #c62828;
}

.success-message {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 12px;
  border-radius: 5px;
  margin-top: 10px;
  border-left: 4px solid #2e7d32;
}
```

### 14.4 Integrate Into Checkout Page

Update: `client/src/pages/Checkout.js`

```javascript
import PincodeChecker from '../components/PincodeChecker';

const Checkout = () => {
  const [pincodeVerified, setPincodeVerified] = useState(false);

  const handlePincodeCheck = (pincode, isServiceable) => {
    setPincodeVerified(isServiceable);
  };

  const handleCheckout = () => {
    if (!pincodeVerified) {
      alert('Please verify your pincode first');
      return;
    }
    // Continue with checkout
  };

  return (
    <div className="checkout">
      {/* ... existing checkout form ... */}
      
      <PincodeChecker onServiceabilityCheck={handlePincodeCheck} />

      <button 
        onClick={handleCheckout}
        disabled={!pincodeVerified}
      >
        {pincodeVerified ? 'Proceed to Payment' : 'Verify Pincode First'}
      </button>
    </div>
  );
};

export default Checkout;
```

---

## 🧪 STEP 15: Complete Testing Sequence

### 15.1 Testing Checklist

Use this exact sequence:

```
[] Test 1: Authentication
[] Test 2: Serviceability
[] Test 3: Create Shipment
[] Test 4: Assign AWB
[] Test 5: Track Shipment
[] Test 6: Schedule Pickup
[] Test 7: Webhook Delivery
```

### 15.2 Test 1: Authentication (Postman)

**Already done in Step 6.**

But repeat to confirm token works:

```
POST https://apiv2.shiprocket.in/v1/external/auth/login

Body:
{
  "email": "shriyash.api@gmail.com",
  "password": "your_password"
}

Expected: 200 OK with token
```

### 15.3 Test 2: Serviceability

```
GET https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pincode=560001&weight=0.5&length=15&breadth=10&height=4

Headers:
Authorization: Bearer [your_token]

Expected: List of available couriers
```

### 15.4 Test 3: Create Shipment

```
POST https://apiv2.shiprocket.in/v1/external/orders/create/adhoc

Headers:
Authorization: Bearer [token]
Content-Type: application/json

Body:
{
  "order_id": "TEST001",
  "order_date": "2024-03-23T10:00:00Z",
  "pickup_location_id": 123456,
  "shipping_address": {
    "name": "John Doe",
    "address": "123 Main St",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "phone": "9876543210",
    "email": "john@example.com"
  },
  "order_items": [
    {
      "name": "Fresh Tomatoes",
      "sku": "TOMATO001",
      "units": 2,
      "selling_price": 60
    }
  ],
  "length": 15,
  "breadth": 10,
  "height": 4,
  "weight": 0.5,
  "payment_method": "Prepaid",
  "sub_total": 120
}

Expected: 200 OK with shipment_id
```

### 15.5 Test 4: Assign AWB

```
POST https://apiv2.shiprocket.in/v1/external/courier/assign/awb

Headers:
Authorization: Bearer [token]

Body:
{
  "shipment_id": [shipment_id_from_test_3],
  "courier_company_id": 1  // Delhivery
}

Expected: AWB number assigned
```

### 15.6 Test 5: Track Shipment

```
GET https://apiv2.shiprocket.in/v1/external/courier/track/awb/DLV12345678

Headers:
Authorization: Bearer [token]

Expected: Tracking status, location
```

### 15.7 Test 6: Schedule Pickup

```
POST https://apiv2.shiprocket.in/v1/external/pickups/schedule

Headers:
Authorization: Bearer [token]

Body:
{
  "shipment_id": [shipment_id],
  "pickup_location_id": 123456,
  "expected_date": "2024-03-24"
}

Expected: Pickup scheduled successfully
```

### 15.8 Test 7: Webhook Simulation

Use Postman to send test webhook:

```
POST http://localhost:5000/api/shipping/webhook

Headers:
X-Shiprocket-Signature: [signature]
Content-Type: application/json

Body:
{
  "event": "order_picked_up",
  "timestamp": "2024-03-23T14:00:00Z",
  "data": {
    "awb": "DLV12345678",
    "order_id": "TEST001"
  }
}

Expected: 200 OK with success response
```

---

## 🚀 Production Deployment Checklist

### Before Going Live:

- [ ] Shiprocket account fully verified
- [ ] All API tests pass
- [ ] Environment variables set in Render/Vercel
- [ ] Database schema updated (Product, Order)
- [ ] Backend service layer deployed
- [ ] Webhook URL configured in Shiprocket
- [ ] Frontend tracking UI tested
- [ ] Pincode checker functional
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Security headers added

### Environment Variables for Production

```env
# Render or Vercel environment variables
SHIPROCKET_EMAIL=shriyash.api@gmail.com
SHIPROCKET_PASSWORD=production_password
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1/external
SHIPROCKET_WEBHOOK_SECRET=production_webhook_secret
SHIPROCKET_PICKUP_LOCATION_ID=123456
SHIPROCKET_WEBHOOK_URL=https://your-app.onrender.com/api/shipping/webhook
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue 1: 401 Unauthorized**
```
Check: API credentials are correct
Check: Token is not expired
Check: Email is API user email, not login email
```

**Issue 2: Pincode not serviceable**
```
Check: Pincode is valid
Check: Dimensions are reasonable
Check: Shiprocket covers that region
```

**Issue 3: Webhook not receiving**
```
Check: URL is publicly accessible
Check: Use ngrok for local testing
Check: Webhook is enabled in Shiprocket
```

**Issue 4: Token caching issues**
```
Solution: Clear cached token after 23 hours
Implementation: Already handled in shiprocketService.js
```

---

## 📚 References

- Shiprocket API Docs: https://www.shiprocket.in/api-docs/
- API Authentication: https://www.shiprocket.in/api-docs/#authentication
- Create Shipment: https://www.shiprocket.in/api-docs/#create-shipment
- Tracking: https://www.shiprocket.in/api-docs/#track-shipment
- Webhooks: https://www.shiprocket.in/api-docs/#webhooks

---

**Document Version:** 1.0  
**Last Updated:** 2024-03-23  
**For:** Shriyash Foods Ecommerce Project
