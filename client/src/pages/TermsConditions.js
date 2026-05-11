import React from 'react';
import './PolicyPages.css';

const TermsConditions = () => {
  return (
    <div className="policy-page">
      <div className="container">
        <div className="policy-header">
          <h1>Terms & Conditions</h1>
          <p className="effective-date">Effective Date: January 1, 2025</p>
        </div>

        <div className="policy-content">
          <p className="intro">Welcome to Shriyash Foods. By accessing or using our website, you agree to the following terms and conditions.</p>

          <section>
            <h2>1. Business Information</h2>
            <p>Shriyash Foods offers natural food and nutritional powder products including, but not limited to:</p>
            <ul>
              <li>Beetroot Powder</li>
              <li>Carrot Powder</li>
              <li>ABC Powder</li>
              <li>Other health and wellness food products</li>
            </ul>
          </section>

          <section>
            <h2>2. Product Information</h2>
            <p>We make every effort to ensure product descriptions, images, and pricing are accurate.</p>
            <p>However:</p>
            <ul>
              <li>Minor packaging differences may occur</li>
              <li>Availability may change</li>
              <li>Product colors/images may vary depending on screen display</li>
            </ul>
          </section>

          <section>
            <h2>3. Orders</h2>
            <p>By placing an order, you agree that:</p>
            <ul>
              <li>Information provided is accurate</li>
              <li>Payment details are valid</li>
              <li>The order is for lawful personal use</li>
            </ul>
            <p>We reserve the right to:</p>
            <ul>
              <li>Cancel suspicious or fraudulent orders</li>
              <li>Refuse service when necessary</li>
              <li>Limit quantities per customer</li>
            </ul>
          </section>

          <section>
            <h2>4. Pricing</h2>
            <ul>
              <li>All prices are listed in Indian Rupees (INR)</li>
              <li>Prices may change without prior notice</li>
              <li>Applicable taxes and delivery charges will be shown during checkout</li>
            </ul>
          </section>

          <section>
            <h2>5. Payments</h2>
            <p>Payments are processed securely through authorized payment gateways including Razorpay.</p>
            <p>Accepted payment methods may include:</p>
            <ul>
              <li>UPI</li>
              <li>Debit cards</li>
              <li>Credit cards</li>
              <li>Net banking</li>
              <li>Wallets</li>
            </ul>
          </section>

          <section>
            <h2>6. Shipping</h2>
            <p>Orders are processed and shipped within the timelines mentioned in our shipping policy.</p>
            <p>Delivery delays caused by courier partners, weather, public holidays, or unforeseen circumstances are outside our direct control.</p>
          </section>

          <section>
            <h2>7. Health Disclaimer</h2>
            <p>Our products are food and nutritional products.</p>
            <ul>
              <li>They are not intended to diagnose, treat, cure, or prevent any disease</li>
              <li>Results may vary depending on individual lifestyle, diet, and health condition</li>
              <li>Customers with allergies, medical conditions, pregnancy, or health concerns should consult a healthcare professional before consumption</li>
            </ul>
          </section>

          <section>
            <h2>8. Intellectual Property</h2>
            <p>All website content including logos, text, graphics, and product information belongs to Shriyash Foods unless otherwise stated.</p>
            <p>Unauthorized use is prohibited.</p>
          </section>

          <section>
            <h2>9. Limitation of Liability</h2>
            <p>Shriyash Foods shall not be liable for indirect, incidental, or consequential damages arising from use of the website or products.</p>
          </section>

          <section>
            <h2>10. Changes to Terms</h2>
            <p>We may update these terms at any time without prior notice.</p>
            <p>Continued use of the website means acceptance of updated terms.</p>
          </section>

          <section>
            <h2>11. Contact</h2>
            <p>For queries:</p>
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

export default TermsConditions;
