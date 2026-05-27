const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

const fallbackProducts = [
  {
    _id: 'tomato-powder',
    name: 'Tomato Powder',
    slug: 'tomato-powder',
    description: 'Premium tomato powder rich in lycopene and antioxidants. Perfect for cooking, sauces, and adding authentic tomato flavor to dishes.',
    category: 'powder',
    variants: [{ weight: '100g', price: 199, mrp: 249, stock: 100, sku: 'TOM-100' }],
    images: [{ url: '/tomato-removebg-preview.png' }],
    benefits: ['Rich in lycopene', 'Powerful antioxidant', 'Supports heart health'],
    usage: 'Use in curries, soups, sauces, and gravies.',
    shelfLife: '18 months from manufacturing',
    isActive: true
  },
  {
    _id: 'beetroot-powder',
    name: 'Beetroot Powder',
    slug: 'beetroot-powder',
    description: 'Natural beetroot powder for healthy blood circulation and stamina. Rich in iron and nitrates.',
    category: 'powder',
    variants: [{ weight: '100g', price: 199, mrp: 249, stock: 100, sku: 'BEE-100' }],
    images: [{ url: '/beetroot-removebg-preview.png' }],
    benefits: ['Improves blood circulation', 'Boosts stamina', 'Rich in iron'],
    usage: 'Add 1-2 teaspoons to smoothies, juices, or mix with water.',
    shelfLife: '12 months from manufacturing',
    isActive: true
  },
  {
    _id: 'banana-powder',
    name: 'Banana Powder',
    slug: 'banana-powder',
    description: 'Natural banana powder rich in potassium and energy. Perfect for smoothies, baby food, and drinks.',
    category: 'powder',
    variants: [{ weight: '100g', price: 199, mrp: 249, stock: 100, sku: 'BAN-100' }],
    images: [{ url: '/banana-removebg-preview.png' }],
    benefits: ['Rich in potassium', 'Instant energy source', 'Natural sweetener'],
    usage: 'Mix with milk, water, or add to smoothies.',
    shelfLife: '12 months from manufacturing',
    isActive: true
  },
  {
    _id: 'moringa-powder',
    name: 'Moringa Powder',
    slug: 'moringa-powder',
    description: 'Pure moringa powder packed with vitamins, minerals, and antioxidants for daily wellness.',
    category: 'powder',
    variants: [{ weight: '100g', price: 249, mrp: 299, stock: 100, sku: 'MOR-100' }],
    images: [{ url: '/moringa-removebg-preview.png' }],
    benefits: ['Boosts immunity naturally', 'Rich in antioxidants', 'Improves digestion'],
    usage: 'Mix 1 teaspoon with water, juice, or smoothies.',
    shelfLife: '12 months from manufacturing',
    isActive: true
  },
  {
    _id: 'onion-powder',
    name: 'Onion Powder',
    slug: 'onion-powder',
    description: 'Premium onion powder for cooking, seasoning, marinades, soups, and authentic flavor.',
    category: 'powder',
    variants: [{ weight: '100g', price: 10, mrp: 249, stock: 100, sku: 'ONI-100' }],
    images: [{ url: '/onion-removebg-preview.png' }],
    benefits: ['Rich in antioxidants', 'Supports immune system', 'Adds authentic flavor'],
    usage: 'Use in curries, soups, marinades, and seasoning.',
    shelfLife: '18 months from manufacturing',
    isActive: true
  },
  {
    _id: 'abc-powder',
    name: 'ABC Powder',
    slug: 'abc-powder',
    description: 'Amla, Beetroot, and Carrot powder blend crafted for everyday nourishment and wellness.',
    category: 'powder',
    variants: [{ weight: '100g', price: 249, mrp: 299, stock: 100, sku: 'ABC-100' }],
    images: [{ url: '/abc-removebg-preview.png' }],
    benefits: ['Triple power blend', 'Boosts immunity naturally', 'Rich in antioxidants'],
    usage: 'Mix 1-2 teaspoons with water, juice, or smoothies.',
    shelfLife: '12 months from manufacturing',
    isActive: true
  }
];

// @route   GET /api/products
// @desc    Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    res.json({ success: true, products: products.length ? products : fallbackProducts });
  } catch (error) {
    res.json({ success: true, products: fallbackProducts, source: 'fallback' });
  }
});

// @route   GET /api/products/:slug
// @desc    Get single product
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('reviews.user', 'name');
    
    if (!product) {
      const fallbackProduct = fallbackProducts.find(item => item.slug === req.params.slug);
      if (fallbackProduct) {
        return res.json({ success: true, product: fallbackProduct, source: 'fallback' });
      }
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, product });
  } catch (error) {
    const fallbackProduct = fallbackProducts.find(item => item.slug === req.params.slug);
    if (fallbackProduct) {
      return res.json({ success: true, product: fallbackProduct, source: 'fallback' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/products (Admin only - add later)
// @desc    Create product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
