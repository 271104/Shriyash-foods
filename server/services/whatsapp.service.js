const axios = require('axios');
const Order = require('../models/Order');
const { sendOTPWhatsApp } = require('./otpService');

// Notification types mapping to WasenderAPI templates
const NOTIFICATION_TEMPLATES = {
  ORDER_CONFIRMATION: {
    templateId: 'order_confirmation',
    messageType: 'order_confirmation'
  },
  SHIPMENT_CREATED: {
    templateId: 'shipment_created',
    messageType: 'shipment_created'
  },
  PICKUP_SCHEDULED: {
    templateId: 'pickup_scheduled',
    messageType: 'pickup_scheduled'
  },
  OUT_FOR_DELIVERY: {
    templateId: 'out_for_delivery',
    messageType: 'out_for_delivery'
  },
  DELIVERED: {
    templateId: 'delivered',
    messageType: 'delivered'
  },
  CANCELLED: {
    templateId: 'cancelled',
    messageType: 'cancelled'
  }
};

/**
 * Send WhatsApp notification for order confirmation
 * Triggered after successful payment
 */
exports.sendOrderConfirmation = async (orderId) => {
  try {
    const order = await Order.findOne({ orderId }).populate('user');
    if (!order) throw new Error(`Order not found: ${orderId}`);

    const phone = order.guestDetails?.phone || order.shippingAddress?.phone;
    if (!phone) throw new Error(`No phone number found for order: ${orderId}`);

    const trackingLink = `${process.env.CLIENT_URL || 'https://shriyashfoods.com'}/guest-track?orderId=${orderId}`;
    
    const message = `🎉 *Your order has been confirmed!*

*Order ID:* ${orderId}
*Amount:* ₹${order.pricing.total}
*Payment Status:* ${order.paymentStatus === 'PAID' ? '✅ Paid' : order.paymentMethod === 'COD' ? '⏳ COD Confirmed' : '❌ Failed'}

📍 *Track your order:*
${trackingLink}

🕐 *Expected Delivery:* 3-5 business days

Thank you for shopping with *Shriyash Foods* ❤️

Questions? Reply to this message!`;

    await sendWhatsAppMessage(phone, message, 'order_confirmation', orderId);
    
    console.log('✅ Order confirmation sent:', { orderId, phone });
    return { success: true, orderId, phone };
  } catch (error) {
    console.error('❌ Error sending order confirmation:', error.message);
    throw error;
  }
};

/**
 * Send WhatsApp notification when shipment is created
 * Triggered by Shiprocket webhook
 */
exports.sendShipmentCreated = async (orderId) => {
  try {
    const order = await Order.findOne({ orderId });
    if (!order) throw new Error(`Order not found: ${orderId}`);

    const phone = order.guestDetails?.phone || order.shippingAddress?.phone;
    if (!phone) throw new Error(`No phone for order: ${orderId}`);

    // Check if already sent (prevent duplicates)
    if (order.isNotificationSent?.shipmentCreated) {
      console.log('⏭️ Shipment created notification already sent for:', orderId);
      return { success: false, reason: 'already_sent' };
    }

    const trackingLink = `${process.env.CLIENT_URL || 'https://shriyashfoods.com'}/guest-track?orderId=${orderId}`;

    const message = `🚚 *Your order is on the way!*

*Order ID:* ${orderId}
${order.courierName ? `*Courier:* ${order.courierName}` : ''}
${order.awbCode ? `*Tracking No:* ${order.awbCode}` : ''}

📍 *Track live:*
${trackingLink}

🕐 *Expected Delivery:* 3-5 business days

We'll send you updates at each step! 📦`;

    await sendWhatsAppMessage(phone, message, 'shipment_created', orderId);

    // Mark as sent
    await Order.findOneAndUpdate({ orderId }, { 'isNotificationSent.shipmentCreated': true });

    console.log('✅ Shipment created notification sent:', { orderId, phone });
    return { success: true, orderId, phone };
  } catch (error) {
    console.error('❌ Error sending shipment created notification:', error.message);
    throw error;
  }
};

/**
 * Send WhatsApp notification when out for delivery
 * Triggered by Shiprocket webhook (status change to OUT_FOR_DELIVERY)
 */
exports.sendOutForDelivery = async (orderId) => {
  try {
    const order = await Order.findOne({ orderId });
    if (!order) throw new Error(`Order not found: ${orderId}`);

    const phone = order.guestDetails?.phone || order.shippingAddress?.phone;
    if (!phone) throw new Error(`No phone for order: ${orderId}`);

    if (order.isNotificationSent?.outForDelivery) {
      console.log('⏭️ Out for delivery notification already sent for:', orderId);
      return { success: false, reason: 'already_sent' };
    }

    const trackingLink = `${process.env.CLIENT_URL || 'https://shriyashfoods.com'}/guest-track?orderId=${orderId}`;

    const message = `📦 *Your order is out for delivery today!*

*Order ID:* ${orderId}

📍 *Track in real-time:*
${trackingLink}

⏰ *Delivery window:* 10 AM - 6 PM

Please keep your phone available for delivery updates! 📱`;

    await sendWhatsAppMessage(phone, message, 'out_for_delivery', orderId);

    // Mark as sent
    await Order.findOneAndUpdate({ orderId }, { 'isNotificationSent.outForDelivery': true });

    console.log('✅ Out for delivery notification sent:', { orderId, phone });
    return { success: true, orderId, phone };
  } catch (error) {
    console.error('❌ Error sending out for delivery notification:', error.message);
    throw error;
  }
};

/**
 * Send WhatsApp notification when delivered
 * Triggered by Shiprocket webhook (status change to DELIVERED)
 */
exports.sendDeliveredMessage = async (orderId) => {
  try {
    const order = await Order.findOne({ orderId });
    if (!order) throw new Error(`Order not found: ${orderId}`);

    const phone = order.guestDetails?.phone || order.shippingAddress?.phone;
    if (!phone) throw new Error(`No phone for order: ${orderId}`);

    if (order.isNotificationSent?.delivered) {
      console.log('⏭️ Delivery notification already sent for:', orderId);
      return { success: false, reason: 'already_sent' };
    }

    const message = `✅ *Your order has been delivered!*

Thank you for shopping with *Shriyash Foods* ❤️

🎁 *Get 10% off your next order!*
Use code: WELCOME10

Questions? We're here to help!
Reply to this message anytime.`;

    await sendWhatsAppMessage(phone, message, 'delivered', orderId);

    // Mark as sent
    await Order.findOneAndUpdate({ orderId }, { 'isNotificationSent.delivered': true });

    console.log('✅ Delivery notification sent:', { orderId, phone });
    return { success: true, orderId, phone };
  } catch (error) {
    console.error('❌ Error sending delivery notification:', error.message);
    throw error;
  }
};

/**
 * Send WhatsApp notification for cancellation/RTO
 */
exports.sendCancelledMessage = async (orderId, reason = 'Order cancelled') => {
  try {
    const order = await Order.findOne({ orderId });
    if (!order) throw new Error(`Order not found: ${orderId}`);

    const phone = order.guestDetails?.phone || order.shippingAddress?.phone;
    if (!phone) throw new Error(`No phone for order: ${orderId}`);

    const message = `❌ *Your order has been ${reason.toLowerCase()}*

*Order ID:* ${orderId}

${order.paymentStatus === 'PAID' ? `💰 *Refund Status:* Processing
Your refund will be credited within 5-7 business days.` : ''}

If you have any questions, please contact us:
📞 Customer Support: +91-XXXXXX
📧 Email: support@shriyashfoods.com`;

    await sendWhatsAppMessage(phone, message, 'cancelled', orderId);

    console.log('✅ Cancellation notification sent:', { orderId, phone, reason });
    return { success: true, orderId, phone };
  } catch (error) {
    console.error('❌ Error sending cancellation notification:', error.message);
    throw error;
  }
};

/**
 * Core function to send WhatsApp message
 * Integrates with WasenderAPI
 */
async function sendWhatsAppMessage(phone, message, messageType, orderId) {
  try {
    // Format phone number (remove +, add country code if needed)
    let formattedPhone = phone.replace(/[^0-9]/g, '');
    if (!formattedPhone.startsWith('91')) {
      formattedPhone = '91' + formattedPhone.slice(-10);
    }

    const wasenderConfig = {
      method: 'post',
      url: `${process.env.WASENDER_API_URL || 'https://www.wasenderapi.com'}/api/send-message`,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: {
        api_key: process.env.WASENDER_API_KEY,
        phone: formattedPhone,
        message: message,
        source: 'ShriyashFoods'
      }
    };

    console.log('📤 Sending WhatsApp message:', { phone: formattedPhone, messageType });

    const response = await axios(wasenderConfig);

    if (response.data.success || response.status === 200) {
      console.log('✅ WhatsApp message sent successfully:', response.data);

      // Log to database
      await logNotification({
        orderId,
        phone,
        messageType,
        status: 'sent',
        response: response.data
      });

      return { success: true, data: response.data };
    } else {
      throw new Error(`WhatsApp API error: ${response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ WhatsApp send error:', error.message);

    // Log failed attempt
    await logNotification({
      orderId,
      phone,
      messageType,
      status: 'failed',
      error: error.message
    }).catch(err => console.error('Failed to log notification:', err));

    // Retry logic would go here in production
    throw error;
  }
}

/**
 * Log notification attempts to database
 * Useful for debugging and retry logic
 */
async function logNotification({ orderId, phone, messageType, status, response, error }) {
  try {
    // If you create a WhatsAppNotification model, insert here
    // For now, we're storing directly in Order model
    console.log(`📋 [${status.toUpperCase()}] ${messageType} to ${phone} for ${orderId}`);
  } catch (err) {
    console.error('Failed to log notification:', err);
  }
}

/**
 * Resend failed notifications (for admin/manual triggers)
 */
exports.resendNotification = async (orderId, messageType) => {
  try {
    const order = await Order.findOne({ orderId });
    if (!order) throw new Error(`Order not found: ${orderId}`);

    switch (messageType) {
      case 'order_confirmation':
        return await exports.sendOrderConfirmation(orderId);
      case 'shipment_created':
        return await exports.sendShipmentCreated(orderId);
      case 'out_for_delivery':
        return await exports.sendOutForDelivery(orderId);
      case 'delivered':
        return await exports.sendDeliveredMessage(orderId);
      case 'cancelled':
        return await exports.sendCancelledMessage(orderId);
      default:
        throw new Error(`Unknown message type: ${messageType}`);
    }
  } catch (error) {
    console.error('❌ Error resending notification:', error.message);
    throw error;
  }
};

/**
 * Test WhatsApp sending (for development)
 */
exports.testWhatsAppMessage = async (phone, messageType = 'order_confirmation') => {
  try {
    const testOrder = 'TEST-' + Date.now();
    
    const testMessages = {
      order_confirmation: `🎉 *TEST MESSAGE - Order Confirmation*\n\nOrder ID: ${testOrder}\nAmount: ₹999\nThis is a test message from Shriyash Foods.\n\nReply STOP to unsubscribe.`,
      shipment_created: `🚚 *TEST MESSAGE - Shipment Created*\n\nYour order is on the way!\nTracking: ${testOrder}\n\nReply with questions!`,
      out_for_delivery: `📦 *TEST MESSAGE - Out For Delivery*\n\nYour order arrives today!\nOrder: ${testOrder}\n\nKeep your phone available.`,
      delivered: `✅ *TEST MESSAGE - Delivered*\n\nYour order arrived safely!\nThank you for choosing Shriyash Foods ❤️`,
      cancelled: `❌ *TEST MESSAGE - Order Cancelled*\n\nOrder: ${testOrder}\n\nRefund processing soon.`
    };

    const message = testMessages[messageType] || testMessages.order_confirmation;
    
    return await sendWhatsAppMessage(phone, message, messageType, testOrder);
  } catch (error) {
    console.error('❌ Test message failed:', error.message);
    throw error;
  }
};

module.exports = exports;
