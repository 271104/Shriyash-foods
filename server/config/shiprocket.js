const axios = require('axios');

/**
 * Shiprocket Configuration
 * Centralized config for Shiprocket API integration
 * Credentials loaded from environment variables
 */

const SHIPROCKET_CONFIG = {
  // API Credentials (from .env)
  email: process.env.SHIPROCKET_EMAIL,
  password: process.env.SHIPROCKET_PASSWORD,
  
  // API Configuration
  baseURL: process.env.SHIPROCKET_BASE_URL || process.env.SHIPROCKET_API_URL || 'https://apiv2.shiprocket.in/v1/external',
  timeout: 30000, // 30 seconds timeout
  
  // Token Configuration
  tokenExpiry: 10 * 24 * 60 * 60 * 1000, // 10 days in milliseconds
  
  // Webhook
  webhookSecret: process.env.SHIPROCKET_WEBHOOK_SECRET,
  
  // Pickup Location
  pickupLocation: 'warehouse', // Default pickup location
  
  // API Endpoints
  endpoints: {
    // Authentication
    AUTH_LOGIN: '/auth/login',
    
    // Courier Management
    COURIER_SERVICEABILITY: '/courier/serviceability',
    COURIER_ASSIGN: '/courier/assign/awb',
    
    // Shipment Management
    ORDER_CREATE: '/orders/create/v2',
    ORDER_CANCEL: '/orders/cancel/v2',
    
    // Pickup
    PICKUP_REQUEST: '/pickups/new',
    
    // Tracking
    TRACKING_DATA: '/trackings/tracking_data',
    
    // Label & Invoice
    LABEL_GENERATE: '/labels/generate/v2',
    LABEL_PRINT: '/labels/print/v2',
    INVOICE_GENERATE: '/invoices/generate/v2',
  }
};

/**
 * Create Shiprocket Axios Instance
 * Pre-configured with base URL and timeout
 */
const shiprocketAxios = axios.create({
  baseURL: SHIPROCKET_CONFIG.baseURL,
  timeout: SHIPROCKET_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Request Interceptor
 * Adds authorization header with token to every request
 */
shiprocketAxios.interceptors.request.use(
  (config) => {
    // Authorization header will be added by token manager when calling API
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Handle common error scenarios
 */
shiprocketAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information
    if (error.response) {
      console.error('Shiprocket API Error:', {
        status: error.response.status,
        data: error.response.data,
        message: error.message
      });
    } else if (error.request) {
      console.error('Shiprocket API No Response:', error.message);
    } else {
      console.error('Shiprocket API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Validate Shiprocket Configuration
 * Check if required credentials are provided
 */
const validateConfig = () => {
  if (!SHIPROCKET_CONFIG.email || !SHIPROCKET_CONFIG.password) {
    console.warn('⚠️  WARNING: Shiprocket credentials not configured in .env');
    console.warn('   Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD to enable Shiprocket integration');
    return false;
  }
  return true;
};

module.exports = {
  SHIPROCKET_CONFIG,
  shiprocketAxios,
  validateConfig
};
