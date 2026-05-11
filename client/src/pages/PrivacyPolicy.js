import React from 'react';
import './PolicyPages.css';

const PrivacyPolicy = () => {
  return (
    <div className="policy-page">
      <div className="container">
        <div className="policy-header">
          <h1>Privacy Policy</h1>
          <p className="effective-date">Effective Date: January 1, 2025</p>
        </div>

        <div className="policy-content">
          <p className="intro">Welcome to Shriyash Foods. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our website and purchase our products.</p>

          <section>
            <h2>1. Information We Collect</h2>
            <p>When you use our website or place an order, we may collect:</p>
            
            <h3>Personal Information</h3>
            <ul>
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Shipping and billing address</li>
              <li>Postal code</li>
            </ul>

            <h3>Order Information</h3>
            <ul>
              <li>Products purchased</li>
              <li>Order details</li>
              <li>Transaction details</li>
            </ul>

            <h3>Technical Information</h3>
            <ul>
              <li>Browser type</li>
              <li>Device information</li>
              <li>IP address</li>
              <li>Cookies and usage analytics</li>
            </ul>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Process and deliver your orders</li>
              <li>Provide customer support</li>
              <li>Communicate order confirmations and shipping updates</li>
              <li>Handle refund and cancellation requests</li>
              <li>Improve our website and customer experience</li>
              <li>Prevent fraud or unauthorized transactions</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2>3. Payment Security</h2>
            <p>All payments on our website are processed securely through trusted payment gateway providers such as Razorpay.</p>
            <p>We do not store your debit card, credit card, UPI PIN, CVV, or banking credentials on our servers.</p>
          </section>

          <section>
            <h2>4. Cookies</h2>
            <p>Our website may use cookies and similar technologies to improve browsing experience, remember preferences, and analyze website traffic.</p>
            <p>You may disable cookies through your browser settings if preferred.</p>
          </section>

          <section>
            <h2>5. Data Protection</h2>
            <p>We take reasonable security measures to protect your personal information from unauthorized access, misuse, or disclosure.</p>
            <p>However, no online system can guarantee complete security.</p>
          </section>

          <section>
            <h2>6. Sharing of Information</h2>
            <p>We do not sell or rent your personal information.</p>
            <p>We may share limited information with:</p>
            <ul>
              <li>Delivery partners</li>
              <li>Payment service providers</li>
              <li>Technical service providers</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section>
            <h2>7. Your Rights</h2>
            <p>You may contact us to:</p>
            <ul>
              <li>Update your information</li>
              <li>Request correction of inaccurate data</li>
              <li>Ask questions regarding your privacy</li>
            </ul>
          </section>

          <section>
            <h2>8. Contact Us</h2>
            <p>For privacy-related concerns:</p>
            <div className="contact-info">
              <p><strong>Shriyash Foods</strong></p>
              <p>Email: shriyashfoods01@gmail.com</p>
              <p>Phone: +91 9960243593</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
