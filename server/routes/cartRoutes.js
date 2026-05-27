const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { optional } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get cart
router.get('/', optional, async (req, res) => {
  try {
    let cart;
    
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    } else {
      const sessionId = req.headers['x-session-id'];
      if (!sessionId) {
        return res.json({ success: true, cart: { items: [] } });
      }
      cart = await Cart.findOne({ sessionId }).populate('items.product');
    }
    
    if (!cart) {
      return res.json({ success: true, cart: { items: [] } });
    }
    
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
router.post('/add', optional, async (req, res) => {
  try {
    const { productId, variant, quantity } = req.body;
    

    
    const product = await Product.findById(productId);
    if (!product) {

      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    const variantData = product.variants.find(v => v.weight === variant);
    if (!variantData) {

      return res.status(400).json({ success: false, message: 'Invalid variant' });
    }
    
    let cart;
    
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        cart = new Cart({ user: req.user._id, items: [] });
      }
    } else {
      const sessionId = req.headers['x-session-id'];
      if (!sessionId) {

        return res.status(400).json({ success: false, message: 'Session ID required for guest users' });
      }
      cart = await Cart.findOne({ sessionId });
      if (!cart) {
        cart = new Cart({ sessionId, items: [] });
      }
    }
    
    const existingItem = cart.items.find(
      item => item.product.toString() === productId && item.variant === variant
    );
    
    if (existingItem) {
      existingItem.quantity += quantity;

    } else {
      cart.items.push({
        product: productId,
        variant,
        quantity,
        price: variantData.price
      });

    }
    
    await cart.save();
    await cart.populate('items.product');
    

    res.json({ success: true, cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/cart/update/:itemId
// @desc    Update cart item quantity
router.put('/update/:itemId', optional, async (req, res) => {
  try {
    const { quantity } = req.body;
    let cart;
    
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else {
      const sessionId = req.headers['x-session-id'];
      cart = await Cart.findOne({ sessionId });
    }
    
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    
    const item = cart.items.find(item => item._id.toString() === req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }
    
    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');
    
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/cart/remove/:itemId
// @desc    Remove item from cart
router.delete('/remove/:itemId', optional, async (req, res) => {
  try {
    let cart;
    
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else {
      const sessionId = req.headers['x-session-id'];
      cart = await Cart.findOne({ sessionId });
    }
    
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    await cart.save();
    await cart.populate('items.product');
    
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear cart
router.delete('/clear', optional, async (req, res) => {
  try {
    let cart;
    
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else {
      const sessionId = req.headers['x-session-id'];
      cart = await Cart.findOne({ sessionId });
    }
    
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    
    res.json({ success: true, cart: { items: [] } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/cart/merge-guest
// @desc    Merge guest cart with user cart after authentication
router.post('/merge-guest', optional, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID required' });
    }
    
    // Find guest cart
    const guestCart = await Cart.findOne({ sessionId });
    if (!guestCart || guestCart.items.length === 0) {
      // No guest cart to merge, just return user's existing cart
      let userCart = await Cart.findOne({ user: req.user._id }).populate('items.product');
      if (!userCart) {
        userCart = { items: [] };
      }
      return res.json({ success: true, cart: userCart });
    }
    
    // Find or create user cart
    let userCart = await Cart.findOne({ user: req.user._id });
    if (!userCart) {
      userCart = new Cart({ user: req.user._id, items: [] });
    }
    
    // Merge guest cart items into user cart
    for (const guestItem of guestCart.items) {
      const existingItem = userCart.items.find(
        item => item.product.toString() === guestItem.product.toString() && 
                item.variant === guestItem.variant
      );
      
      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
      } else {
        userCart.items.push({
          product: guestItem.product,
          variant: guestItem.variant,
          quantity: guestItem.quantity,
          price: guestItem.price
        });
      }
    }
    
    await userCart.save();
    await userCart.populate('items.product');
    
    // Delete guest cart
    await Cart.deleteOne({ sessionId });
    
    res.json({ success: true, cart: userCart });
  } catch (error) {
    console.error('Merge guest cart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
