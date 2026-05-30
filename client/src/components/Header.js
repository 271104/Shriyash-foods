import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiCheckCircle, FiDroplet, FiShield, FiHeadphones, FiHelpCircle, FiPhone } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import OTPModal from './OTPModal';
import './Header.css';

const Header = () => {
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [phone, setPhone] = useState('');

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setShowMenu(false);
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    setShowMenu(false);
  };

  return (
    <>
      <header className="header">
        <div className="header-top">
          <div className="container">
            <div className="header-top-content">
              <div className="header-top-group">
                <span><FiCheckCircle /> 100% Natural</span>
                <span><FiDroplet /> No Additives</span>
                <span><FiShield /> No Preservatives</span>
              </div>
              <div className="header-top-group">
                <Link to="/orders"><FiHeadphones /> Track Order</Link>
                <Link to="/contact"><FiHelpCircle /> Help</Link>
                <a href="tel:+919960243593"><FiPhone /> +91 9960243593</a>
              </div>
            </div>
          </div>
        </div>
        <div className="header-main">
          <div className="container">
            <div className="header-content">
              <Link to="/" className="logo">
                <img src="/Logo.png" alt="Shriyash Foods" className="logo-image" />
                <div className="logo-text">
                  <span className="logo-name">SHRIYASH FOODS</span>
                  <span className="logo-tagline">Pure by Nature, Nourished by Choice</span>
                </div>
              </Link>

              {/* Mobile Cart and Login Icons */}
              <div className="mobile-nav-icons">
                <Link to="/cart" className="mobile-cart-icon">
                  <FiShoppingCart size={20} />
                  {cartCount > 0 && <span className="mobile-cart-badge">{cartCount}</span>}
                </Link>

                {isAuthenticated ? (
                  <div className="user-menu">
                    <button 
                      className="mobile-login-icon" 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      style={{ background: 'var(--primary)', color: 'white' }}
                    >
                      <FiUser size={20} />
                    </button>
                    {showUserMenu && (
                      <div className="user-dropdown">
                        <div className="user-info">
                          <strong>{user?.name || 'User'}</strong>
                          <span>{user?.phone}</span>
                        </div>
                        <Link to="/orders" onClick={() => { setShowUserMenu(false); }}>
                          My Orders
                        </Link>
                        <Link to="/profile" onClick={() => { setShowUserMenu(false); }}>
                          Profile
                        </Link>
                        <button onClick={handleLogout}>
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className="mobile-login-icon"
                    onClick={() => setShowLoginModal(true)}
                  >
                    <FiUser size={20} />
                  </button>
                )}
              </div>
              
              <button className="mobile-menu-btn" onClick={() => setShowMenu(!showMenu)}>
                {showMenu ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
              
              <nav className={`nav ${showMenu ? 'nav-open' : ''}`}>
                <Link to="/" onClick={() => setShowMenu(false)}>Home</Link>
                <Link to="/products" onClick={() => setShowMenu(false)}>Products</Link>
                <Link to="/about" onClick={() => setShowMenu(false)}>About Us</Link>
                <Link to="/contact" onClick={() => setShowMenu(false)}>Contact Us</Link>
                
                <div className="nav-icons">
                  <Link to="/cart" className="cart-icon" onClick={() => setShowMenu(false)}>
                    <FiShoppingCart size={22} />
                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                  </Link>
                  
                  {isAuthenticated ? (
                    <div className="user-menu">
                      <button className="user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                        <FiUser size={22} />
                      </button>
                      {showUserMenu && (
                        <div className="user-dropdown">
                          <div className="user-info">
                            <strong>{user?.name || 'User'}</strong>
                            <span>{user?.phone}</span>
                          </div>
                          <Link to="/orders" onClick={() => { setShowUserMenu(false); setShowMenu(false); }}>
                            My Orders
                          </Link>
                          <Link to="/profile" onClick={() => { setShowUserMenu(false); setShowMenu(false); }}>
                            Profile
                          </Link>
                          <button onClick={handleLogout}>
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      className="login-btn"
                      onClick={() => setShowLoginModal(true)}
                    >
                      <FiUser size={22} />
                      <span>Login</span>
                    </button>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <OTPModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        phone={phone}
        setPhone={setPhone}
        purpose="login"
        onSuccess={handleLoginSuccess}
        title="Login to Your Account"
      />
    </>
  );
};

export default Header;
