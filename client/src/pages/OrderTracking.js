import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiPackage, FiTruck, FiCheckCircle } from 'react-icons/fi';
import './OrderTracking.css';

const OrderTracking = () => {
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
      </div>
    );
  }

  const statusSteps = [
    { key: 'PENDING', label: 'Order Placed', icon: FiPackage },
    { key: 'CONFIRMED', label: 'Confirmed', icon: FiCheckCircle },
    { key: 'PROCESSING', label: 'Processing', icon: FiPackage },
    { key: 'SHIPPED', label: 'Shipped', icon: FiTruck },
    { key: 'DELIVERED', label: 'Delivered', icon: FiCheckCircle }
  ];

  const currentStepIndex = statusSteps.findIndex(step => step.key === order.orderStatus);

  return (
    <div className="order-tracking-page">
      <div className="container">
        <h1>Track Order</h1>
        
        <div className="tracking-card">
          <div className="order-header">
            <div>
              <h2>Order #{order.orderId}</h2>
              <p>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="order-status-badge">
              {order.orderStatus}
            </div>
          </div>

          <div className="tracking-timeline">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.key} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                  <div className="step-icon">
                    <Icon />
                  </div>
                  <div className="step-label">{step.label}</div>
                  {index < statusSteps.length - 1 && <div className="step-line"></div>}
                </div>
              );
            })}
          </div>

          {order.awbCode && (
            <div className="tracking-info">
              <p><strong>AWB Code:</strong> {order.awbCode}</p>
              {order.trackingUrl && (
                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  Track on Courier Website
                </a>
              )}
            </div>
          )}

          <div className="order-details">
            <h3>Order Details</h3>
            {order.items.map((item, index) => (
              <div key={index} className="detail-item">
                <span>{item.name} ({item.variant}) × {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="detail-total">
              <span>Total</span>
              <span>₹{order.pricing.total}</span>
            </div>
          </div>

          <div className="delivery-address">
            <h3>Delivery Address</h3>
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
