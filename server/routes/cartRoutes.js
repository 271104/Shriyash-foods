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
    
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
