const axios = require('axios');
const Order = require('../models/Order');
const { sendEmail, isEmailConfigured } = require('./email.service');
const { appendOrderLog } = require('../utils/activityLogger');

const getClientUrl = () => (
  process.env.CLIENT_URL || 'https://www.shriyashfoods.com'
).replace(/\/$/, '');

const getTrackingUrl = (orderId) => `${getClientUrl()}/track/${orderId}`;

const getOrdersPageUrl = () => `${getClientUrl()}/orders`;

const formatPhoneForWhatsApp = (phone) => {
  const digits = String(phone).replace(/\D/g, '');
  return digits.startsWith('91') ? `+${digits}` : `+91${digits.slice(-10)}`;
};

const getOrderContact = (order) => ({
  phone: order.shippingAddress?.phone || order.guestDetails?.phone,
  email: order.shippingAddress?.email || order.guestDetails?.email,
  name: order.shippingAddress?.fullName || order.guestDetails?.name || 'Customer'
});

const buildItemsListText = (order) => order.items.map((item, i) => {
  const lineTotal = item.lineTotal ?? (item.price * item.quantity);
  return `${i + 1}. ${item.name} (${item.variant})\n   Qty: ${item.quantity} × ₹${item.price} = ₹${lineTotal}`;
}).join('\n');

const buildWhatsAppMessage = (order) => {
  const { name } = getOrderContact(order);
  const trackingUrl = order.trackingUrl || getTrackingUrl(order.orderId);
  const invoiceLine = order.invoiceUrl
    ? `\n📄 *Invoice/Bill:*\n${order.invoiceUrl}`
    : '';

  const paymentLabel = order.paymentStatus === 'PAID'
    ? '✅ Paid'
    : order.paymentMethod === 'COD'
      ? '💵 Cash on Delivery'
      : order.paymentStatus;

  return `🎉 *Shriyash Foods — Order Confirmed*

Hello ${name}!

*Order ID:* ${order.orderId}
*Date:* ${new Date(order.placedAt || order.createdAt).toLocaleDateString('en-IN')}
*Status:* ${order.orderStatus}
*Payment:* ${order.paymentMethod} (${paymentLabel})

📦 *Order Details:*
${buildItemsListText(order)}

💰 *Bill Summary:*
Subtotal: ₹${order.pricing?.subtotal}
Shipping: ₹${order.pricing?.shipping}
${order.pricing?.discount ? `Discount: -₹${order.pricing.discount}\n` : ''}*Total: ₹${order.pricing?.total}*

📍 *Delivery Address:*
${order.shippingAddress.fullName}
${order.shippingAddress.addressLine1}
${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '\n' : ''}${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
Phone: ${order.shippingAddress.phone}

🔗 *Track Order:*
${trackingUrl}
${invoiceLine}

View all orders: ${getOrdersPageUrl()}

Thank you for shopping with *Shriyash Foods* ❤️`;
};

const buildEmailHtml = (order) => {
  const { name, email } = getOrderContact(order);
  const trackingUrl = order.trackingUrl || getTrackingUrl(order.orderId);

  const itemRows = order.items.map((item) => {
    const lineTotal = item.lineTotal ?? (item.price * item.quantity);
    return `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #eee;">${item.name}<br><small style="color:#666;">${item.variant}</small></td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">₹${item.price}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">₹${lineTotal}</td>
      </tr>`;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:#2d5a1e;color:white;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
    <h1 style="margin:0;font-size:22px;">Shriyash Foods</h1>
    <p style="margin:8px 0 0;opacity:0.9;">Order Confirmation</p>
  </div>
  <div style="background:#f9f9f9;padding:24px;border:1px solid #e0e0e0;border-top:none;">
    <p>Hello <strong>${name}</strong>,</p>
    <p>Thank you for your order! Here are your order details and bill.</p>

    <table style="width:100%;margin:16px 0;background:white;border-radius:8px;border-collapse:collapse;">
      <tr><td style="padding:12px;"><strong>Order ID</strong></td><td style="padding:12px;">${order.orderId}</td></tr>
      <tr><td style="padding:12px;border-top:1px solid #eee;"><strong>Status</strong></td><td style="padding:12px;border-top:1px solid #eee;">${order.orderStatus}</td></tr>
      <tr><td style="padding:12px;border-top:1px solid #eee;"><strong>Payment</strong></td><td style="padding:12px;border-top:1px solid #eee;">${order.paymentMethod} — ${order.paymentStatus}</td></tr>
    </table>

    <h3 style="color:#2d5a1e;margin-top:24px;">Order Items</h3>
    <table style="width:100%;border-collapse:collapse;background:white;">
      <thead>
        <tr style="background:#2d5a1e;color:white;">
          <th style="padding:10px;text-align:left;">Product</th>
          <th style="padding:10px;">Qty</th>
          <th style="padding:10px;text-align:right;">Price</th>
          <th style="padding:10px;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <table style="width:100%;margin-top:16px;background:white;padding:12px;">
      <tr><td>Subtotal</td><td style="text-align:right;">₹${order.pricing?.subtotal}</td></tr>
      <tr><td>Shipping</td><td style="text-align:right;">₹${order.pricing?.shipping}</td></tr>
      ${order.pricing?.discount ? `<tr><td>Discount</td><td style="text-align:right;">-₹${order.pricing.discount}</td></tr>` : ''}
      <tr style="font-weight:bold;font-size:18px;"><td>Total</td><td style="text-align:right;color:#2d5a1e;">₹${order.pricing?.total}</td></tr>
    </table>

    <h3 style="color:#2d5a1e;margin-top:24px;">Delivery Address</h3>
    <p style="background:white;padding:12px;border-radius:8px;margin:0;">
      ${order.shippingAddress.fullName}<br>
      ${order.shippingAddress.addressLine1}<br>
      ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
      ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
      Phone: ${order.shippingAddress.phone}
    </p>

    <div style="text-align:center;margin-top:28px;">
      <a href="${trackingUrl}" style="display:inline-block;background:#2d5a1e;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;">Track Your Order</a>
    </div>
    ${order.invoiceUrl ? `<p style="text-align:center;margin-top:12px;"><a href="${order.invoiceUrl}">Download Invoice</a></p>` : ''}
    <p style="text-align:center;margin-top:16px;font-size:13px;color:#666;">
      <a href="${getOrdersPageUrl()}">View all my orders</a>
    </p>
  </div>
  <p style="text-align:center;font-size:12px;color:#999;margin-top:16px;">© Shriyash Foods — Pure by Nature</p>
</body>
</html>`;
};

const sendWhatsAppOrderMessage = async (phone, message) => {
  const apiKey = process.env.WASENDER_API_KEY;
  const baseUrl = process.env.WASENDER_API_URL || 'https://www.wasenderapi.com';

  if (!apiKey) {
    console.warn('WasenderAPI key not configured — skipping WhatsApp');
    return { success: false, skipped: true, reason: 'not_configured' };
  }

  const response = await axios.post(
    `${baseUrl.replace(/\/$/, '')}/api/send-message`,
    {
      to: formatPhoneForWhatsApp(phone),
      text: message
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (response.data?.success === false) {
    throw new Error(response.data?.message || 'WhatsApp API rejected message');
  }

  return { success: true };
};

const sendShipmentUpdateWhatsApp = async (order) => {
  const { phone, name } = getOrderContact(order);
  if (!phone) return;

  const trackingUrl = order.trackingUrl || getTrackingUrl(order.orderId);
  const message = `🚚 *Shriyash Foods — Shipping Update*

Hello ${name}!

*Order ID:* ${order.orderId}
*Status:* ${order.shippingStatus || order.orderStatus}
${order.courierName ? `*Courier:* ${order.courierName}` : ''}
${order.awbCode ? `*AWB:* ${order.awbCode}` : ''}

🔗 *Track your order:*
${trackingUrl}
${order.invoiceUrl ? `\n📄 *Invoice:* ${order.invoiceUrl}` : ''}

Thank you — Shriyash Foods`;

  return sendWhatsAppOrderMessage(phone, message);
};

const sendShipmentUpdateEmail = async (order) => {
  const { email, name } = getOrderContact(order);
  if (!email || !isEmailConfigured()) return { skipped: true };

  const trackingUrl = order.trackingUrl || getTrackingUrl(order.orderId);

  return sendEmail({
    to: email,
    subject: `Shriyash Foods — Your order ${order.orderId} is on the way`,
    html: `
      <p>Hello ${name},</p>
      <p>Your order <strong>${order.orderId}</strong> has been shipped.</p>
      <p><strong>Status:</strong> ${order.shippingStatus || order.orderStatus}</p>
      ${order.awbCode ? `<p><strong>AWB:</strong> ${order.awbCode}</p>` : ''}
      ${order.courierName ? `<p><strong>Courier:</strong> ${order.courierName}</p>` : ''}
      <p><a href="${trackingUrl}">Track your order here</a></p>
      ${order.invoiceUrl ? `<p><a href="${order.invoiceUrl}">Download invoice</a></p>` : ''}
    `,
    text: `Order ${order.orderId} shipped. Track: ${trackingUrl}`
  });
};

const hasNotificationBeenSent = (order, event) => (
  order.orderLog?.some((log) => log.event === event)
);

const sendOrderConfirmationNotifications = async (orderId) => {
  try {
    const order = await Order.findOne({ orderId }).populate('user');
    if (!order) {
      console.error('Order not found for notifications:', orderId);
      return;
    }

    if (hasNotificationBeenSent(order, 'ORDER_NOTIFICATION_SENT')) {
      console.log('Order notifications already sent:', orderId);
      return;
    }

    const { phone, email, name } = getOrderContact(order);
    const whatsappMessage = buildWhatsAppMessage(order);
    const results = { whatsapp: null, email: null };

    if (phone) {
      try {
        results.whatsapp = await sendWhatsAppOrderMessage(phone, whatsappMessage);
        console.log('✅ Order WhatsApp sent:', orderId, phone);
      } catch (err) {
        console.error('❌ Order WhatsApp failed:', orderId, err.message);
        results.whatsapp = { success: false, error: err.message };
      }
    }

    if (email) {
      try {
        results.email = await sendEmail({
          to: email,
          subject: `Shriyash Foods — Order Confirmed #${order.orderId}`,
          html: buildEmailHtml(order),
          text: buildWhatsAppMessage(order)
        });
        if (results.email?.success) {
          console.log('✅ Order email sent:', orderId, email);
        }
      } catch (err) {
        console.error('❌ Order email failed:', orderId, err.message);
        results.email = { success: false, error: err.message };
      }
    } else if (!isEmailConfigured()) {
      results.email = { skipped: true, reason: 'no_email_or_not_configured' };
    }

    await appendOrderLog(orderId, 'ORDER_NOTIFICATION_SENT', {
      phone,
      email: email || null,
      name,
      whatsapp: results.whatsapp,
      emailResult: results.email
    }, 'notification');

    return results;
  } catch (error) {
    console.error('Order notification error:', error.message);
  }
};

const sendShipmentNotifications = async (orderId) => {
  try {
    const order = await Order.findOne({ orderId });
    if (!order) return;

    if (hasNotificationBeenSent(order, 'SHIPMENT_NOTIFICATION_SENT')) {
      return;
    }

    const results = {};
    const { phone, email } = getOrderContact(order);

    if (phone) {
      try {
        results.whatsapp = await sendShipmentUpdateWhatsApp(order);
      } catch (err) {
        results.whatsapp = { success: false, error: err.message };
      }
    }

    if (email) {
      try {
        results.email = await sendShipmentUpdateEmail(order);
      } catch (err) {
        results.email = { success: false, error: err.message };
      }
    }

    await appendOrderLog(orderId, 'SHIPMENT_NOTIFICATION_SENT', results, 'notification');
  } catch (error) {
    console.error('Shipment notification error:', error.message);
  }
};

module.exports = {
  sendOrderConfirmationNotifications,
  sendShipmentNotifications,
  buildWhatsAppMessage,
  getTrackingUrl
};
