import React from 'react';
import {
  FiPackage,
  FiCheckCircle,
  FiTruck,
  FiMapPin,
  FiAlertCircle,
  FiRotateCcw,
  FiClock,
  FiX
} from 'react-icons/fi';
import './TrackingTimeline.css';

const TrackingTimeline = ({ order }) => {
  // Timeline step definitions
  const timelineSteps = [
    { status: 'PENDING', label: 'Order Placed', icon: FiPackage, color: '#667eea' },
    { status: 'CONFIRMED', label: 'Confirmed', icon: FiCheckCircle, color: '#4caf50' },
    { status: 'PROCESSING', label: 'Processing', icon: FiClock, color: '#ff9800' },
    { status: 'SHIPMENT_CREATED', label: 'Shipped', icon: FiTruck, color: '#2196f3' },
    { status: 'PICKUP_GENERATED', label: 'Pickup Ready', icon: FiMapPin, color: '#9c27b0' },
    { status: 'IN_TRANSIT', label: 'In Transit', icon: FiTruck, color: '#2196f3' },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: FiMapPin, color: '#00bcd4' },
    { status: 'DELIVERED', label: 'Delivered', icon: FiCheckCircle, color: '#4caf50' },
    { status: 'CANCELLED', label: 'Cancelled', icon: FiX, color: '#f44336' },
    { status: 'RTO', label: 'Returned', icon: FiRotateCcw, color: '#ff9800' },
    { status: 'FAILED_ATTEMPT', label: 'Failed Attempt', icon: FiAlertCircle, color: '#f44336' }
  ];

  // Get unique statuses from history
  const completedStatuses = new Set(
    order.statusHistory?.map(h => h.status) || []
  );

  // Sort history by timestamp (newest first for reverse display)
  const sortedHistory = [...(order.statusHistory || [])].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Determine current step
  const currentStatus = order.shippingStatus || order.orderStatus;
  const currentStepIndex = timelineSteps.findIndex(s => s.status === currentStatus);

  // Format date/time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateStr;
    if (date.toDateString() === today.toDateString()) {
      dateStr = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateStr = 'Yesterday';
    } else {
      dateStr = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }

    const timeStr = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return `${dateStr} at ${timeStr}`;
  };

  // Calculate time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="tracking-timeline">
      <h3 className="timeline-title">📍 Tracking Timeline</h3>

      {/* Visual Timeline */}
      <div className="timeline-visual">
        {timelineSteps.map((step, index) => {
          const isCompleted = completedStatuses.has(step.status);
          const isCurrent = index === currentStepIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.status}
              className={`timeline-item ${isCompleted ? 'completed' : ''} ${
                isCurrent ? 'current' : ''
              }`}
            >
              {/* Vertical line */}
              {index < timelineSteps.length - 1 && (
                <div
                  className={`timeline-line ${
                    isCompleted || isCurrent ? 'active' : ''
                  }`}
                  style={{ backgroundColor: step.color }}
                ></div>
              )}

              {/* Step node */}
              <div
                className="timeline-node"
                style={{
                  backgroundColor: isCompleted || isCurrent ? step.color : '#e0e0e0',
                  borderColor: step.color
                }}
              >
                <Icon
                  size={20}
                  color={isCompleted || isCurrent ? 'white' : '#999'}
                  strokeWidth={2}
                />
              </div>

              {/* Label */}
              <div className="timeline-label">
                <p className="label-name">{step.label}</p>
                {isCompleted && (
                  <p className="label-status">✓ Complete</p>
                )}
                {isCurrent && (
                  <p className="label-status current">● Current</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed History */}
      {sortedHistory.length > 0 && (
        <div className="timeline-history">
          <h4 className="history-title">📋 Status Updates</h4>
          <div className="history-list">
            {sortedHistory.map((entry, index) => {
              const stepInfo = timelineSteps.find(s => s.status === entry.status);
              const Icon = stepInfo?.icon || FiCheckCircle;

              return (
                <div key={index} className="history-item">
                  <div className="history-icon" style={{ color: stepInfo?.color || '#667eea' }}>
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <div className="history-content">
                    <div className="history-header">
                      <p className="history-status">{stepInfo?.label || entry.status}</p>
                      <p className="history-time">{formatTimeAgo(entry.timestamp)}</p>
                    </div>
                    <p className="history-date">{formatDateTime(entry.timestamp)}</p>
                    {entry.note && (
                      <p className="history-note">💬 {entry.note}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expected Delivery */}
      {order.estimatedDeliveryDate && (
        <div className="expected-delivery">
          <div className="delivery-icon">📦</div>
          <div className="delivery-content">
            <p className="delivery-label">Expected Delivery</p>
            <p className="delivery-date">
              {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      )}

      {/* Delivery Status Badges */}
      <div className="delivery-badges">
        {order.status === 'DELIVERED' && (
          <div className="badge delivered">
            ✅ Delivered Successfully
          </div>
        )}
        {order.status === 'CANCELLED' && (
          <div className="badge cancelled">
            ❌ Order Cancelled
          </div>
        )}
        {order.status === 'RTO' && (
          <div className="badge rto">
            🔄 Returned to Seller
          </div>
        )}
        {order.status === 'OUT_FOR_DELIVERY' && (
          <div className="badge out-for-delivery">
            🚚 Out for Delivery Today
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingTimeline;
