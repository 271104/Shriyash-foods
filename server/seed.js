const mongoose = require('mongoose');
const Product = require('./models/Product');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shriyash-foods');
    console.log('✅ MongoDB Connected');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert new products
    const result = await Product.insertMany(products);
    console.log('✅ Successfully seeded', result.length, 'products');
    console.log('📦 Products: ABC, Moringa, Beetroot, Onion, Banana, Carrot, Tomato');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

const products = [
  {
    name: 'ABC Powder',
    slug: 'abc-powder',
    description: 'ABC Powder (Apple + Beetroot + Carrot) - A powerful blend rich in antioxidants & vitamins that supports immunity, improves energy levels, and promotes overall wellness.',
    category: 'powder',
    variants: [
      { weight: '100g', price: 249, mrp: 299, stock: 100, sku: 'ABC-100' },
      { weight: '250g', price: 549, mrp: 649, stock: 100, sku: 'ABC-250' },
      { weight: '500g', price: 999, mrp: 1199, stock: 100, sku: 'ABC-500' }
    ],
    images: [{ url: '/abc-removebg-preview.png' }],
    benefits: [
      'Rich in antioxidants & vitamins',
      'Supports immunity',
      'Helps improve energy levels',
      'Good for skin & overall wellness',
      'Supports healthy digestion'
    ],
    howToConsume: [
      'Mix 1–2 teaspoons in water or juice',
      'Add to smoothies or shakes',
      'Use in health drinks or breakfast bowls'
    ],
    precautions: [
      'Store in a cool & dry place',
      'Keep away from moisture',
      'Consume in moderate quantity',
      'People with diabetes should monitor intake due to natural fruit sugars'
    ],
    usage: 'Mix 1-2 teaspoons with water, juice, or smoothies. Best consumed daily for maximum benefits.',
    shelfLife: '12 months from manufacturing',
    isActive: true
  },
  {
    name: 'Moringa Powder',
    slug: 'moringa-powder',
    description: 'Pure Moringa Powder - A nutrient-rich superfood packed with vitamins & minerals that supports overall wellness, improves energy naturally, and boosts immunity.',
    category: 'powder',
    variants: [
      { weight: '100g', price: 249, mrp: 299, stock: 100, sku: 'MOR-100' },
      { weight: '250g', price: 549, mrp: 649, stock: 100, sku: 'MOR-250' },
      { weight: '500g', price: 999, mrp: 1199, stock: 100, sku: 'MOR-500' }
    ],
    images: [{ url: '/moringa-removebg-preview.png' }],
    benefits: [
      'Rich in vitamins & minerals',
      'Supports overall wellness',
      'Helps improve energy naturally',
      'Supports immunity',
      'Nutrient-rich superfood'
    ],
    howToConsume: [
      'Mix 1 teaspoon in warm water',
      'Add to smoothies, juices or tea',
      'Mix in soups or health drinks'
    ],
    precautions: [
      'Consume in moderate quantity',
      'Pregnant women should consult a doctor before regular use',
      'Store in a cool & dry place'
    ],
    usage: 'Mix 1 teaspoon (3-5g) with water, juice, or smoothies. Best consumed in the morning on an empty stomach.',
    shelfLife: '12 months from manufacturing',
    isActive: true
  },
  {
    name: 'Beetroot Powder',
    slug: 'beetroot-powder',
    description: 'Natural Beetroot Powder - Rich in iron & antioxidants that helps boost immunity, supports stamina & blood circulation, and increases energy naturally.',
    category: 'powder',
    variants: [
      { weight: '100g', price: 199, mrp: 249, stock: 100, sku: 'BEE-100' },
      { weight: '250g', price: 449, mrp: 549, stock: 100, sku: 'BEE-250' },
      { weight: '500g', price: 799, mrp: 999, stock: 100, sku: 'BEE-500' }
    ],
    images: [{ url: '/beetroot-removebg-preview.png' }],
    benefits: [
      'Helps boost immunity',
      'Rich in iron & antioxidants',
      'Supports stamina & blood circulation',
      'Good for skin health',
      'Helps increase energy naturally'
    ],
    howToConsume: [
      'Mix 1 teaspoon in water or juice',
      'Add to smoothies or shakes',
      'Use in desserts, baking & health drinks'
    ],
    precautions: [
      'Consume in moderate quantity',
      'Excess intake may temporarily change urine/stool color',
      'Store in a cool & dry place'
    ],
    usage: 'Add 1-2 teaspoons to smoothies, juices, or mix with water. Can also be used in baking.',
    shelfLife: '12 months from manufacturing',
    isActive: true
  },
  {
    name: 'Onion Powder',
    slug: 'onion-powder',
    description: 'Premium Onion Powder - Enhances flavor naturally, rich in antioxidants, supports heart health, and serves as a convenient substitute for fresh onion.',
    category: 'powder',
    variants: [
      { weight: '100g', price: 199, mrp: 249, stock: 100, sku: 'ONI-100' },
      { weight: '250g', price: 449, mrp: 549, stock: 100, sku: 'ONI-250' },
      { weight: '500g', price: 799, mrp: 999, stock: 100, sku: 'ONI-500' }
    ],
    images: [{ url: '/onion-removebg-preview.png' }],
    benefits: [
      'Enhances flavor naturally',
      'Rich in antioxidants',
      'Supports heart health',
      'Convenient substitute for fresh onion',
      'Helps in digestion'
    ],
    howToConsume: [
      'Add in curries, soups & gravies',
      'Use in seasoning & marinades',
      'Sprinkle in snacks or sauces'
    ],
    precautions: [
      'Avoid excessive consumption',
      'Store airtight to maintain freshness',
      'People with onion allergy should avoid use'
    ],
    usage: 'Use in curries, soups, marinades, and seasoning. 1 teaspoon equals 1 medium onion.',
    shelfLife: '18 months from manufacturing',
    isActive: true
  },
  {
    name: 'Banana Powder',
    slug: 'banana-powder',
    description: 'Natural Banana Powder - A rich source of natural energy and potassium that supports digestion, helps in healthy weight management, and is naturally sweet & nutritious.',
    category: 'powder',
    variants: [
      { weight: '100g', price: 199, mrp: 249, stock: 100, sku: 'BAN-100' },
      { weight: '250g', price: 449, mrp: 549, stock: 100, sku: 'BAN-250' },
      { weight: '500g', price: 799, mrp: 999, stock: 100, sku: 'BAN-500' }
    ],
    images: [{ url: '/banana-removebg-preview.png' }],
    benefits: [
      'Rich source of natural energy',
      'Supports digestion',
      'Good source of potassium',
      'Helps in healthy weight management',
      'Naturally sweet & nutritious'
    ],
    howToConsume: [
      'Mix with milk or smoothies',
      'Use in baby food or shakes',
      'Add in baking & desserts'
    ],
    precautions: [
      'Store airtight after opening',
      'Consume moderately',
      'Diabetic individuals should monitor intake due to natural sugars'
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
      { weight: '100g', price: 199, mrp: 249, stock: 100, sku: 'CAR-100' },
      { weight: '250g', price: 449, mrp: 549, stock: 100, sku: 'CAR-250' },
      { weight: '500g', price: 799, mrp: 999, stock: 100, sku: 'CAR-500' }
    ],
    images: [{ url: '/carrot-removebg-preview.png' }],
    benefits: [
      'Rich in beta-carotene and Vitamin A',
      'Improves eye health',
      'Enhances skin glow',
      'Boosts immunity',
      'Supports healthy digestion'
    ],
    howToConsume: [
      'Mix 1 teaspoon in water or juice',
      'Add to smoothies or shakes',
      'Use in cooking and baking'
    ],
    precautions: [
      'Store in a cool & dry place',
      'Consume in moderate quantity',
      'Keep away from moisture'
    ],
    usage: 'Add 1-2 teaspoons to juices, smoothies, or soups. Can be used in baking and cooking.',
    shelfLife: '12 months from manufacturing',
    isActive: true
  },
  {
    name: 'Tomato Powder',
    slug: 'tomato-powder',
    description: 'Premium Tomato Powder - Rich in lycopene & antioxidants that supports immunity, enhances flavor naturally, and serves as a convenient replacement for fresh tomato.',
    category: 'powder',
    variants: [
      { weight: '100g', price: 199, mrp: 249, stock: 100, sku: 'TOM-100' },
      { weight: '250g', price: 449, mrp: 549, stock: 100, sku: 'TOM-250' },
      { weight: '500g', price: 799, mrp: 999, stock: 100, sku: 'TOM-500' }
    ],
    images: [{ url: '/tomato-removebg-preview.png' }],
    benefits: [
      'Rich in lycopene & antioxidants',
      'Supports immunity',
      'Enhances flavor naturally',
      'Convenient replacement for fresh tomato',
      'Good source of vitamins'
    ],
    howToConsume: [
      'Add to soups, curries & sauces',
      'Use in seasoning mixes',
      'Mix in gravies or snacks'
    ],
    precautions: [
      'Store airtight after opening',
      'Avoid moisture exposure',
      'People sensitive to acidic foods should consume moderately'
    ],
    usage: 'Use in curries, soups, sauces, and gravies. 1 tablespoon equals 1 medium tomato.',
    shelfLife: '18 months from manufacturing',
    isActive: true
  }
];

seedProducts();
