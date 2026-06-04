/**
 * Centralized API Configuration
 * This file handles environment-specific API endpoints
 */

const API_BASE =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL || 'https://shriyash-foods.onrender.com/api'
    : process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default API_BASE;
