const { shiprocketAxios, SHIPROCKET_CONFIG } = require('../config/shiprocket');
const tokenManager = require('../utils/tokenManager');
const Order = require('../models/Order');

/**
 * Shiprocket Shipping Service
 * Core business logic for all shipping operations
 * All methods use automatic token refresh via tokenManager
 */

class ShippingService {
  /**
   * AUTHENTICATION
   */

  /**
   * Authenticate with Shiprocket
   * Returns token and caches it in tokenManager
   * @returns {Promise<{success, token}>}
   */
  async authenticate() {
    try {
      const token = await tokenManager.getToken();
      
      return {
        success: true,
        token,
        expiresIn: SHIPROCKET_CONFIG.tokenExpiry / 1000, // in seconds
        message: 'Authentication successful'
      };
    } catch (error) {
      throw {
        success: false,
        message: 'Shiprocket authentication failed',
        error: error.message
      };
    }
  }

  /**
   * SERVICEABILITY
   */

  /**
   * Check if delivery is serviceable for given pincode
   * Fetch courier options and shipping charges
   * @param {string} pickupPostcode - Warehouse pincode
   * @param {string} deliveryPostcode - Delivery pincode
   * @param {number} weight - Package weight in kg
   * @param {number} cod - 1 for COD available, 0 for prepaid only
   * @returns {Promise<{success, couriers, codAvailable, estimatedDays}>}
   */
  async checkServiceability(pickupPostcode, deliveryPostcode, weight, cod = 1) {
    try {
      const token = await tokenManager.getToken();

      const response = await shiprocketAxios.get(
        SHIPROCKET_CONFIG.endpoints.COURIER_SERVICEABILITY,
        {
          params: {
            pickup_postcode: pickupPostcode,
            delivery_postcode: deliveryPostcode,
            weight: weight || 0.5,
            cod: cod
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const courierData = response.data.data || {};
      const couriers = courierData.available_courier_companies || [];
      const mappedCouriers = couriers.map(courier => ({
        id: courier.id,
        name: courier.name || courier.courier_name || courier.company_name,
        freightCharges: Number(courier.freight_charges || 0),
        codCharges: Number(courier.cod_charges || 0),
        etd: courier.etd,
        etaDeliveryDays: courier.etaDeliveryDays
      }));
      const cheapestCourier = mappedCouriers
        .filter(courier => courier.freightCharges > 0)
        .sort((a, b) => a.freightCharges - b.freightCharges)[0] || null;

      return {
        success: true,
        serviceable: mappedCouriers.length > 0,
        shippingCharge: cheapestCourier ? Math.ceil(cheapestCourier.freightCharges) : null,
        cheapestCourier,
        couriers: mappedCouriers,
        codAvailable: mappedCouriers.length > 0 && cod === 1,
        estimatedDays: courierData.etaDeliveryDays || '3-5 business days'
      };
    } catch (error) {
      console.error('Serviceability check error:', error.message);
      throw {
        success: false,
        message: 'Failed to check serviceability',
        error: error.message
      };
    }
  }

  /**
   * SHIPMENT CREATION
   */

  /**
   * Create shipment order in Shiprocket
   * Maps MongoDB order to Shiprocket format
   * @param {Object} orderData - Order data from MongoDB
   * @returns {Promise<{success, shiprocketOrderId, shipmentId}>}
   */
  async createShipment(orderData) {
    try {
      const token = await tokenManager.getToken();

      // Build Shiprocket order payload
      const payload = {
        order_id: orderData.orderId,
        order_date: new Date(orderData.createdAt).toISOString(),
        pickup_location_slug: SHIPROCKET_CONFIG.pickupLocation,
        
        // Customer details
        customer_name: orderData.shippingAddress.fullName,
        customer_email: orderData.shippingAddress.email || orderData.guestDetails?.email,
        customer_phone: orderData.shippingAddress.phone,
        
        // Shipping address
        shipping_address: orderData.shippingAddress.addressLine1,
        shipping_address_2: orderData.shippingAddress.addressLine2 || '',
        shipping_city: orderData.shippingAddress.city,
        shipping_state: orderData.shippingAddress.state,
        shipping_postcode: orderData.shippingAddress.pincode,
        shipping_country: 'India',
        
        // Order items
        line_items: orderData.items.map(item => ({
          name: item.name,
          sku: item.sku || `SKU-${item.product}`,
          units: item.quantity,
          selling_price: item.price,
          discount: 0
        })),
        
        // Pricing
        billing_amount: orderData.pricing.total || orderData.pricing.subtotal,
        shipping_charges: orderData.pricing.shipping || 0,
        cod_amount: orderData.paymentMethod === 'COD' ? orderData.pricing.total : 0,
        
        // Payment method
        payment_method: orderData.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
        
        // Package dimensions (if available)
        weight: orderData.weight || 0.5,
        dimensions: orderData.dimensions || {
          length: 15,
          breadth: 10,
          height: 4,
          unit: 'cm'
        }
      };

      const response = await shiprocketAxios.post(
        SHIPROCKET_CONFIG.endpoints.ORDER_CREATE,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create order');
      }

      const data = response.data.data;

      // Save to MongoDB
      await Order.findOneAndUpdate(
        { orderId: orderData.orderId },
        {
          shiprocketOrderId: data.order_id,
          shiprocketShipmentId: data.shipment_id,
          $push: {
            statusHistory: {
              status: 'SHIPMENT_CREATED',
              note: `Shiprocket shipment created: ${data.shipment_id}`
            }
          }
        },
        { new: true }
      );

      return {
        success: true,
        shiprocketOrderId: data.order_id,
        shipmentId: data.shipment_id,
        message: 'Shipment created successfully'
      };
    } catch (error) {
      console.error('Create shipment error:', error.message);
      throw {
        success: false,
        message: 'Failed to create shipment',
        error: error.message
      };
    }
  }

  /**
   * COURIER ASSIGNMENT & AWB
   */

  /**
   * Assign AWB (airway bill) to shipment
   * Auto-assigns courier based on serviceability
   * @param {string} shipmentId - Shiprocket shipment ID
   * @returns {Promise<{success, awbCode, courierName, trackingUrl}>}
   */
  async assignAWB(shipmentId) {
    try {
      const token = await tokenManager.getToken();

      const response = await shiprocketAxios.post(
        SHIPROCKET_CONFIG.endpoints.COURIER_ASSIGN,
        {
          shipment_id: shipmentId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to assign AWB');
      }

      const data = response.data.data;

      return {
        success: true,
        awbCode: data.awb_code,
        shipmentId: data.shipment_id,
        courierName: data.courier_name,
        trackingUrl: data.tracking_url || '',
        message: 'AWB assigned successfully'
      };
    } catch (error) {
      console.error('Assign AWB error:', error.message);
      throw {
        success: false,
        message: 'Failed to assign AWB',
        error: error.message
      };
    }
  }

  /**
   * PICKUP GENERATION
   */

  /**
   * Generate pickup request for courier pickup
   * @param {string} shipmentId - Shiprocket shipment ID
   * @returns {Promise<{success, pickupScheduledDate, pickupReference}>}
   */
  async generatePickup(shipmentId) {
    try {
      const token = await tokenManager.getToken();

      const response = await shiprocketAxios.post(
        SHIPROCKET_CONFIG.endpoints.PICKUP_REQUEST,
        {
          shipment_id: shipmentId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to generate pickup');
      }

      const data = response.data.data;

      return {
        success: true,
        pickupScheduledDate: data.pickup_scheduled_date || new Date().toISOString(),
        pickupReference: data.pickup_id || shipmentId,
        message: 'Pickup generated successfully'
      };
    } catch (error) {
      console.error('Generate pickup error:', error.message);
      throw {
        success: false,
        message: 'Failed to generate pickup',
        error: error.message
      };
    }
  }

  /**
   * TRACKING
   */

  /**
   * Track shipment by AWB code
   * Fetch tracking timeline and current status
   * @param {string} awbCode - AWB (tracking) number
   * @returns {Promise<{success, status, activities, trackUrl, etd}>}
   */
  async trackShipment(awbCode) {
    try {
      const token = await tokenManager.getToken();

      const response = await shiprocketAxios.get(
        SHIPROCKET_CONFIG.endpoints.TRACKING_DATA,
        {
          params: {
            awb: awbCode
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.data.success) {
        throw new Error('Shipment not found or tracking unavailable');
      }

      const tracking = response.data.data?.[0] || {};

      return {
        success: true,
        status: tracking.shipment_status || 'PROCESSING',
        statusText: this._mapShipmentStatus(tracking.shipment_status),
        courierName: tracking.courier_name || '',
        activities: (tracking.tracking_data || []).map(activity => ({
          timestamp: activity.date,
          status: activity.status,
          location: activity.location,
          remark: activity.remark
        })),
        trackUrl: `https://tracking.shiprocket.in/${awbCode}`,
        eta: tracking.expected_delivery_date || null
      };
    } catch (error) {
      console.error('Track shipment error:', error.message);
      throw {
        success: false,
        message: 'Failed to track shipment',
        error: error.message
      };
    }
  }

  /**
   * LABELS & DOCUMENTS
   */

  /**
   * Generate shipping label PDF
   * @param {string} shipmentId - Shiprocket shipment ID
   * @returns {Promise<{success, labelUrl}>}
   */
  async generateLabel(shipmentId) {
    try {
      const token = await tokenManager.getToken();

      const response = await shiprocketAxios.post(
        SHIPROCKET_CONFIG.endpoints.LABEL_GENERATE,
        {
          shipment_id: [shipmentId]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to generate label');
      }

      return {
        success: true,
        labelUrl: response.data.data?.label_url || response.data.label_url,
        message: 'Label generated successfully'
      };
    } catch (error) {
      console.error('Generate label error:', error.message);
      throw {
        success: false,
        message: 'Failed to generate label',
        error: error.message
      };
    }
  }

  /**
   * Generate invoice PDF
   * @param {string} shiprocketOrderId - Shiprocket order ID
   * @returns {Promise<{success, invoiceUrl}>}
   */
  async generateInvoice(shiprocketOrderId) {
    try {
      const token = await tokenManager.getToken();

      const response = await shiprocketAxios.post(
        SHIPROCKET_CONFIG.endpoints.INVOICE_GENERATE,
        {
          order_id: shiprocketOrderId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to generate invoice');
      }

      return {
        success: true,
        invoiceUrl: response.data.data?.invoice_url || response.data.invoice_url,
        message: 'Invoice generated successfully'
      };
    } catch (error) {
      console.error('Generate invoice error:', error.message);
      throw {
        success: false,
        message: 'Failed to generate invoice',
        error: error.message
      };
    }
  }

  /**
   * CANCELLATION
   */

  /**
   * Cancel order/shipment in Shiprocket
   * @param {string} shiprocketOrderId - Shiprocket order ID
   * @returns {Promise<{success, message}>}
   */
  async cancelOrder(shiprocketOrderId) {
    try {
      const token = await tokenManager.getToken();

      const response = await shiprocketAxios.post(
        SHIPROCKET_CONFIG.endpoints.ORDER_CANCEL,
        {
          order_id: shiprocketOrderId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to cancel order');
      }

      return {
        success: true,
        message: response.data.message || 'Order cancelled successfully'
      };
    } catch (error) {
      console.error('Cancel order error:', error.message);
      throw {
        success: false,
        message: 'Failed to cancel order',
        error: error.message
      };
    }
  }

  /**
   * UTILITY HELPERS
   */

  /**
   * Map Shiprocket shipment status code to readable status
   * @private
   * @param {number} statusCode - Shiprocket status code
   * @returns {string} Readable status
   */
  _mapShipmentStatus(statusCode) {
    const statusMap = {
      0: 'PENDING',
      1: 'CONFIRMED',
      2: 'PROCESSING',
      3: 'PICKUP_GENERATED',
      4: 'PICKED_UP',
      5: 'IN_TRANSIT',
      6: 'OUT_FOR_DELIVERY',
      7: 'DELIVERED',
      8: 'FAILED_ATTEMPT',
      9: 'CANCELLED',
      10: 'RTO'
    };
    return statusMap[statusCode] || 'UNKNOWN';
  }

  /**
   * Get token info (for debugging)
   * @returns {Object} Token metadata
   */
  getTokenInfo() {
    return tokenManager.getTokenInfo();
  }
}

module.exports = new ShippingService();
