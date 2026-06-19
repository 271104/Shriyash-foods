import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiMail } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <img src="/Logo.png" alt="Shriyash Foods" />
            <p>Pure by Nature,</p>
            <p>Nourished by Choice.</p>
            <div className="footer-socials">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FiFacebook /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FiInstagram /></a>
              <a href="mailto:shriyashfoods01@gmail.com" aria-label="Email"><FiMail /></a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/products">Shop</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
          </div>

          <div className="footer-section">
            <h4>Customer Service</h4>
            <Link to="/orders">Track Order</Link>
            <Link to="/shipping-policy">Shipping Policy</Link>
            <Link to="/refund-policy">Returns & Refund</Link>
            <Link to="/terms-conditions">Terms & Conditions</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
          </div>

          <div className="footer-section">
            <h4>Categories</h4>
            <Link to="/products#vegetables">Vegetable Powders</Link>
            <Link to="/products#fruits">Fruit Powders</Link>
            <Link to="/products#green-powder">Green Powders</Link>
          </div>

          <div className="footer-newsletter">
            <h4>Newsletter</h4>
            <p>Subscribe to get updates on new products & offers.</p>
            <form>
              <input type="email" placeholder="Enter your email" aria-label="Email address" />
              <button type="submit">Subscribe</button>
            </form>
            <div className="payment-row">
              <span>UPI</span>
              <span>VISA</span>
              <span className="payment-dot mastercard"></span>
              <span>RuPay</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
