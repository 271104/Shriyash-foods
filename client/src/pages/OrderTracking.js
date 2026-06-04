import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiExternalLink,
  FiLoader,
  FiPackage,
  FiSearch,
  FiTruck
} from 'react-icons/fi';
import API_BASE from '../config/api';
import './OrderTracking.css';

const formatDate = (value) => {
  if (!value) return 'Not available yet';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatTimelineDate = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const titleize = (value) => {
  if (!value) return 'Not updated yet';

  return String(value)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getTimelineItems = (tracking) => {
  const shippingLog = tracking?.shippingLog || [];
  const statusHistory = tracking?.statusHistory || [];
  const activities = tracking?.activities || [];

  const webhookItems = shippingLog.map((entry) => ({
    status: entry.status,
    message: entry.message || entry.status,
    location: entry.location || entry.currentLocation,
    timestamp: entry.timestamp
  }));

  const historyItems = statusHistory.map((entry) => ({
    status: entry.status,
    message: entry.note || entry.status,
    timestamp: entry.timestamp
  }));

  const activityItems = activities.map((entry) => ({
    status: entry.status || entry.activity,
    message: entry.activity || entry.status || 'Shipment update',
    location: entry.location,
    timestamp: entry.date || entry.time || entry.timestamp
  }));

  return [...webhookItems, ...activityItems, ...historyItems]
    .filter((entry) => entry.status || entry.message)
    .sort((a, b) => {
      const aTime = new Date(a.timestamp || 0).getTime();
      const bTime = new Date(b.timestamp || 0).getTime();
      return bTime - aTime;
    });
};

const OrderTracking = () => {
  const { orderId: routeOrderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialOrderId = routeOrderId || searchParams.get('orderId') || '';

  const [orderId, setOrderId] = useState(initialOrderId);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialOrderId));
  const [errorMessage, setErrorMessage] = useState('');

  const timelineItems = useMemo(() => getTimelineItems(tracking), [tracking]);

  useEffect(() => {
    if (initialOrderId) {
      fetchTracking(initialOrderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrderId]);

  const fetchTracking = async (trackingOrderId) => {
    const cleanOrderId = trackingOrderId.trim().toUpperCase();

    if (!cleanOrderId) {
      setErrorMessage('Please enter your Order ID');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const { data } = await axios.get(`${API_BASE}/orders/${cleanOrderId}/track`);
      setTracking(data);
      setOrderId(cleanOrderId);
      setErrorMessage('');
    } catch (error) {
      const message = error.response?.data?.message || 'Tracking details are not available right now';
      setTracking(null);
      setErrorMessage(message);
      console.error('Error fetching tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const cleanOrderId = orderId.trim().toUpperCase();

    if (!cleanOrderId) {
      setErrorMessage('Please enter your Order ID');
      return;
    }

    navigate(`/track-order?orderId=${encodeURIComponent(cleanOrderId)}`);
    fetchTracking(cleanOrderId);
  };

  const currentStatus = tracking?.shippingStatus || tracking?.status;
  const expectedDelivery = tracking?.expectedDeliveryDate || tracking?.estimatedDeliveryDate || tracking?.eta;
  const trackingUrl = tracking?.trackingUrl || tracking?.trackUrl;

  return (
    <div className="order-tracking-page">
      <div className="track-order-shell">
        <section className="track-order-hero">
          <div>
            <p className="eyebrow">Order Tracking</p>
            <h1>Track your Shriyash Foods order</h1>
            <p className="track-order-copy">
              Enter the Order ID from your confirmation message to see the latest shipment status.
            </p>
          </div>

          <form className="track-order-form" onSubmit={handleSubmit}>
            <label htmlFor="trackOrderId">Order ID</label>
            <div className="track-order-input-row">
              <input
                id="trackOrderId"
                type="text"
                value={orderId}
                onChange={(event) => setOrderId(event.target.value.toUpperCase())}
                placeholder="SHR1780565827243"
                disabled={loading}
                autoComplete="off"
              />
              <button type="submit" disabled={loading}>
                {loading ? <FiLoader className="spin" /> : <FiSearch />}
                <span>Track</span>
              </button>
            </div>
          </form>
        </section>

        {loading && (
          <div className="tracking-state">
            <FiLoader className="spin" />
            <p>Fetching tracking details...</p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="tracking-alert">
            <FiClock />
            <p>{errorMessage}</p>
          </div>
        )}

        {!loading && !hasSearched && (
          <div className="tracking-empty">
            <FiPackage />
            <p>Your tracking summary will appear here.</p>
          </div>
        )}

        {!loading && tracking && (
          <section className="tracking-result">
            <div className="tracking-summary">
              <div>
                <p className="summary-label">Current Status</p>
                <h2>{titleize(currentStatus)}</h2>
                <p className="summary-order">Order ID: {tracking.orderId}</p>
              </div>
              <div className="status-pill">{titleize(currentStatus)}</div>
            </div>

            <div className="tracking-grid">
              <div className="tracking-metric">
                <FiTruck />
                <span>Courier</span>
                <strong>{tracking.courier || 'Not assigned yet'}</strong>
              </div>
              <div className="tracking-metric">
                <FiPackage />
                <span>AWB</span>
                <strong>{tracking.awbCode || 'Not assigned yet'}</strong>
              </div>
              <div className="tracking-metric">
                <FiCalendar />
                <span>Expected Delivery</span>
                <strong>{formatDate(expectedDelivery)}</strong>
              </div>
            </div>

            {trackingUrl && (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shiprocket-button"
              >
                Track on Shiprocket
                <FiExternalLink />
              </a>
            )}

            <div className="tracking-timeline-panel">
              <div className="panel-heading">
                <h3>Tracking Timeline</h3>
                <p>{timelineItems.length ? 'Latest shipment updates' : 'Updates will appear after pickup'}</p>
              </div>

              {timelineItems.length > 0 ? (
                <div className="shipment-timeline">
                  {timelineItems.map((item, index) => (
                    <div className="shipment-timeline-item" key={`${item.status}-${item.timestamp}-${index}`}>
                      <div className="timeline-dot">
                        {index === 0 ? <FiArrowRight /> : <FiPackage />}
                      </div>
                      <div className="timeline-content">
                        <strong>{titleize(item.status || item.message)}</strong>
                        {item.message && <p>{titleize(item.message)}</p>}
                        {item.location && <span>{item.location}</span>}
                        {item.timestamp && <time>{formatTimelineDate(item.timestamp)}</time>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="timeline-placeholder">
                  <FiClock />
                  <p>No shipment events have been received yet.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
