import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiPhone, FiMessageCircle, FiLoader } from 'react-icons/fi';
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
  
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [userExists, setUserExists] = useState(false);
  const [currentMode, setCurrentMode] = useState(purpose); // 'login' or 'register'
  const [errorMessage, setErrorMessage] = useState(null);
  
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
    }
  }, [isOpen, purpose]);

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
      const result = await verifyOTPAndLogin(phone, otpValue, currentMode, guestData, userData);
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
                onClick={handleSendOTP}
                disabled={loading || phone.length !== 10}
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

              <div className="otp-info">
                <FiMessageCircle />
                <span>OTP will be sent via WhatsApp</span>
              </div>
            </div>
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
