import React, { useState } from 'react';
import { FiX, FiUser, FiShoppingCart, FiClock } from 'react-icons/fi';
import OTPModal from './OTPModal';
import './CheckoutAuthModal.css';

const CheckoutAuthModal = ({ 
  isOpen, 
  onClose, 
  onGuestCheckout, 
  onLoginSuccess 
}) => {
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [authType, setAuthType] = useState(''); // 'guest' or 'login'

  const handleGuestCheckout = () => {
    setAuthType('guest');
    setShowOTPModal(true);
  };

  const handleLogin = () => {
    setAuthType('login');
    setShowOTPModal(true);
  };

  const handleOTPSuccess = (result) => {
    setShowOTPModal(false);
    
    if (authType === 'guest') {
      onGuestCheckout && onGuestCheckout(result);
    } else {
      onLoginSuccess && onLoginSuccess(result);
    }
    
    onClose();
  };

  const handleOTPModalClose = () => {
    setShowOTPModal(false);
    setAuthType('');
    setPhone('');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="checkout-auth-overlay" onClick={onClose}>
        <div className="checkout-auth-modal" onClick={e => e.stopPropagation()}>
          <div className="checkout-auth-header">
            <h2>Choose Checkout Option</h2>
            <button className="close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>

          <div className="checkout-auth-body">
            <p className="checkout-auth-subtitle">
              How would you like to proceed with your order?
            </p>

            <div className="auth-options">
              <div className="auth-option guest-option" onClick={handleGuestCheckout}>
                <div className="option-icon">
                  <FiShoppingCart />
                </div>
                <div className="option-content">
                  <h3>Continue as Guest</h3>
                  <p>Quick checkout with OTP verification</p>
                  <ul className="option-features">
                    <li><FiClock /> Faster checkout process</li>
                    <li>📱 OTP verification for security</li>
                    <li>📧 Order confirmation via email/SMS</li>
                  </ul>
                </div>
                <div className="option-badge recommended">
                  Recommended
                </div>
              </div>

              <div className="auth-divider">
                <span>OR</span>
              </div>

              <div className="auth-option login-option" onClick={handleLogin}>
                <div className="option-icon">
                  <FiUser />
                </div>
                <div className="option-content">
                  <h3>Login to Your Account</h3>
                  <p>Access saved addresses and order history</p>
                  <ul className="option-features">
                    <li>🏠 Saved delivery addresses</li>
                    <li>📋 Order history & tracking</li>
                    <li>⚡ Faster future checkouts</li>
                    <li>❤️ Wishlist & preferences</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="checkout-auth-footer">
              <p className="security-note">
                🔒 Your phone number will be verified via OTP for security
              </p>
            </div>
          </div>
        </div>
      </div>

      <OTPModal
        isOpen={showOTPModal}
        onClose={handleOTPModalClose}
        phone={phone}
        setPhone={setPhone}
        purpose={authType === 'guest' ? 'checkout_guest' : 'login'}
        onSuccess={handleOTPSuccess}
        title={authType === 'guest' ? 'Guest Checkout Verification' : 'Login to Your Account'}
      />
    </>
  );
};

export default CheckoutAuthModal;
