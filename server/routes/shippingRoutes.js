const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');

let shiprocketToken = null;
let tokenExpiry = null;

// Get Shiprocket auth token
async function getShiprocketToken() {
  if (shiprocketToken && tokenExpiry && Date.now() < tokenExpiry) {
    return shiprocketToken;
  }
  
  try {
    const response = await axios.post(`${process.env.SHIPROCKET_API_URL}/auth/login`, {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD
    });
    
    shiprocketToken = response.data.token;
    tokenExpiry = Date.now() + (10 * 24 * 60 * 60 * 1000); // 10 days
    
    return shiprocketToken;
  } catch (error) {
    console.error('Shiprocket auth error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Shiprocket');
  }
}

// @route   POST /api/shipping/check-serviceability
// @desc    Check if delivery is available for pincode
router.post('/check-serviceability', async (req, res) => {
  try {
    const { pincode } = req.body;
    
    // Validate pincode
    if (!pincode || pincode.length !== 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid 6-digit pincode' 
      });
    }
    
    // Check if Shiprocket credentials are configured
    if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
      console.warn('Shiprocket credentials not configured, allowing all pincodes');
      return res.json({
        success: true,
        serviceable: true,
        estimatedDays: '3-5 business days',
        codAvailable: true
      });
    }
    
    const token = await getShiprocketToken();
    
    const response = await axios.get(
      `${process.env.SHIPROCKET_API_URL}/courier/serviceability`,
      {
        params: {
          pickup_postcode: '500001', // Your warehouse pincode
          delivery_postcode: pincode,
          weight: 0.5,
          cod: 1
        },
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    const serviceable = response.data.data.available_courier_companies.length > 0;
    
    res.json({
      success: true,
      serviceable,
      estimatedDays: serviceable ? '3-5 business days' : null,
      codAvailable: serviceable
    });
  } catch (error) {
    console.error('Shiprocket serviceability error:', error.message);
    // Fallback: Allow all pincodes if Shiprocket fails
    res.json({
      success: true,
      serviceable: true,
      estimatedDays: '3-5 business days',
      codAvailable: true,
      note: 'Using fallback serviceability check'
    });
  }
});

// @route   POST /api/shipping/create-order
// @desc    Create order in Shiprocket
router.post('/create-order', async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const order = await Order.findOne({ orderId }).populate('items.product');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const token = await getShiprocketToken();
    
    const shiprocketData = {
      order_id: order.orderId,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: 'Primary',
      billing_customer_name: order.shippingAddress.fullName,
      billing_last_name: '',
      billing_address: order.shippingAddress.addressLine1,
      billing_address_2: order.shippingAddress.addressLine2 || '',
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.pincode,
      billing_state: order.shippingAddress.state,
      billing_country: 'India',
      billing_email: order.shippingAddress.email || 'noreply@shriyashfoods.com',
      billing_phone: order.shippingAddress.phone,
      shipping_is_billing: true,
      order_items: order.items.map(item => ({
        name: item.name,
        sku: item.sku,
        units: item.quantity,
        selling_price: item.price,
        discount: 0
      })),
      payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
      sub_total: order.pricing.subtotal,
      length: 15,
      breadth: 10,
      height: 5,
      weight: 0.3
    };
    
    const response = await axios.post(
      `${process.env.SHIPROCKET_API_URL}/orders/create/adhoc`,
      shiprocketData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    // Update order with Shiprocket details
    order.shiprocketOrderId = response.data.order_id;
    order.shiprocketShipmentId = response.data.shipment_id;
    order.orderStatus = 'PROCESSING';
    order.statusHistory.push({
      status: 'PROCESSING',
      note: 'Order sent to Shiprocket'
    });
    
    await order.save();
    
    res.json({ success: true, message: 'Order created in Shiprocket', order });
  } catch (error) {
    console.error('Shiprocket order creation error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/shipping/track/:orderId
// @desc    Track shipment
router.get('/track/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order || !order.shiprocketShipmentId) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }
    
    const token = await getShiprocketToken();
    
    const response = await axios.get(
      `${process.env.SHIPROCKET_API_URL}/courier/track/shipment/${order.shiprocketShipmentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    res.json({ success: true, tracking: response.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
