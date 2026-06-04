const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

/**
 * IMPORTANT FOR RENDER
 * Fixes X-Forwarded-For warning
 */
app.set('trust proxy', 1);

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://shriyash-foods.vercel.app',
  'https://www.shriyashfoods.com',
  'https://shriyashfoods.com',
  process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      process.env.NODE_ENV !== 'production' &&
      origin &&
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) =>
    console.error('❌ MongoDB Connection Error:', err)
  );

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/shipping', require('./routes/shipping.routes'));
app.use('/api/webhooks', require('./routes/webhook.routes'));
app.use('/api/otp', require('./routes/otp'));
app.use('/api/seed', require('./routes/seedRoutes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    message: 'Shriyash Foods API is running'
  });
});

// Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Shriyash Foods Backend API',
    version: '1.0.0'
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Server Error'
        : err.message
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});