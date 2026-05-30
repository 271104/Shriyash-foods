import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPhone } from 'react-icons/fi';
import OTPModal from '../components/OTPModal';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setShowOTPModal(true);
  };

  const handleOTPSuccess = () => {
    toast.success('Welcome back!');
    navigate('/products');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <img src="/Logo.png" alt="Shriyash Foods" className="brand-logo" />
            <h2>SHRIYASH FOODS</h2>
            <p>Pure & Natural Health Powders</p>
            <div className="auth-features">
              <div className="feature-item">
                <span className="feature-check">OK</span>
                <span>100% Natural Products</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">OK</span>
                <span>FSSAI Certified</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">OK</span>
                <span>Shiprocket Delivery Rates</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-container">
            <h1 className="login-title">Login to Your Account</h1>
            <p className="login-subtitle">Enter your WhatsApp number to receive OTP</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>
                  <FiPhone /> WhatsApp Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  pattern="[6-9][0-9]{9}"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block">
                Send Login OTP
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Don&apos;t have an account?{' '}
                <Link to="/register" className="link-btn">Create Account</Link>
              </p>
              <Link to="/products" className="guest-link">
                Continue as Guest →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        phone={phone}
        setPhone={setPhone}
        purpose="login"
        onSuccess={handleOTPSuccess}
        title="Login with WhatsApp OTP"
      />
    </div>
  );
};

export default Login;
