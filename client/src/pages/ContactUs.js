import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSend
} from 'react-icons/fi';
import './ContactUs.css';

const businessAddress = 'Plot No.31, Survey No.103/1, Rangraj Nagar, Vidi Gharkul, Hyderabad Road, Solapur, Maharashtra 413005';
const businessMapQuery = encodeURIComponent(businessAddress);

const contactCards = [
  {
    icon: FiPhone,
    title: 'Call Us',
    primary: '+91 9960243593',
    secondary: 'Monday to Saturday',
    note: '9:00 AM - 6:00 PM',
    href: 'tel:+919960243593'
  },
  {
    icon: FiMail,
    title: 'Email Us',
    primary: 'shriyashfoods01@gmail.com',
    secondary: 'We reply within',
    note: '24 hours',
    href: 'mailto:shriyashfoods01@gmail.com'
  },
  {
    icon: FiMapPin,
    title: 'Our Location',
    primary: 'Plot No.31, Vidi Gharkul',
    secondary: 'Rangraj Nagar, Hyderabad Road, Solapur',
    note: 'Get directions ->',
    href: `https://www.google.com/maps/search/?api=1&query=${businessMapQuery}`
  },
  {
    icon: FiClock,
    title: 'Working Hours',
    primary: 'Monday to Saturday',
    secondary: '9:00 AM - 6:00 PM',
    note: 'Sunday Closed'
  }
];

const contactReasons = [
  ['Product Information', 'Learn more about our natural powders'],
  ['Order Tracking', 'Track your order and delivery updates'],
  ['Bulk Orders', 'Special pricing for wholesale orders'],
  ['Partnership Inquiries', 'Let us work together for healthier nutrition'],
  ['Shipping Questions', 'Know delivery time and shipping support'],
  ['Returns & Refunds', 'Easy support for refund requests']
];

const brandPoints = [
  'Manufacturing unit at Vidi Gharkul, Solapur',
  'FSSAI certified and lab tested',
  'Hygienic and advanced processing',
  '100% natural ingredients',
  'Trusted by happy customers'
];

const faqs = [
  'How can I track my order?',
  'Do you offer bulk or wholesale orders?',
  'How long does shipping take?',
  'What is your return and refund policy?'
];

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
      <section className="contact-hero">
        <div className="contact-leaf contact-leaf-left" aria-hidden="true"></div>
        <div className="contact-leaf contact-leaf-right" aria-hidden="true"></div>

        <div className="container contact-hero-grid">
          <div className="contact-hero-copy">
            <p className="contact-kicker">Contact Us</p>
            <h1>Let's Talk</h1>
            <p>We're here to help with orders, products, partnerships and support.</p>

            <div className="hero-contact-list">
              <a href="tel:+919960243593" className="hero-contact-item">
                <span><FiPhone /></span>
                <div>
                  <strong>Call Us</strong>
                  <small>+91 9960243593</small>
                </div>
              </a>
              <a href="mailto:shriyashfoods01@gmail.com" className="hero-contact-item">
                <span><FiMail /></span>
                <div>
                  <strong>Email Us</strong>
                  <small>shriyashfoods01@gmail.com</small>
                </div>
              </a>
              <div className="hero-contact-item">
                <span><FiMapPin /></span>
                <div>
                  <strong>Visit Us</strong>
                  <small>{businessAddress}</small>
                </div>
              </div>
            </div>

            <Link to="/products" className="contact-primary-link">
              Explore Products
              <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>

          <div className="contact-hero-collage">
            <img className="contact-collage-main" src="/green_powder.png" alt="Shriyash Foods powder products" />
            <img src="/about-journey.png" alt="Farmer holding fresh greens" />
            <img src="/banner_our_journey.png" alt="Food processing facility" />
          </div>
        </div>
      </section>

      <section className="contact-cards-section">
        <div className="container contact-card-grid">
          {contactCards.map((card) => {
            const Icon = card.icon;
            const content = (
              <>
                <div className="contact-card-icon">
                  <Icon />
                </div>
                <h3>{card.title}</h3>
                <p>{card.primary}</p>
                <span>{card.secondary}</span>
                <small>{card.note}</small>
              </>
            );

            return card.href ? (
              <a className="contact-card" href={card.href} target={card.href.startsWith('http') ? '_blank' : undefined} rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined} key={card.title}>
                {content}
              </a>
            ) : (
              <article className="contact-card" key={card.title}>
                {content}
              </article>
            );
          })}
        </div>
      </section>

      <section className="contact-form-map-section">
        <div className="container contact-form-map">
          <div className="contact-panel">
            <div className="contact-section-heading">
              <h2>Send Us a Message</h2>
              <span aria-hidden="true"></span>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" required />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit mobile number" pattern="[0-9]{10}" />
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="What is this regarding?" required />
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Tell us more about your inquiry..." rows="5" required></textarea>
              </div>

              <button type="submit" className="contact-submit" disabled={loading}>
                <FiSend /> {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className="contact-panel">
            <div className="contact-section-heading">
              <h2>Find Us Here</h2>
              <span aria-hidden="true"></span>
            </div>
            <div className="map-frame">
              <iframe
                title="Shriyash Foods location"
                src={`https://www.google.com/maps?q=${businessMapQuery}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-support-section">
        <div className="container support-grid">
          <div className="contact-panel why-contact-card">
            <div className="contact-section-heading">
              <h2>Why Contact Us?</h2>
              <span aria-hidden="true"></span>
            </div>
            <div className="reason-grid">
              {contactReasons.map(([title, text]) => (
                <div className="reason-item" key={title}>
                  <FiCheckCircle />
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="contact-panel brand-card">
            <div className="contact-section-heading">
              <h2>About Shriyash Foods</h2>
              <span aria-hidden="true"></span>
            </div>
            <div className="brand-card-content">
              <ul>
                {brandPoints.map((point) => (
                  <li key={point}>
                    <FiCheckCircle />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <img src="/green_powder.png" alt="Green powder bowl" />
            </div>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="container">
          <div className="contact-section-heading centered">
            <h2>Frequently Asked Questions</h2>
            <span aria-hidden="true"></span>
          </div>
          <div className="faq-grid">
            {faqs.map((faq) => (
              <button type="button" className="faq-item" key={faq}>
                <span>{faq}</span>
                <FiChevronDown />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-cta">
        <div className="container contact-cta-panel">
          <img src="/green_powder.png" alt="Moringa powder bowl" />
          <div>
            <h2>Ready to Experience Natural Nutrition?</h2>
            <p>Explore our wide range of wholesome powders made with nature's finest ingredients.</p>
          </div>
          <Link to="/products" className="contact-cta-link">
            Explore Products
            <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
