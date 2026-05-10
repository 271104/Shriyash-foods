const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['powder', 'combo', 'other']
  },
  variants: [{
    weight: String, // "100g", "250g", "500g"
    price: Number,
    mrp: Number,
    stock: Number,
    sku: String
  }],
  images: [{
    url: String,
    public_id: String
  }],
  benefits: [String],
  ingredients: String,
  usage: String,
  shelfLife: String,
  fssaiLicense: String,
  isActive: {
    type: Boolean,
    default: true
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
