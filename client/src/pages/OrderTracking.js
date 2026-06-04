import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiMapPin, FiPackage, FiTruck } from 'react-icons/fi';
import './OrderTracking.css';

const OrderTracking = () => {
  const { orderId } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchTracking();
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTracking = async () => {
    try {
      const { data } = await axios.get(`/orders/${orderId}/track`);
      setTracking(data);
      setErrorMessage('');
    } catch (error) {
      const message = error.response?.data?.message || 'Tracking details are not available right now';
      setErrorMessage(message);
      console.error('Error fetching tracking:', error);
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

  if (!tracking) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2>{errorMessage || 'Tracking not found'}</h2>
      </div>
    );
  }

  return (
    <div className="order-tracking-page">
      <div className="container">
        <h1>Track Order</h1>

        <div className="tracking-card">
          <div className="order-header">
            <div>
              <h2>Order #{tracking.orderId}</h2>
              <p>AWB: {tracking.awbCode}</p>
            </div>
            <div className="order-status-badge">
              {tracking.status || tracking.shippingStatus || 'Tracking'}
            </div>
          </div>

          <div className="tracking-info">
            <p><strong>Status:</strong> {tracking.status || tracking.shippingStatus || 'Not updated yet'}</p>
            <p><strong>Courier:</strong> {tracking.courier || 'Assigned'}</p>
            {tracking.currentLocation && (
              <p><strong>Current Location:</strong> {tracking.currentLocation}</p>
            )}
            {tracking.destination && (
              <p><strong>Destination:</strong> {tracking.destination}</p>
            )}
            {tracking.eta && (
              <p><strong>Expected Delivery:</strong> {tracking.eta}</p>
            )}
            {tracking.trackingUrl && (
              <a href={tracking.trackingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                Track on Shiprocket
              </a>
            )}
          </div>

          {tracking.activities?.length > 0 && (
            <div className="order-details">
              <h3>Shipment Activity</h3>
              {tracking.activities.map((activity, index) => (
                <div key={index} className="detail-item">
                  <span>
                    <FiPackage /> {activity.activity || activity.status || 'Shipment update'}
                  </span>
                  <span>{activity.date || activity.time || activity.timestamp || ''}</span>
                </div>
              ))}
            </div>
          )}

          <div className="delivery-address">
            <h3><FiTruck /> Shipment Details</h3>
            <p>Order ID: {tracking.orderId}</p>
            <p>AWB Code: {tracking.awbCode}</p>
            {tracking.currentLocation && (
              <p><FiMapPin /> {tracking.currentLocation}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
