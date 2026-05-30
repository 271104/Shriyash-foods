import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiMessageCircle,
  FiLoader,
  FiArrowLeft
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Auth.css';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { sendOTP, verifyOTPAndLogin } = useAuth();

  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === 'phone') {
      nextValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'pincode') {
      nextValue = value.replace(/\D/g, '').slice(0, 6);
    }

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const validateForm = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit WhatsApp number');
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!formData.addressLine1.trim()) {
      toast.error('Please enter your street address');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('Please enter your city');
      return false;
    }
    if (!formData.state.trim()) {
      toast.error('Please enter your state');
      return false;
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await sendOTP(formData.phone, 'register');
      setStep('otp');
      setResendTimer(60);
      toast.success('OTP sent to your WhatsApp number');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.length > 1 ? value.slice(-1) : value;
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpValue = otp.join('')) => {
    if (otpValue.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOTPAndLogin(
        formData.phone,
        otpValue,
        'register',
        null,
        formData
      );
      toast.success(result.message || 'Account created successfully!');
      navigate('/products');
    } catch (error) {
      toast.error(error.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    try {
      await sendOTP(formData.phone, 'register');
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      toast.success('OTP resent to your WhatsApp');
      otpRefs.current[0]?.focus();
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <div className="auth-container register-container">
        <div className="auth-left">
          <div className="auth-brand">
            <img src="/Logo.png" alt="Shriyash Foods" className="brand-logo" />
            <h2>SHRIYASH FOODS</h2>
            <p>Create your account in minutes</p>
            <div className="auth-features">
              <div className="feature-item">
                <span className="feature-check">OK</span>
                <span>Secure WhatsApp OTP verification</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">OK</span>
                <span>Save address for faster checkout</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">OK</span>
                <span>Track orders anytime</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right register-right">
          {step === 'form' ? (
            <div className="register-form-container">
              <h1 className="register-title">Create Your Account</h1>
              <p className="register-subtitle">
                Fill in your details. We will verify your phone via WhatsApp OTP.
              </p>

              <form onSubmit={handleFormSubmit} className="auth-form register-form">
                <div className="form-group">
                  <label><FiUser /> Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label><FiMail /> Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@gmail.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label><FiPhone /> WhatsApp Number *</label>
                  <div className="phone-input-group register-phone-group">
                    <span className="country-code">+91</span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      required
                    />
                  </div>
                </div>

                <div className="address-section">
                  <h3><FiMapPin /> Delivery Address</h3>

                  <div className="form-group">
                    <label>Address Line 1 *</label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      placeholder="House no., street, area"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Address Line 2</label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      placeholder="Apartment, suite (optional)"
                    />
                  </div>

                  <div className="form-group">
                    <label>Landmark</label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      placeholder="Nearby landmark (optional)"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="6-digit pincode"
                      maxLength="6"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? (
                    <>
                      <FiLoader className="spinner" /> Sending OTP...
                    </>
                  ) : (
                    'Create Account & Send OTP'
                  )}
                </button>

                <div className="register-otp-note">
                  <FiMessageCircle />
                  <span>OTP will be sent via WhatsApp to verify your number</span>
                </div>
              </form>

              <div className="auth-footer">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="link-btn">Login here</Link>
                </p>
                <Link to="/products" className="guest-link">Continue as Guest →</Link>
              </div>
            </div>
          ) : (
            <div className="register-otp-step">
              <button
                type="button"
                className="back-to-form-btn"
                onClick={() => setStep('form')}
                disabled={loading}
              >
                <FiArrowLeft /> Edit Details
              </button>

              <div className="otp-step-header">
                <div className="step-icon-inline">
                  <FiMessageCircle />
                </div>
                <h2>Verify Your Phone</h2>
                <p>
                  Enter the 6-digit OTP sent to WhatsApp<br />
                  <strong>+91 {formData.phone}</strong>
                </p>
              </div>

              <div className="otp-inputs register-otp-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="otp-input"
                  />
                ))}
              </div>

              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => handleVerifyOTP()}
                disabled={loading || otp.some((digit) => !digit)}
              >
                {loading ? (
                  <>
                    <FiLoader className="spinner" /> Verifying...
                  </>
                ) : (
                  'Verify & Create Account'
                )}
              </button>

              <div className="resend-section">
                {resendTimer > 0 ? (
                  <span className="resend-timer">Resend OTP in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    className="resend-btn"
                    onClick={handleResendOTP}
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
