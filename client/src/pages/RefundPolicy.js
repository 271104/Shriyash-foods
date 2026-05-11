import React from 'react';
import './PolicyPages.css';

const RefundPolicy = () => {
  return (
    <div className="policy-page">
      <div className="container">
        <div className="policy-header">
          <h1>Refund & Cancellation Policy</h1>
          <p className="effective-date">Effective Date: January 1, 2025</p>
        </div>

        <div className="policy-content">
          <p className="intro">At Shriyash Foods, customer satisfaction is important to us.</p>

          <section>
            <h2>1. Order Cancellation</h2>
            <ul>
              <li>Orders may be cancelled before dispatch</li>
              <li>Once an order has been shipped, cancellation may not be possible</li>
              <li>To request cancellation, contact us immediately</li>
            </ul>
          </section>

          <section>
            <h2>2. Refund Eligibility</h2>
            <p>Refunds may be approved in cases such as:</p>
            <ul>
              <li>Wrong product delivered</li>
              <li>Damaged product received</li>
              <li>Defective packaging</li>
              <li>Eligible cancellation before dispatch</li>
              <li>Payment deducted but order not confirmed</li>
            </ul>
          </section>

          <section>
            <h2>3. Non-Refundable Cases</h2>
            <p>Refunds will generally not be provided for:</p>
            <ul>
              <li>Opened food products</li>
              <li>Partially consumed products</li>
              <li>Change of mind after delivery</li>
              <li>Incorrect delivery details provided by customer</li>
              <li>Delays caused by courier services beyond reasonable limits</li>
            </ul>
            <p className="note">Because our products are consumable food items, hygiene and safety standards apply.</p>
          </section>

          <section>
            <h2>4. Damaged or Incorrect Product Claims</h2>
            <p>If you receive a damaged or incorrect product:</p>
            <p>Please contact us within 48 hours of delivery with:</p>
            <ul>
              <li>Order number</li>
              <li>Photos of the package/product</li>
              <li>Issue description</li>
            </ul>
          </section>

          <section>
            <h2>5. Refund Processing Time</h2>
            <p>Approved refunds will be processed within 5–7 business days to the original payment method.</p>
            <p>Actual credit timing may depend on your bank or payment provider.</p>
          </section>

          <section>
            <h2>6. Payment Failure Cases</h2>
            <p>If payment is deducted but order is not successfully placed, the amount is generally auto-reversed by the payment provider within standard banking timelines.</p>
            <p>If not, contact us.</p>
          </section>

          <section>
            <h2>7. Contact</h2>
            <p>For cancellation/refund requests:</p>
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

export default RefundPolicy;
