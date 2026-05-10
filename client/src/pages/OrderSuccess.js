import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiCheckCircle, FiPackage } from 'react-icons/fi';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`/api/orders/${orderId}`);
      setOrder(data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2>Order not found</h2>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="order-success-page">
      <div className="container">
        <div className="success-card">
          <FiCheckCircle size={80} className="success-icon" />
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for your order. We'll send you updates via WhatsApp.</p>
          
          <div className="order-info">
            <div className="info-row">
              <span>Order ID:</span>
              <strong>{order.orderId}</strong>
            </div>
            <div className="info-row">
              <span>Payment Method:</span>
              <strong>{order.paymentMethod}</strong>
            </div>
            <div className="info-row">
              <span>Total Amount:</span>
              <strong>₹{order.pricing.total}</strong>
            </div>
            <div className="info-row">
              <span>Status:</span>
              <strong className="status">{order.orderStatus}</strong>
            </div>
          </div>

          <div className="order-items">
            <h3><FiPackage /> Order Items</h3>
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <span>{item.name} ({item.variant})</span>
                <span>₹{item.price} × {item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="shipping-address">
            <h3>Shipping Address</h3>
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p>Phone: {order.shippingAddress.phone}</p>
          </div>

          <div className="action-buttons">
            <Link to={`/track/${order.orderId}`} className="btn btn-primary">
              Track Order
            </Link>
            <Link to="/products" className="btn btn-outline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
