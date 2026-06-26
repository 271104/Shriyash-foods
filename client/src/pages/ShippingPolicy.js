import React from 'react';
import './PolicyPages.css';

const ShippingPolicy = () => {
  return (
    <div className="policy-page">
      <div className="container">
        <div className="policy-header">
          <h1>Shipping Policy</h1>
          <p className="policy-subtitle">Fast, Safe &amp; Reliable Delivery</p>
          <p className="effective-date">Last Updated: June 2026</p>
        </div>

        <div className="policy-content">
          <p className="intro">
            At Shriyash Foods, we are committed to delivering your orders safely, quickly, and in perfect condition.
            Every order is carefully packed using food-grade packaging to maintain freshness and product quality throughout transit.
          </p>

          <section>
            <h2>Order Processing</h2>
            <ul>
              <li>Orders are processed within 1-2 business days after successful payment confirmation.</li>
              <li>Orders placed on Sundays or public holidays will be processed on the next business day.</li>
              <li>During festivals or high-demand periods, processing may take slightly longer.</li>
            </ul>
          </section>

          <section>
            <h2>Delivery Timeline</h2>
            <p>Estimated delivery time depends on your location.</p>
            <div className="policy-table-wrap">
              <table className="policy-table">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Estimated Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Metro Cities</td>
                    <td>2-5 Business Days</td>
                  </tr>
                  <tr>
                    <td>Tier 2 &amp; Tier 3 Cities</td>
                    <td>3-7 Business Days</td>
                  </tr>
                  <tr>
                    <td>Remote Locations</td>
                    <td>5-10 Business Days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>Delivery timelines are estimates and may vary due to weather conditions, courier delays, or unforeseen circumstances.</p>
          </section>

          <section>
            <h2>Shipping Charges</h2>
            <ul>
              <li>Free Shipping on eligible orders, as displayed during checkout.</li>
              <li>Shipping charges, if applicable, will be calculated and displayed before payment.</li>
            </ul>
          </section>

          <section>
            <h2>Order Tracking</h2>
            <p>Once your order is shipped, you will receive:</p>
            <ul>
              <li>Shipping confirmation</li>
              <li>Tracking ID / AWB number</li>
              <li>Courier partner details</li>
              <li>Live tracking link</li>
            </ul>
            <p>You can also track your order anytime from the Track Order section on our website.</p>
          </section>

          <section>
            <h2>Packaging</h2>
            <p>Every order is packed with care to ensure:</p>
            <ul>
              <li>Hygienic food-grade packaging</li>
              <li>Secure sealing</li>
              <li>Protection against transit damage</li>
              <li>Freshness preservation</li>
            </ul>
          </section>

          <section>
            <h2>Delivery Attempts</h2>
            <p>Our delivery partners will attempt delivery multiple times.</p>
            <p>
              If delivery is unsuccessful due to incorrect address, unavailable recipient, or other customer-related reasons,
              additional shipping charges may apply for re-delivery.
            </p>
          </section>

          <section>
            <h2>Incorrect Address</h2>
            <p>
              Please ensure that your shipping address, contact number, and PIN code are accurate before placing an order.
            </p>
            <p>
              Shriyash Foods will not be responsible for delays or failed deliveries caused by incorrect shipping information
              provided by the customer.
            </p>
          </section>

          <section>
            <h2>Delayed Deliveries</h2>
            <p>While we strive to deliver every order on time, delays may occur due to:</p>
            <ul>
              <li>Natural disasters</li>
              <li>Extreme weather</li>
              <li>Public holidays</li>
              <li>Government restrictions</li>
              <li>Courier operational delays</li>
            </ul>
            <p>We appreciate your patience in such situations.</p>
          </section>

          <section>
            <h2>Damaged or Missing Packages</h2>
            <p>If your order arrives damaged or appears tampered with:</p>
            <ul>
              <li>Do not accept the package if possible.</li>
              <li>Take clear photos of the package.</li>
              <li>Contact our customer support within 24 hours of delivery.</li>
            </ul>
            <p>Our team will investigate and provide an appropriate resolution.</p>
          </section>

          <section>
            <h2>International Shipping</h2>
            <p>Currently, we deliver only within India.</p>
            <p>International shipping services may be introduced in the future.</p>
          </section>

          <section>
            <h2>Need Help?</h2>
            <p>For any shipping-related questions or order assistance, please contact us:</p>
            <div className="contact-info">
              <p><strong>Shriyash Foods</strong></p>
              <p>Email: shriyashfoods01@gmail.com</p>
              <p>Phone: +91 9960243593</p>
              <p>Business Hours: Monday - Saturday | 9:00 AM - 6:00 PM IST</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
