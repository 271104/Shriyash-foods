const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { optional } = require('../middleware/auth');
const { logCartActivity, logUserActivity } = require('../utils/activityLogger');
const { findOrCreateGuestUser } = require('../utils/guestUserService');

const getCustomerContext = async (req) => {
  if (req.user) {
    return {
      customerType: 'registered',
      user: req.user,
      guestUser: null,
      sessionId: req.headers['x-session-id'] || null
    };
  }

  const sessionId = req.headers['x-session-id'];
  const guestUser = await findOrCreateGuestUser(sessionId, req);

  return {
    customerType: 'guest',
    user: null,
    guestUser,
    sessionId
  };
};

const findCartForRequest = async (req, customerType, user, sessionId) => {
  if (user) {
    return Cart.findOne({ user: user._id });
  }
  if (sessionId) {
    return Cart.findOne({ sessionId });
  }
  return null;
};

const createCartForRequest = (customerType, user, guestUser, sessionId) => {
  const cart = new Cart({
    items: [],
    customerType,
    activityLog: [],
    itemCount: 0,
    totalValue: 0
  });

  if (user) {
    cart.user = user._id;
  } else {
    cart.sessionId = sessionId;
    cart.guestUser = guestUser?._id;
  }

  return cart;
};

// @route   GET /api/cart
router.get('/', optional, async (req, res) => {
  try {
    const { customerType, user, guestUser, sessionId } = await getCustomerContext(req);
    let cart = await findCartForRequest(req, customerType, user, sessionId);

    if (!cart) {
      return res.json({ success: true, cart: { items: [], customerType } });
    }

    logCartActivity(cart, 'VIEW', { itemCountAfter: cart.items.length }, req, customerType);
    await cart.save();
    await cart.populate('items.product');

    if (user) {
      await logUserActivity(user, 'CART_VIEW', { itemCount: cart.itemCount }, req);
    } else if (guestUser) {
      await logUserActivity(guestUser, 'CART_VIEW', { itemCount: cart.itemCount }, req);
    }

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/cart/add
router.post('/add', optional, async (req, res) => {
  try {
    const { productId, variant, quantity } = req.body;
    console.log('🛒 [CART] POST /add request received:', { productId, variant, quantity });
    
    const { customerType, user, guestUser, sessionId } = await getCustomerContext(req);
    console.log('🛒 [CART] Customer context:', { customerType, sessionId, userId: user?._id });

    const product = await Product.findById(productId);
    if (!product) {
      console.error('🛒 [CART] Product not found:', productId);
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    console.log('🛒 [CART] Product found:', { name: product.name, variants: product.variants.length });
    console.log('🛒 [CART] Product variants:', product.variants.map(v => ({ weight: v.weight, price: v.price })));

    const variantData = product.variants.find((v) => v.weight === variant);
    console.log('🛒 [CART] Looking for variant:', { looking: variant, found: !!variantData });
    if (!variantData) {
      console.error('🛒 [CART] Invalid variant:', { requested: variant, available: product.variants.map(v => v.weight) });
      return res.status(400).json({ success: false, message: 'Invalid variant' });
    }

    if (customerType === 'guest' && !sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID required for guest users' });
    }

    let cart = await findCartForRequest(req, customerType, user, sessionId);
    if (!cart) {
      cart = createCartForRequest(customerType, user, guestUser, sessionId);
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId && item.variant === variant
    );

    const previousQuantity = existingItem?.quantity || 0;

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.lastUpdatedAt = new Date();
    } else {
      cart.items.push({
        product: productId,
        variant,
        quantity,
        price: variantData.price,
        addedAt: new Date(),
        lastUpdatedAt: new Date()
      });
    }

    logCartActivity(
      cart,
      'ADD',
      {
        productId,
        productName: product.name,
        variant,
        quantity,
        previousQuantity,
        price: variantData.price,
        itemCountAfter: cart.items.reduce((sum, item) => sum + item.quantity, 0)
      },
      req,
      customerType
    );

    await cart.save();
    await cart.populate('items.product');

    const activityMeta = {
      productId,
      productName: product.name,
      variant,
      quantity,
      cartItemCount: cart.itemCount,
      cartTotalValue: cart.totalValue
    };

    if (user) {
      await logUserActivity(user, 'CART_ADD', activityMeta, req);
    } else if (guestUser) {
      await logUserActivity(guestUser, 'CART_ADD', activityMeta, req);
    }

    res.json({ success: true, cart });
  } catch (error) {
    console.error('🛒 [CART] Add to cart error:', {
      message: error.message,
      stack: error.stack,
      received: { productId: req.body.productId, variant: req.body.variant, quantity: req.body.quantity }
    });
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/cart/update/:itemId
router.put('/update/:itemId', optional, async (req, res) => {
  try {
    const { quantity } = req.body;
    const { customerType, user, guestUser, sessionId } = await getCustomerContext(req);
    const cart = await findCartForRequest(req, customerType, user, sessionId);

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find((entry) => entry._id.toString() === req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    const previousQuantity = item.quantity;
    item.quantity = quantity;
    item.lastUpdatedAt = new Date();

    const product = await Product.findById(item.product);

    logCartActivity(
      cart,
      'UPDATE',
      {
        productId: item.product,
        productName: product?.name,
        variant: item.variant,
        quantity,
        previousQuantity,
        price: item.price,
        itemCountAfter: cart.items.reduce((sum, entry) => sum + entry.quantity, 0)
      },
      req,
      customerType
    );

    await cart.save();
    await cart.populate('items.product');

    const activityMeta = {
      productId: item.product,
      productName: product?.name,
      variant: item.variant,
      quantity,
      previousQuantity
    };

    if (user) {
      await logUserActivity(user, 'CART_UPDATE', activityMeta, req);
    } else if (guestUser) {
      await logUserActivity(guestUser, 'CART_UPDATE', activityMeta, req);
    }

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/cart/remove/:itemId
router.delete('/remove/:itemId', optional, async (req, res) => {
  try {
    const { customerType, user, guestUser, sessionId } = await getCustomerContext(req);
    const cart = await findCartForRequest(req, customerType, user, sessionId);

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find((entry) => entry._id.toString() === req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    const product = await Product.findById(item.product);

    logCartActivity(
      cart,
      'REMOVE',
      {
        productId: item.product,
        productName: product?.name,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price,
        itemCountAfter: cart.items.length - 1
      },
      req,
      customerType
    );

    cart.items = cart.items.filter((entry) => entry._id.toString() !== req.params.itemId);
    cart.itemCount = cart.items.reduce((sum, entry) => sum + entry.quantity, 0);
    cart.totalValue = cart.items.reduce(
      (sum, entry) => sum + ((entry.price || 0) * (entry.quantity || 0)),
      0
    );
    cart.lastActivityAt = new Date();

    await cart.save();
    await cart.populate('items.product');

    const activityMeta = {
      productId: item.product,
      productName: product?.name,
      variant: item.variant,
      quantity: item.quantity
    };

    if (user) {
      await logUserActivity(user, 'CART_REMOVE', activityMeta, req);
    } else if (guestUser) {
      await logUserActivity(guestUser, 'CART_REMOVE', activityMeta, req);
    }

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/cart/clear
router.delete('/clear', optional, async (req, res) => {
  try {
    const { customerType, user, guestUser, sessionId } = await getCustomerContext(req);
    const cart = await findCartForRequest(req, customerType, user, sessionId);

    if (cart) {
      logCartActivity(
        cart,
        'CLEAR',
        {
          itemCountAfter: 0,
          note: `Cleared ${cart.items.length} item types`
        },
        req,
        customerType
      );
      cart.items = [];
      cart.itemCount = 0;
      cart.totalValue = 0;
      await cart.save();

      if (user) {
        await logUserActivity(user, 'CART_CLEAR', {}, req);
      } else if (guestUser) {
        await logUserActivity(guestUser, 'CART_CLEAR', {}, req);
      }
    }

    res.json({ success: true, cart: { items: [] } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/cart/merge-guest
router.post('/merge-guest', optional, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID required' });
    }

    const guestCart = await Cart.findOne({ sessionId });
    if (!guestCart || guestCart.items.length === 0) {
      let userCart = await Cart.findOne({ user: req.user._id }).populate('items.product');
      if (!userCart) {
        userCart = { items: [] };
      }
      return res.json({ success: true, cart: userCart });
    }

    let userCart = await Cart.findOne({ user: req.user._id });
    if (!userCart) {
      userCart = createCartForRequest('registered', req.user, null, null);
    }

    for (const guestItem of guestCart.items) {
      const existingItem = userCart.items.find(
        (item) => item.product.toString() === guestItem.product.toString()
          && item.variant === guestItem.variant
      );

      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
        existingItem.lastUpdatedAt = new Date();
      } else {
        userCart.items.push({
          product: guestItem.product,
          variant: guestItem.variant,
          quantity: guestItem.quantity,
          price: guestItem.price,
          addedAt: guestItem.addedAt || new Date(),
          lastUpdatedAt: new Date()
        });
      }
    }

    logCartActivity(
      userCart,
      'MERGE',
      {
        note: `Merged ${guestCart.items.length} guest items into registered cart`,
        itemCountAfter: userCart.items.reduce((sum, item) => sum + item.quantity, 0)
      },
      req,
      'registered'
    );

    await userCart.save();
    await userCart.populate('items.product');

    logCartActivity(
      guestCart,
      'MERGE',
      {
        note: `Guest cart merged into user ${req.user._id}`,
        itemCountAfter: 0
      },
      req,
      'guest'
    );
    await guestCart.save();

    await logUserActivity(req.user, 'CART_MERGE', {
      sessionId,
      mergedItemTypes: guestCart.items.length,
      cartItemCount: userCart.itemCount
    }, req);

    await Cart.deleteOne({ sessionId });

    res.json({ success: true, cart: userCart });
  } catch (error) {
    console.error('Merge guest cart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
