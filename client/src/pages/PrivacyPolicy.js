import React from 'react';
import './PolicyPages.css';

const PrivacyPolicy = () => {
  return (
    <div className="policy-page">
      <div className="container">
        <div className="policy-header">
          <h1>Privacy Policy</h1>
        </div>

        <div className="policy-content">
          <p className="intro">At Shriyash Foods, we value and respect your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you visit our website or purchase our products.</p>

          <section>
            <h2>Information We Collect</h2>
            <p>We may collect personal information such as:</p>
            <ul>
              <li>Name</li>
              <li>Phone number</li>
              <li>Email address</li>
              <li>Shipping and billing address</li>
              <li>Payment details, processed securely through payment gateways</li>
              <li>Order and purchase information</li>
            </ul>
          </section>

          <section>
            <h2>How We Use Your Information</h2>
            <p>Your information may be used to:</p>
            <ul>
              <li>Process and deliver orders</li>
              <li>Provide customer support</li>
              <li>Send order updates and notifications</li>
              <li>Improve our products, services, and website experience</li>
              <li>Communicate promotional offers or updates, only when permitted</li>
            </ul>
          </section>

          <section>
            <h2>Data Protection</h2>
            <p>Shriyash Foods takes appropriate security measures to protect customer information from unauthorized access, misuse, or disclosure.</p>
          </section>

          <section>
            <h2>Sharing of Information</h2>
            <p>We do not sell, trade, or rent customer personal information to third parties. Information may only be shared with trusted service providers such as payment gateways and delivery partners for order fulfillment purposes.</p>
          </section>

          <section>
            <h2>Cookies</h2>
            <p>Our website may use cookies to improve user experience, analyze website traffic, and enhance website functionality.</p>
          </section>

          <section>
            <h2>Third-Party Services</h2>
            <p>Certain third-party services linked to our website may have their own privacy policies. We encourage users to review those policies separately.</p>
          </section>

          <section>
            <h2>User Consent</h2>
            <p>By using our website, you consent to the collection and use of information in accordance with this Privacy Policy.</p>
          </section>

          <section>
            <h2>Policy Updates</h2>
            <p>Shriyash Foods reserves the right to update or modify this Privacy Policy at any time without prior notice.</p>
          </section>

          <section>
            <h2>Contact Us</h2>
            <p>For any questions regarding this Privacy Policy, please contact us:</p>
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
