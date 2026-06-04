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
      const getCharge = (...values) => {
        for (const value of values) {
          const amount = Number(value);
          if (Number.isFinite(amount) && amount > 0) {
            return amount;
          }
        }

        return null;
      };
      const mappedCouriers = couriers.map(courier => ({
        id: courier.id,
        name: courier.name || courier.courier_name || courier.company_name,
        freightCharges: getCharge(
          courier.freight_charges,
          courier.freight_charge,
          courier.rate,
          courier.shipping_charge,
          courier.courier_charge,
          courier.total_charge,
          courier.charges
        ),
        codCharges: Number(courier.cod_charges || courier.cod_charge || 0),
        etd: courier.etd,
        etaDeliveryDays: courier.etaDeliveryDays
      }));
      const cheapestCourier = mappedCouriers
        .filter(courier => Number.isFinite(Number(courier.freightCharges)) && Number(courier.freightCharges) > 0)
        .sort((a, b) => a.freightCharges - b.freightCharges)[0] || null;

      return {
        success: true,
        serviceable: Boolean(cheapestCourier),
        shippingCharge: cheapestCourier ? Math.ceil(cheapestCourier.freightCharges) : null,
        cheapestCourier,
        couriers: mappedCouriers.filter(courier => Number.isFinite(Number(courier.freightCharges)) && Number(courier.freightCharges) > 0),
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
      console.log('[SHIPPING SERVICE] 🔄 Starting createShipment for order:', orderData.orderId);
      
      console.log('[SHIPPING SERVICE] 🔐 Getting Shiprocket token...');
      const token = await tokenManager.getToken();
      console.log('[SHIPPING SERVICE] ✅ Token obtained successfully');

      const fullName = orderData.shippingAddress.fullName || '';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || '.';

      // Build Shiprocket order payload
      const payload = {
        order_id: orderData.orderId,

        order_date: new Date(orderData.createdAt)
          .toISOString()
          .slice(0, 16)
          .replace('T', ' '),

        pickup_location: SHIPROCKET_CONFIG.pickupLocation,

        shipping_is_billing: true,

        billing_customer_name: firstName,
        billing_last_name: lastName,

        billing_address: orderData.shippingAddress.addressLine1,
        billing_address_2: orderData.shippingAddress.addressLine2 || '',

        billing_city: orderData.shippingAddress.city,
        billing_pincode: Number(orderData.shippingAddress.pincode),
        billing_state: orderData.shippingAddress.state,
        billing_country: 'India',

        billing_email:
          orderData.shippingAddress.email ||
          orderData.guestDetails?.email ||
          'customer@example.com',

        billing_phone: orderData.shippingAddress.phone,

        order_items: orderData.items.map(item => ({
          name: item.name,
          sku: item.sku || `SKU-${item.product}`,
          units: item.quantity,
          selling_price: item.price
        })),

        payment_method:
          orderData.paymentMethod === 'COD'
            ? 'COD'
            : 'Prepaid',

        sub_total:
          orderData.pricing.subtotal ||
          orderData.pricing.total,

        length: 15,
        breadth: 10,
        height: 4,
        weight: 0.5
      };

      console.log('[SHIPPING SERVICE] 📦 Payload being sent to Shiprocket API:', {
        orderId: payload.order_id,
        customer: `${payload.billing_customer_name} ${payload.billing_last_name}`,
        city: payload.billing_city,
        itemCount: payload.order_items.length,
        amount: payload.sub_total,
        paymentMethod: payload.payment_method
      });

      console.log('[SHIPPING SERVICE] 🚀 Calling Shiprocket API endpoint:', SHIPROCKET_CONFIG.endpoints.ORDER_CREATE);
      console.log(
        '\n================ SHIPROCKET FULL PAYLOAD ================\n',
        JSON.stringify(payload, null, 2),
        '\n=========================================================\n'
      );
      const response = await shiprocketAxios.post(
        SHIPROCKET_CONFIG.endpoints.ORDER_CREATE,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(
        '\n================ SHIPROCKET RAW RESPONSE ================\n',
        JSON.stringify(response.data, null, 2),
        '\n=========================================================\n'
      );

      console.log(
        '[SHIPROCKET] Response keys:',
        Object.keys(response.data || {})
      );

      // Shiprocket adhoc API returns data directly
      const data = response.data;

      // Validate response
      if (!data.order_id) {
        throw new Error('Shiprocket order creation failed - order_id not returned');
      }

      console.log('[SHIPPING SERVICE] 💾 Updating MongoDB with Shiprocket IDs...');

      await Order.findOneAndUpdate(
        { orderId: orderData.orderId },
        {
          shiprocketOrderId: String(data.order_id),
          shiprocketShipmentId: String(data.shipment_id),
          awbCode: data.awb_code || '',
          courierName: data.courier_name || '',

          shippingStatus: 'AWB_ASSIGNED',

          $push: {
            statusHistory: {
              status: 'SHIPMENT_CREATED',
              note: `Shiprocket shipment created: ${data.shipment_id}`
            }
          }
        },
        { new: true }
      );

      console.log('[SHIPPING SERVICE] ✅ MongoDB updated successfully');

      console.log('[SHIPPING SERVICE] ✅ Shiprocket Order ID:', data.order_id);
      console.log('[SHIPPING SERVICE] ✅ Shipment ID:', data.shipment_id);
      console.log('[SHIPPING SERVICE] ✅ AWB Code:', data.awb_code);
      console.log('[SHIPPING SERVICE] ✅ Courier:', data.courier_name);


 

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
