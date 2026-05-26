const { shiprocketAxios, SHIPROCKET_CONFIG } = require('../config/shiprocket');

/**
 * Shiprocket Token Manager
 * Handles token lifecycle: fetch, cache, refresh, validate
 * 
 * In production, consider using Redis for distributed caching
 * Current implementation uses in-memory storage (suitable for single-instance deployments)
 */

class ShiprocketTokenManager {
  constructor() {
    this.token = null;
    this.expiryTime = null;
    this.isRefreshing = false;
    this.refreshPromise = null;
  }

  /**
   * Get valid Shiprocket token
   * Returns cached token if valid, otherwise fetches new one
   * @returns {Promise<string>} Valid Shiprocket token
   */
  async getToken() {
    try {
      // If token is valid, return it
      if (this.isTokenValid()) {
        return this.token;
      }

      // If already refreshing, wait for refresh to complete
      if (this.isRefreshing) {
        return await this.refreshPromise;
      }

      // Fetch new token
      return await this.refreshToken();
    } catch (error) {
      console.error('❌ Token Manager Error:', error.message);
      throw new Error('Failed to get Shiprocket token: ' + error.message);
    }
  }

  /**
   * Check if current token is valid and not expired
   * @returns {boolean} True if token is valid and within 5min buffer
   */
  isTokenValid() {
    if (!this.token || !this.expiryTime) {
      return false;
    }

    // Add 5-minute buffer before actual expiry
    const bufferTime = 5 * 60 * 1000;
    const currentTime = Date.now();
    
    return currentTime < (this.expiryTime - bufferTime);
  }

  /**
   * Refresh token by calling Shiprocket auth API
   * @returns {Promise<string>} New token
   */
  async refreshToken() {
    // Prevent multiple simultaneous refresh requests
    this.isRefreshing = true;
    this.refreshPromise = this._performTokenRefresh();

    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Internal method to perform actual token refresh
   * @private
   * @returns {Promise<string>} New token
   */
  async _performTokenRefresh() {
    try {
      console.log('🔄 Refreshing Shiprocket token...');

      const response = await shiprocketAxios.post(
        SHIPROCKET_CONFIG.endpoints.AUTH_LOGIN,
        {
          email: SHIPROCKET_CONFIG.email,
          password: SHIPROCKET_CONFIG.password
        }
      );

      if (!response.data || !response.data.token) {
        throw new Error('Invalid token response from Shiprocket');
      }

      // Store token and expiry time
      this.token = response.data.token;
      this.expiryTime = Date.now() + SHIPROCKET_CONFIG.tokenExpiry;

      console.log('✅ Shiprocket token refreshed successfully');
      console.log(`   Token valid until: ${new Date(this.expiryTime).toISOString()}`);

      return this.token;
    } catch (error) {
      console.error('❌ Token refresh failed:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Force token refresh (even if current token is valid)
   * Useful for debugging or scheduled refresh
   * @returns {Promise<string>} New token
   */
  async forceRefresh() {
    this.token = null;
    this.expiryTime = null;
    return await this.getToken();
  }

  /**
   * Get token info (for debugging/monitoring)
   * @returns {Object} Token metadata
   */
  getTokenInfo() {
    return {
      hasToken: !!this.token,
      isValid: this.isTokenValid(),
      expiresAt: this.expiryTime ? new Date(this.expiryTime).toISOString() : null,
      expiresIn: this.expiryTime ? Math.round((this.expiryTime - Date.now()) / 1000) + ' seconds' : null,
      isRefreshing: this.isRefreshing
    };
  }

  /**
   * Clear token (useful for logout or testing)
   */
  clearToken() {
    this.token = null;
    this.expiryTime = null;
    console.log('🗑️  Shiprocket token cleared');
  }
}

// Export singleton instance
module.exports = new ShiprocketTokenManager();
