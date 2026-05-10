const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shriyash-foods')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

const products = [
  {
    name: 'ABC Powder',
    slug: 'abc-powder',
    description: 'Premium ABC (Amla, Beetroot, Carrot) powder blend packed with vitamins and antioxidants. A powerful combination for overall health and wellness.',
    category: 'powder',
    variants: [
      { weight: '100g', price: 179, mrp: 249, stock: 100, sku: 'ABC-100' },
      { weight: '250g', price: 349, mrp: 499, stock: 100, sku: 'ABC-250' },
      { weight: '500g', price: 649, mrp: 899, stock: 100, sku: 'ABC-500' }
    ],
    images: [{ url: '/abc-removebg-preview.png' }],
    benefits: [
      'Triple power of Amla, Beetroot & Carrot',
      'Boosts immunity naturally',
      'Rich in Vitamin C and antioxidants',
      'Improves skin health',
      'Supports digestive health'
    ],
    usage: 'Mix 1-2 teaspoons with water, juice, or smoothies. Best consumed daily for maximum benefits.',
    shelfLife: '12 months from manufacturing',
    isActive: true
  },
  {
    name: 'Moringa Powder',
    slug: 'moringa-powder',
    description: 'Pure Moringa powder packed with vitamins, minerals, and antioxidants. Known as the "miracle tree", Moringa helps boost immunity and provides natural energy.',
    category: 'powder',
    variants: [
      { weight: '100g', price: 149, mrp: 199, stock: 100, sku: 'MOR-100' },
      { weight: '250g', price: 299, mrp: 399, stock: 100, sku: 'MOR-250' },
      { weight: '500g', price: 549, mrp: 699, stock: 100, sku: 'MOR-500' }
    ],
    images: [{ url: '/moringa-removebg-preview.png' }],
    benefits: [
      'Boosts immunity naturally',
      'Rich in antioxidants and vitamins',
      'Improves digestion',
      'Increases energy levels',
      'Supports healthy blood sugar levels'
    ],
    usage: 'Mix 1 teaspoon (3-5g) with water, juice, or smoothies. Best consumed in the morning on an empty stomach.',
    shelfLife: '12 months from manufacturing',
    isActive: true
  },
  {
    name: 'Beetroot Powder',
    slug: 'beetroot-powder',
    description: 'Natural beetroot powder for healthy blood circulation and stamina. Rich in iron and nitrates, perfect for athletes and fitness enthusiasts.',
    category: 'powder',
    variants: [
      { weight: '100g', price: 129, mrp: 179, stock: 100, sku: 'BEE-100' },
      { weight: '250g', price: 249, mrp: 349, stock: 100, sku: 'BEE-250' },
      { weight: '500g', price: 449, mrp: 599, stock: 100, sku: 'BEE-500' }
    ],
    images: [{ url: '/beetroot-removebg-preview.png' }],
    benefits: [
      'Improves blood circulation',
      'Boosts stamina and endurance',
      'Rich in iron and folate',
      'Supports heart health',
      'Natural detoxifier'
    ],
    usage: 'Add 1-2 teaspoons to smoothies, juices, or mix with water. Can also be used in baking.',
    shelfLife: '12 months from manufacturing',
    isActive: true
  },
  {
    name: 'Onion Powder',
    slug: 'onion-powder',
    description: 'Premium quality onion powder for cooking and health benefits. Rich in antioxidants and adds authentic flavor to your dishes.',
    category: 'powder',
    variants: [
      { weight: '100g', price: 99, mrp: 149, stock: 100, sku: 'ONI-100' },
      { weight: '250g', price: 199, mrp: 299, stock: 100, sku: 'ONI-250' },
      { weight: '500g', price: 349, mrp: 499, stock: 100, sku: 'ONI-500' }
    ],
    images: [{ url: '/onion-removebg-preview.png' }],
    benefits: [
      'Rich in antioxidants',
      'Supports immune system',
      'Anti-inflammatory properties',
      'Adds authentic flavor to dishes',
      'Long shelf life'
    ],
    usage: 'Use in curries, soups, marinades, and seasoning. 1 teaspoon equals 1 medium onion.',
    shelfLife: '18 months from manufacturing',
    isActive: true
  },
  {
    name: 'Banana Powder',
    slug: 'banana-powder',
    description: 'Natural banana powder rich in potassium and energy. Perfect for smoothies, baby food, and instant energy drinks.',
    category: 'powder',
    variants: [
      { weight: '100g', price: 139, mrp: 189, stock: 100, sku: 'BAN-100' },
      { weight: '250g', price: 279, mrp: 379, stock: 100, sku: 'BAN-250' },
      { weight: '500g', price: 499, mrp: 649, stock: 100, sku: 'BAN-500' }
    ],
    images: [{ url: '/banana-removebg-preview.png' }],
    benefits: [
      'Rich in potassium',
      'Instant energy source',
      'Supports digestive health',
      'Good for baby food',
      'Natural sweetener'
    ],
    usage: 'Mix with milk, water, or add to smoothies. Can be used in baking and desserts.',
    shelfLife: '12 months from manufacturing',
    isActive: true
  },
  {
    name: 'Carrot Powder',
    slug: 'carrot-powder',
    description: 'Pure carrot powder rich in beta-carotene and Vitamin A. Excellent for eye health, skin glow, and overall immunity.',
    category: 'powder',
    variants: [
      { weight: '100g', price: 119, mrp: 169, stock: 100, sku: 'CAR-100' },
      { weight: '250g', price: 239, mrp: 329, stock: 100, sku: 'CAR-250' },
      { weight: '500g', price: 429, mrp: 579, stock: 100, sku: 'CAR-500' }
    ],
    images: [{ url: '/carrot-removebg-preview.png' }],
    benefits: [
      'Rich in beta-carotene and Vitamin A',
      'Improves eye health',
      'Enhances skin glow',
      'Boosts immunity',
      'Supports healthy digestion'
    ],
    usage: 'Add 1-2 teaspoons to juices, smoothies, or soups. Can be used in baking and cooking.',
    shelfLife: '12 months from manufacturing',
    isActive: true
  },
  {
    name: 'Tomato Powder',
    slug: 'tomato-powder',
    description: 'Premium tomato powder rich in lycopene and antioxidants. Perfect for cooking, sauces, and adding authentic tomato flavor to dishes.',
    category: 'powder',
    variants: [
      { weight: '100g', price: 109, mrp: 159, stock: 100, sku: 'TOM-100' },
      { weight: '250g', price: 219, mrp: 309, stock: 100, sku: 'TOM-250' },
      { weight: '500g', price: 399, mrp: 549, stock: 100, sku: 'TOM-500' }
    ],
    images: [{ url: '/tomato-removebg-preview.png' }],
    benefits: [
      'Rich in lycopene',
      'Powerful antioxidant',
      'Supports heart health',
      'Good for skin health',
      'Adds authentic tomato flavor'
    ],
    usage: 'Use in curries, soups, sauces, and gravies. 1 tablespoon equals 1 medium tomato.',
    shelfLife: '18 months from manufacturing',
    isActive: true
  }
];

async function seedProducts() {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert new products
    await Product.insertMany(products);
    console.log('✅ Successfully seeded 7 products');
    console.log('📦 Products: ABC, Moringa, Beetroot, Onion, Banana, Carrot, Tomato');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
