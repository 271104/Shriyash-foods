import React from 'react';
import { FiFacebook, FiInstagram, FiMail, FiYoutube } from 'react-icons/fi';
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
              <a href="/" aria-label="Facebook"><FiFacebook /></a>
              <a href="/" aria-label="Instagram"><FiInstagram /></a>
              <a href="mailto:shriyashfoods01@gmail.com" aria-label="Email"><FiMail /></a>
              <a href="/" aria-label="YouTube"><FiYoutube /></a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <a href="/">Home</a>
            <a href="/products">Shop</a>
            <a href="/about">About Us</a>
            <a href="/contact">Contact Us</a>
          </div>

          <div className="footer-section">
            <h4>Customer Service</h4>
            <a href="/orders">Track Order</a>
            <a href="/shipping-policy">Shipping Policy</a>
            <a href="/refund-policy">Returns & Refund</a>
            <a href="/terms-conditions">Terms & Conditions</a>
            <a href="/privacy-policy">Privacy Policy</a>
          </div>

          <div className="footer-section">
            <h4>Categories</h4>
            <a href="/products">Vegetable Powders</a>
            <a href="/products">Fruit Powders</a>
            <a href="/products">Green Powders</a>
            <a href="/products">Spice Powders</a>
            <a href="/products">Superfood Powders</a>
            <a href="/products">Powder Mixes</a>
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
