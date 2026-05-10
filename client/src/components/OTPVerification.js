import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import './OTPVerification.css';

const OTPVerification = ({ phone, onVerified, onCancel }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post('/api/otp/verify', {
        phone,
        otp: otpValue
      });

      if (data.success) {
        toast.success('Phone number verified successfully!');
        onVerified();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      const { data } = await axios.post('/api/otp/resend', { phone });
      if (data.success) {
        toast.success('OTP resent successfully!');
        setResendTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-verification-overlay">
      <div className="otp-verification-modal">
        <h2>Verify Your Phone Number</h2>
        <p className="otp-subtitle">
          We've sent a 6-digit code to your WhatsApp
          <br />
          <strong>{phone}</strong>
        </p>

        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="otp-input"
              disabled={loading}
            />
          ))}
        </div>

        <div className="otp-actions">
          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className="btn btn-primary btn-block"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="otp-resend">
            {canResend ? (
              <button onClick={handleResend} className="link-btn" disabled={loading}>
                Resend OTP
              </button>
            ) : (
              <span>Resend OTP in {resendTimer}s</span>
            )}
          </div>

          <button onClick={onCancel} className="link-btn" disabled={loading}>
            Change Phone Number
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
