import React from 'react';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>SHRIYASH FOODS</h3>
            <p>Premium quality health powders for a healthier lifestyle</p>
          </div>
          
          <div className="footer-section">
            <h4>Contact Us</h4>
            <div className="contact-item">
              <FiPhone /> <span>9960243593</span>
            </div>
            <div className="contact-item">
              <FiMail /> <span>shriyashfoods01@gmail.com</span>
            </div>
            <div className="contact-item">
              <FiMapPin /> <span>Hyderabad Road, Vidi Gharkul</span>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <a href="/products">Products</a>
            <a href="/about">About Us</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2026 Shriyash Foods. All rights reserved.</p>
          <p>🔒 100% Secure Payment | ✓ FSSAI Certified</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
