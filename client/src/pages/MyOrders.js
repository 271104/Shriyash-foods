import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiPackage, FiShoppingBag, FiClock, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './MyOrders.css';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const getStatusClass = (status) => {
  const map = {
    DELIVERED: 'status-delivered',
    CANCELLED: 'status-cancelled',
    RTO: 'status-cancelled',
    SHIPPED: 'status-shipped',
    PROCESSING: 'status-processing',
    CONFIRMED: 'status-confirmed',
    PENDING: 'status-pending'
  };
  return map[status] || 'status-pending';
};

const MyOrders = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    fetchOrders();
  }, [isAuthenticated, authLoading]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get('/api/orders');
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="my-orders-page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="my-orders-page">
        <div className="container">
          <div className="orders-empty">
            <FiPackage size={64} />
            <h2>Please login to view your orders</h2>
            <p>Sign in to see your order history and track deliveries.</p>
            <Link to="/login" className="btn btn-primary">Login</Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-orders-page">
        <div className="container">
          <div className="orders-empty">
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button type="button" className="btn btn-primary" onClick={fetchOrders}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>{orders.length} {orders.length === 1 ? 'order' : 'orders'} placed</p>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <FiShoppingBag size={72} />
            <h2>No orders yet</h2>
            <p>You haven&apos;t placed any orders. Browse our products and place your first order!</p>
            <Link to="/products" className="btn btn-primary">Shop Now</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <h3>Order #{order.orderId}</h3>
                    <p className="order-date">
                      <FiClock /> Placed on {formatDate(order.placedAt || order.createdAt)}
                    </p>
                  </div>
                  <span className={`order-status ${getStatusClass(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>

                <div className="order-items-list">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-product-row">
                      <div className="order-product-info">
                        <span className="product-name">{item.name}</span>
                        <span className="product-variant">{item.variant}</span>
                      </div>
                      <div className="order-product-qty">
                        Qty: {item.quantity}
                      </div>
                      <div className="order-product-price">
                        ₹{(item.lineTotal ?? item.price * item.quantity).toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div className="order-footer-summary">
                    <span>Payment: <strong>{order.paymentMethod}</strong></span>
                    <span>Total: <strong>₹{order.pricing?.total}</strong></span>
                  </div>
                  <Link to={`/track/${order.orderId}`} className="track-link">
                    Track Order <FiChevronRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
