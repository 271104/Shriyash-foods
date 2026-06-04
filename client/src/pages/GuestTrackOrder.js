import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiPhone, FiPackage, FiLoader, FiCheck, FiX, FiArrowRight } from 'react-icons/fi';
import TrackingTimeline from '../components/TrackingTimeline';
import OrderDownloads from '../components/OrderDownloads';
import './GuestTrackOrder.css';

const GuestTrackOrder = () => {
  // Step 1: Enter phone and order ID
  const [step, setStep] = useState(1); // 1: Enter details, 2: OTP verification, 3: View order
  const [phone, setPhone] = useState('');
  const [orderId, setOrderId] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [otpExpiry, setOtpExpiry] = useState(null);

  // Extract orderId from URL if present
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlOrderId = params.get('orderId');
    if (urlOrderId) {
      setOrderId(urlOrderId);
    }
  }, []);

  // Request OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!phone || !orderId) {
      toast.error('Please enter both phone number and order ID');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/track-guest/send-otp', {
        phone,
        orderId
      });

      if (response.data.success) {
        toast.success('OTP sent to your WhatsApp! ✅');
        setStep(2);
        setOtpExpiry(Date.now() + response.data.expiresIn * 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
      console.error('OTP send error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and get order details
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/track-guest/verify-otp', {
        phone,
        orderId,
        otp
      });

      if (response.data.success) {
        setOrder(response.data.order);
        setAccessToken(response.data.accessToken);
        setStep(3);
        toast.success('Order found! ✅');
      }
    } catch (error) {
      if (error.response?.data?.attemptsRemaining) {
        toast.error(`Invalid OTP. ${error.response.data.attemptsRemaining} attempts remaining`);
      } else {
        toast.error(error.response?.data?.message || 'Failed to verify OTP');
      }
      console.error('OTP verify error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setOtp('');
    await handleSendOTP({ preventDefault: () => {} });
  };

  // Check if OTP expired
  const isOtpExpired = otpExpiry && Date.now() > otpExpiry;

  return (
    <div className="guest-track-container">
      <div className="guest-track-header">
        <h1>📦 Track Your Order</h1>
        <p>Enter your details to track your Shriyash Foods order</p>
      </div>

      <div className="track-content">
        {/* Step 1: Enter Details */}
        {step === 1 && (
          <div className="track-step step-1">
            <div className="step-indicator">
              <div className="step-number active">1</div>
              <div className="step-label">Enter Details</div>
            </div>

            <form onSubmit={handleSendOTP} className="track-form">
              <div className="form-group">
                <label htmlFor="phone">
                  <FiPhone /> Phone Number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  maxLength="10"
                  pattern="[0-9]{10}"
                  required
                  disabled={loading}
                />
                <small>The phone number used during checkout</small>
              </div>

              <div className="form-group">
                <label htmlFor="orderId">
                  <FiPackage /> Order ID *
                </label>
                <input
                  id="orderId"
                  type="text"
                  placeholder="e.g., SHR177994037215"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                  required
                  disabled={loading}
                />
                <small>Check your confirmation email or WhatsApp message</small>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FiLoader className="spinner" /> Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP <FiArrowRight />
                  </>
                )}
              </button>
            </form>

            {/* Info Box */}
            <div className="info-box">
              <h4>💡 How it works:</h4>
              <ul>
                <li>Enter the phone number you used during checkout</li>
                <li>Enter your Order ID from your confirmation email</li>
                <li>We'll send you an OTP via WhatsApp</li>
                <li>Verify to see full tracking details</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <div className="track-step step-2">
            <div className="step-indicator">
              <div className="step-number active">2</div>
              <div className="step-label">Verify OTP</div>
            </div>

            <form onSubmit={handleVerifyOTP} className="track-form">
              <div className="otp-info">
                <p>✅ OTP sent to <strong>{phone}</strong></p>
                {isOtpExpired ? (
                  <p className="expired">⏰ OTP expired. Request a new one.</p>
                ) : (
                  <p className="timer">⏱️ Expires in 5 minutes</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="otp">Enter 6-Digit OTP *</label>
                <input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                  disabled={loading || isOtpExpired}
                  autoFocus
                  className="otp-input"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || isOtpExpired || otp.length !== 6}
              >
                {loading ? (
                  <>
                    <FiLoader className="spinner" /> Verifying...
                  </>
                ) : (
                  <>
                    <FiCheck /> Verify OTP
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={handleResendOTP}
                disabled={loading || !isOtpExpired}
              >
                Resend OTP
              </button>

              <button
                type="button"
                className="btn btn-link"
                onClick={() => {
                  setStep(1);
                  setPhone('');
                  setOrderId('');
                  setOtp('');
                }}
              >
                ← Back
              </button>
            </form>
          </div>
        )}

        {/* Step 3: View Order */}
        {step === 3 && order && (
          <div className="track-step step-3">
            <div className="order-header">
              <div>
                <h2>Order {order.orderId}</h2>
                <p className="order-date">
                  Placed on {new Date(order.orderDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className={`status-badge status-${order.status.toLowerCase()}`}>
                {order.status}
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="quick-info">
              <div className="info-card">
                <span className="label">Payment Status</span>
                <span className={`value ${order.paymentStatus.toLowerCase()}`}>
                  {order.paymentStatus === 'PAID' ? '✅' : '⏳'} {order.paymentStatus}
                </span>
              </div>
              <div className="info-card">
                <span className="label">Total Amount</span>
                <span className="value">₹{order.pricing.total}</span>
              </div>
              <div className="info-card">
                <span className="label">Delivery Address</span>
                <span className="value">{order.shippingAddress.pincode}</span>
              </div>
            </div>

            {/* Tracking Timeline */}
            <TrackingTimeline order={order} />

            {/* Shipment Info */}
            {order.awbCode && (
              <div className="shipment-info">
                <h3>📦 Shipment Details</h3>
                <div className="info-grid">
                  <div>
                    <strong>Courier:</strong>
                    <p>{order.courierName || 'Assigned'}</p>
                  </div>
                  <div>
                    <strong>Tracking No:</strong>
                    <p>{order.awbCode}</p>
                  </div>
                  {order.trackingUrl && (
                    <div>
                      <strong>Courier Tracking:</strong>
                      <p>
                        <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                          View on Courier Site →
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Items Ordered */}
            <div className="items-section">
              <h3>📋 Items Ordered</h3>
              <div className="items-list">
                {order.items.map((item, idx) => (
                  <div key={idx} className="item">
                    <div>
                      <p className="item-name">{item.name}</p>
                      {item.variant && <p className="item-variant">{item.variant}</p>}
                    </div>
                    <div className="item-qty">
                      <p>Qty: {item.quantity}</p>
                      <p className="item-price">₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Options */}
            <OrderDownloads order={order} />

            {/* Delivery Address */}
            <div className="address-section">
              <h3>🏠 Delivery Address</h3>
              <div className="address-box">
                <p><strong>{order.shippingAddress.fullName}</strong></p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                {order.shippingAddress.landmark && (
                  <p>Near: {order.shippingAddress.landmark}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
                <p>📱 {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setStep(1);
                  setPhone('');
                  setOrderId('');
                  setOtp('');
                  setOrder(null);
                  setAccessToken('');
                }}
              >
                ← Track Another Order
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const message = `Hi, I'm tracking order ${order.orderId}. Can you help?`;
                  const whatsappUrl = `https://wa.me/918806735220?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                }}
              >
                💬 Contact Support
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestTrackOrder;
