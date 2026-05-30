const Order = require('../models/Order');

const getClientInfo = (req = {}) => ({
  ip: req.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
    || req.socket?.remoteAddress
    || req.ip
    || null,
  userAgent: req.headers?.['user-agent'] || null,
  sessionId: req.headers?.['x-session-id'] || null
});

const buildActivityEntry = (action, metadata = {}, req = {}) => ({
  action,
  timestamp: new Date(),
  metadata,
  ...getClientInfo(req)
});

const logUserActivity = async (user, action, metadata = {}, req = {}) => {
  if (!user) return user;

  user.activityLog = user.activityLog || [];
  user.activityLog.push(buildActivityEntry(action, metadata, req));
  user.lastSeenAt = new Date();

  if (!user.stats) {
    user.stats = {
      totalCartActions: 0,
      totalOrders: 0,
      totalLogins: 0,
      lastActivityAt: null
    };
  }

  user.stats.lastActivityAt = new Date();

  if (action.startsWith('CART_')) {
    user.stats.totalCartActions = (user.stats.totalCartActions || 0) + 1;
  }
  if (action === 'ORDER_PLACED') {
    user.stats.totalOrders = (user.stats.totalOrders || 0) + 1;
  }
  if (action === 'LOGIN' || action === 'REGISTER') {
    user.stats.totalLogins = (user.stats.totalLogins || 0) + 1;
  }

  if (!user.firstSeenAt) {
    user.firstSeenAt = new Date();
  }

  await user.save();
  return user;
};

const logCartActivity = (cart, action, details = {}, req = {}, customerType = 'guest') => {
  cart.activityLog = cart.activityLog || [];
  cart.activityLog.push({
    action,
    timestamp: new Date(),
    customerType,
    userId: cart.user || null,
    sessionId: cart.sessionId || req.headers?.['x-session-id'] || null,
    productId: details.productId || null,
    productName: details.productName || null,
    variant: details.variant || null,
    quantity: details.quantity ?? null,
    previousQuantity: details.previousQuantity ?? null,
    price: details.price ?? null,
    itemCountAfter: details.itemCountAfter ?? null,
    ...getClientInfo(req)
  });

  cart.customerType = customerType;
  cart.itemCount = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  cart.totalValue = cart.items.reduce(
    (sum, item) => sum + ((item.price || 0) * (item.quantity || 0)),
    0
  );
  cart.lastActivityAt = new Date();
};

const appendOrderLog = async (orderRef, event, details = {}, source = 'system') => {
  const query = typeof orderRef === 'string'
    ? { orderId: orderRef }
    : { _id: orderRef._id || orderRef };

  return Order.findOneAndUpdate(
    query,
    {
      $push: {
        orderLog: {
          event,
          timestamp: new Date(),
          details,
          source
        }
      }
    },
    { new: true }
  );
};

const appendPaymentLog = async (orderRef, entry) => {
  const query = typeof orderRef === 'string'
    ? { orderId: orderRef }
    : { _id: orderRef._id || orderRef };

  return Order.findOneAndUpdate(
    query,
    {
      $push: {
        paymentLog: {
          ...entry,
          timestamp: entry.timestamp || new Date()
        }
      }
    },
    { new: true }
  );
};

const appendShippingLog = async (orderRef, entry) => {
  const query = typeof orderRef === 'string'
    ? { orderId: orderRef }
    : { _id: orderRef._id || orderRef };

  return Order.findOneAndUpdate(
    query,
    {
      $push: {
        shippingLog: {
          ...entry,
          timestamp: entry.timestamp || new Date()
        }
      }
    },
    { new: true }
  );
};

module.exports = {
  getClientInfo,
  buildActivityEntry,
  logUserActivity,
  logCartActivity,
  appendOrderLog,
  appendPaymentLog,
  appendShippingLog
};
