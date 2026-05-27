import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMail, FiUser, FiPhone } from 'react-icons/fi';
import OTPModal from '../components/OTPModal';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    if (!isLogin && formData.name.trim().length < 2) {
      toast.error('Please enter your full name');
      return;
    }

    setShowOTPModal(true);
  };

  const handleOTPSuccess = () => {
    toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
    navigate('/products');
  };

  const switchMode = () => {
    setIsLogin(prev => !prev);
    setFormData({ name: '', phone: '', email: '' });
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
            <div className="auth-tabs">
              <button
                className={isLogin ? 'active' : ''}
                onClick={() => setIsLogin(true)}
                type="button"
              >
                Login
              </button>
              <button
                className={!isLogin ? 'active' : ''}
                onClick={() => setIsLogin(false)}
                type="button"
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="form-group">
                  <label>
                    <FiUser /> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>
                  <FiPhone /> WhatsApp Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  pattern="[6-9][0-9]{9}"
                  required
                />
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label>
                    <FiMail /> Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                  />
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block">
                {isLogin ? 'Send Login OTP' : 'Send Registration OTP'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button onClick={switchMode} className="link-btn" type="button">
                  {isLogin ? 'Register' : 'Login'}
                </button>
              </p>
              <Link to="/products" className="guest-link">
                Continue as Guest ->
              </Link>
            </div>
          </div>
        </div>
      </div>

      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        phone={formData.phone}
        setPhone={(phone) => setFormData(prev => ({ ...prev, phone }))}
        purpose={isLogin ? 'login' : 'register'}
        onSuccess={handleOTPSuccess}
        userData={!isLogin ? { name: formData.name, email: formData.email } : null}
        title={isLogin ? 'Login with WhatsApp OTP' : 'Verify and Create Account'}
      />
    </div>
  );
};

export default Login;
