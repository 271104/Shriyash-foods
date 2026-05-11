import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success('Thank you for contacting us! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="contact-page">
      <div className="container">
        <div className="contact-header">
          <h1>Contact Shriyash Foods</h1>
          <p>At Shriyash Foods, we are committed to providing natural and nutritious food products made with quality ingredients. If you have any questions about our products, orders, shipping, or payments, feel free to contact us.</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <div className="info-card">
              <h2>Get In Touch</h2>
              <p>We're here to help and answer any question you might have.</p>

              <div className="info-items">
                <div className="info-item">
                  <div className="info-icon">
                    <FiMail />
                  </div>
                  <div className="info-content">
                    <h3>Email</h3>
                    <a href="mailto:shriyashfoods01@gmail.com">shriyashfoods01@gmail.com</a>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <FiPhone />
                  </div>
                  <div className="info-content">
                    <h3>Phone</h3>
                    <a href="tel:+919960243593">+91 9960243593</a>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <FiMapPin />
                  </div>
                  <div className="info-content">
                    <h3>Address</h3>
                    <p>Pune, Maharashtra, India</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <FiClock />
                  </div>
                  <div className="info-content">
                    <h3>Business Hours</h3>
                    <p>Monday to Saturday</p>
                    <p>9:00 AM to 6:00 PM IST</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="support-card">
              <h3>Customer Support</h3>
              <p>For assistance related to:</p>
              <ul>
                <li>Product information</li>
                <li>Order tracking</li>
                <li>Payment issues</li>
                <li>Refund or cancellation requests</li>
                <li>Delivery concerns</li>
                <li>General inquiries</li>
              </ul>
              <p className="support-note">Please contact our support team, and we will respond as soon as possible.</p>
            </div>
          </div>

          <div className="contact-form-section">
            <div className="form-card">
              <h2>Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                  />
                </div>

                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    rows="5"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  <FiSend /> {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
