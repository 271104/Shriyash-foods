import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useContext(AuthContext);
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // OTP verification disabled - direct registration/login
    // if (!isLogin && !isPhoneVerified) {
    //   // Send OTP
    //   setLoading(true);
    //   try {
    //     const { data } = await axios.post('/api/otp/send', { phone: formData.phone });
    //     if (data.success) {
    //       toast.success('OTP sent to your WhatsApp!');
    //       setShowOTP(true);
    //     }
    //   } catch (error) {
    //     toast.error(error.response?.data?.message || 'Failed to send OTP');
    //   } finally {
    //     setLoading(false);
    //   }
    //   return;
    // }

    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.phone, formData.password);
        toast.success('Welcome back!');
      } else {
        await register(formData);
        toast.success('Account created successfully!');
      }
      navigate('/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
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
                <span className="feature-check">✓</span>
                <span>100% Natural Products</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <span>FSSAI Certified</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <span>Free Shipping Above ₹500</span>
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
              >
                Login
              </button>
              <button 
                className={!isLogin ? 'active' : ''} 
                onClick={() => setIsLogin(false)}
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
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="form-group">
                <label>
                  <FiPhone /> Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  pattern="[0-9]{10}"
                  required
                />
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label>
                    <FiMail /> Email (Optional)
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

              <div className="form-group">
                <label>
                  <FiLock /> Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  minLength="6"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => setIsLogin(!isLogin)} className="link-btn">
                  {isLogin ? 'Register' : 'Login'}
                </button>
              </p>
              <Link to="/products" className="guest-link">
                Continue as Guest →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
