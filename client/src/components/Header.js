import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { cartCount } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="header">
      <div className="header-main">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              <img src="/logo.png" alt="Shriyash Foods" className="logo-image" />
              <div className="logo-text">
                <span className="logo-name">SHRIYASH FOODS</span>
                <span className="logo-tagline">Pure by Nature, Nourished by Choice</span>
              </div>
            </Link>
            
            <button className="mobile-menu-btn" onClick={() => setShowMenu(!showMenu)}>
              {showMenu ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            
            <nav className={`nav ${showMenu ? 'nav-open' : ''}`}>
              <Link to="/" onClick={() => setShowMenu(false)}>Home</Link>
              <Link to="/products" onClick={() => setShowMenu(false)}>Products</Link>
              <Link to="/about" onClick={() => setShowMenu(false)}>About Us</Link>
              <Link to="/blogs" onClick={() => setShowMenu(false)}>Blogs</Link>
              <Link to="/contact" onClick={() => setShowMenu(false)}>Contact Us</Link>
              
              <div className="nav-icons">
                <Link to="/cart" className="cart-icon" onClick={() => setShowMenu(false)}>
                  <FiShoppingCart size={22} />
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Link>
                
                {user ? (
                  <div className="user-menu">
                    <button className="user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                      <FiUser size={22} />
                    </button>
                    {showUserMenu && (
                      <div className="user-dropdown">
                        <div className="user-info">
                          <strong>{user.name}</strong>
                          <span>{user.phone}</span>
                        </div>
                        <Link to="/orders" onClick={() => { setShowUserMenu(false); setShowMenu(false); }}>
                          My Orders
                        </Link>
                        <button onClick={() => { logout(); setShowUserMenu(false); setShowMenu(false); }}>
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/login" className="login-btn" onClick={() => setShowMenu(false)}>
                    <FiUser size={22} />
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
