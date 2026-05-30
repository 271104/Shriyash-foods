import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiPhone, FiMessageCircle, FiLoader, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './OTPModal.css';

const OTPModal = ({ 
  isOpen, 
  onClose, 
  phone, 
  setPhone, 
  purpose = 'login',
  onSuccess,
  guestData = null,
  userData = null,
  title = 'Verify Your Phone Number'
}) => {
  const { sendOTP, verifyOTPAndLogin } = useAuth();
  
  const [step, setStep] = useState('phone'); // 'phone', 'registration_form', or 'otp'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [userExists, setUserExists] = useState(false);
  const [currentMode, setCurrentMode] = useState(purpose); // 'login' or 'register'
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Registration form fields
  const [regForm, setRegForm] = useState({
    name: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: ''
  });
  
  const otpRefs = useRef([]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setOtp(['', '', '', '', '', '']);
      setResendTimer(0);
      setUserExists(false);
      setCurrentMode(purpose);
      setErrorMessage(null);
      setRegForm({
        name: '',
        phone: '',
        email: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        pincode: ''
      });
    }
  }, [isOpen, purpose]);

  // Handle registration form input
  const handleRegFormChange = (e) => {
    const { name, value } = e.target;
    setRegForm(prev => ({
      ...prev,
      [name]: name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : name === 'pincode' ? value.replace(/\D/g, '').slice(0, 6) : value
    }));
  };

  // Validate registration form
  const validateRegForm = () => {
    if (!regForm.name.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (regForm.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(regForm.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!regForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!regForm.addressLine1.trim()) {
      toast.error('Please enter address line 1');
      return false;
    }
    if (!regForm.city.trim()) {
      toast.error('Please enter city');
      return false;
    }
    if (!regForm.state.trim()) {
      toast.error('Please enter state');
      return false;
    }
    if (!/^\d{6}$/.test(regForm.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  // Handle registration form submission
  const handleRegFormSubmit = (e) => {
    e.preventDefault();
    if (!validateRegForm()) return;

    setPhone(regForm.phone);
    setLoading(true);
    setErrorMessage(null);

    // Send OTP with registration form data
    sendOTP(regForm.phone, 'register')
      .then(result => {
        setUserExists(result.userExists);
        setStep('otp');
        setResendTimer(60);
        toast.success('OTP sent to your WhatsApp number');
        setTimeout(() => {
          otpRefs.current[0]?.focus();
        }, 100);
      })
      .catch(error => {
        const errorMsg = error.message || 'Failed to send OTP';
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
      })
      .finally(() => setLoading(false));
  };

  // Handle phone step submission
  // Now handled inline in the button onClick

  // Resend timer
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Auto-focus next OTP input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1); // Take only the last character
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSendOTP = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await sendOTP(phone, currentMode);
      setUserExists(result.userExists);
      setStep('otp');
      setResendTimer(60); // 60 seconds cooldown
      toast.success('OTP sent to your WhatsApp number');
      
      // Auto-focus first OTP input
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } catch (error) {
      const errorMsg = error.message || 'Failed to send OTP';
      setErrorMessage(errorMsg);
      
      // If user tries to login but account doesn't exist, show register option
      if (currentMode === 'login' && errorMsg.includes('No account found')) {
        setErrorMessage(errorMsg);
      }
      // If user tries to register but account exists, show login option
      else if (currentMode === 'register' && errorMsg.includes('already registered')) {
        setErrorMessage(errorMsg);
      }
      
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otpValue = otp.join('')) => {
    if (otpValue.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      // For registration, pass the registration form data as userData
      const dataToPass = currentMode === 'register' ? regForm : userData;
      const result = await verifyOTPAndLogin(phone, otpValue, currentMode, guestData, dataToPass);
      toast.success(result.message);
      onSuccess && onSuccess(result);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Invalid OTP');
      // Clear OTP on error
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
      await sendOTP(phone, currentMode);
      setResendTimer(60);
      toast.success('OTP resent successfully');
      // Clear current OTP
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="otp-modal-overlay" onClick={onClose}>
      <div className="otp-modal" onClick={e => e.stopPropagation()}>
        <div className="otp-modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="otp-modal-body">
          {step === 'phone' ? (
            <div className="phone-step">
              <div className="step-icon">
                <FiPhone />
              </div>
              <p>Enter your phone number to receive OTP</p>
              
              <div className="phone-input-group">
                <span className="country-code">+91</span>
                <input
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength="10"
                  className="phone-input"
                  autoFocus
                />
              </div>

              {/* Mode Toggle */}
              <div className="mode-toggle">
                <button 
                  className={`toggle-btn ${currentMode === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentMode('login');
                    setStep('phone');
                    setErrorMessage(null);
                  }}
                >
                  Login
                </button>
                <button 
                  className={`toggle-btn ${currentMode === 'register' ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentMode('register');
                    setStep('phone');
                    setErrorMessage(null);
                  }}
                >
                  Register
                </button>
              </div>

              {errorMessage && (
                <div className="error-message">
                  <p>{errorMessage}</p>
                  {errorMessage.includes('No account found') && currentMode === 'login' && (
                    <p className="help-text">
                      👉 <strong>Don't have an account?</strong> Click the "Register" button above to create one!
                    </p>
                  )}
                  {errorMessage.includes('already registered') && currentMode === 'register' && (
                    <p className="help-text">
                      👉 <strong>Already have an account?</strong> Click the "Login" button above!
                    </p>
                  )}
                </div>
              )}

              <button 
                className="btn btn-primary btn-block"
                onClick={() => {
                  if (currentMode === 'register') {
                    // For registration, go to registration form
                    if (!/^[6-9]\d{9}$/.test(phone)) {
                      toast.error('Please enter a valid 10-digit phone number');
                      return;
                    }
                    setStep('registration_form');
                    setRegForm(prev => ({ ...prev, phone: phone }));
                  } else {
                    // For login, send OTP directly
                    handleSendOTP();
                  }
                }}
                disabled={loading || phone.length !== 10}
              >
                {loading ? (
                  <>
                    <FiLoader className="spinner" />
                    {currentMode === 'register' ? 'Continue...' : 'Sending OTP...'}
                  </>
                ) : (
                  currentMode === 'register' ? 'Continue' : 'Send OTP'
                )}
              </button>

              <div className="otp-info">
                <FiMessageCircle />
                <span>OTP will be sent via WhatsApp</span>
              </div>
            </div>
          ) : step === 'registration_form' ? (
            <form className="registration-form" onSubmit={handleRegFormSubmit}>
              <div className="step-icon">
                <FiUser />
              </div>
              <h3>Complete Your Registration</h3>
              <p>Enter your details to create an account</p>

              {/* Name */}
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={regForm.name}
                  onChange={handleRegFormChange}
                  required
                />
              </div>

              {/* Phone (Read-only) */}
              <div className="form-group">
                <label>Phone Number *</label>
                <div className="phone-display">
                  <span>+91 {regForm.phone}</span>
                  <button 
                    type="button" 
                    className="change-link"
                    onClick={() => {
                      setStep('phone');
                      setRegForm(prev => ({ ...prev, phone: '' }));
                      setPhone('');
                    }}
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={regForm.email}
                  onChange={handleRegFormChange}
                  required
                />
              </div>

              {/* Address Line 1 */}
              <div className="form-group">
                <label>Address Line 1 *</label>
                <input
                  type="text"
                  name="addressLine1"
                  placeholder="Street address"
                  value={regForm.addressLine1}
                  onChange={handleRegFormChange}
                  required
                />
              </div>

              {/* Address Line 2 */}
              <div className="form-group">
                <label>Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={regForm.addressLine2}
                  onChange={handleRegFormChange}
                />
              </div>

              {/* Landmark */}
              <div className="form-group">
                <label>Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  placeholder="Nearby landmark (optional)"
                  value={regForm.landmark}
                  onChange={handleRegFormChange}
                />
              </div>

              {/* City */}
              <div className="form-group form-row">
                <div>
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={regForm.city}
                    onChange={handleRegFormChange}
                    required
                  />
                </div>
                {/* State */}
                <div>
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={regForm.state}
                    onChange={handleRegFormChange}
                    required
                  />
                </div>
              </div>

              {/* Pincode */}
              <div className="form-group">
                <label>Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  placeholder="6-digit pincode"
                  value={regForm.pincode}
                  onChange={(e) => handleRegFormChange({ target: { name: 'pincode', value: e.target.value.replace(/\D/g, '').slice(0, 6) } })}
                  maxLength="6"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FiLoader className="spinner" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>

              <button 
                type="button"
                className="back-btn"
                onClick={() => setStep('phone')}
                disabled={loading}
              >
                Back to Phone Entry
              </button>
            </form>
          ) : (
            <div className="otp-step">
              <div className="step-icon">
                <FiMessageCircle />
              </div>
              <p>
                Enter the 6-digit OTP sent to<br />
                <strong>+91 {phone}</strong>
              </p>
              
              {userExists && purpose === 'login' && (
                <div className="welcome-back">
                  Welcome back! 👋
                </div>
              )}

              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => otpRefs.current[index] = el}
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
                className="btn btn-primary btn-block"
                onClick={() => handleVerifyOTP()}
                disabled={loading || otp.some(digit => !digit)}
              >
                {loading ? (
                  <>
                    <FiLoader className="spinner" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>

              <div className="resend-section">
                {resendTimer > 0 ? (
                  <span className="resend-timer">
                    Resend OTP in {resendTimer}s
                  </span>
                ) : (
                  <button 
                    className="resend-btn"
                    onClick={handleResendOTP}
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button 
                className="change-number-btn"
                onClick={() => setStep('phone')}
                disabled={loading}
              >
                Change Phone Number
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPModal;
