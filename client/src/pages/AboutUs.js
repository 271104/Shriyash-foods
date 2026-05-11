import React from 'react';
import { FiHeart, FiAward, FiUsers, FiTrendingUp } from 'react-icons/fi';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1>About Shriyash Foods</h1>
          <p className="hero-subtitle">Pure by Nature, Nourished by Choice</p>
        </div>
      </section>

      {/* Our Story */}
      <section className="our-story">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2>Our Story</h2>
              <p>Shriyash Foods was born from a simple belief: that nature provides everything we need for a healthy life. In a world filled with processed foods and artificial additives, we saw the need for pure, natural nutrition that people could trust.</p>
              <p>What started as a passion for healthy living has grown into a mission to bring farm-fresh, nutrient-rich vegetable and superfood powders to every household. Each product we create is a testament to our commitment to quality, purity, and your well-being.</p>
              <p>Today, Shriyash Foods stands as a trusted name in natural health products, serving thousands of families who choose wellness the natural way.</p>
            </div>
            <div className="story-image">
              <img src="/combined-removebg-preview.png" alt="Shriyash Foods Products" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission & Vision */}
      <section className="mission-vision">
        <div className="container">
          <div className="mv-grid">
            <div className="mv-card">
              <div className="mv-icon">
                <FiHeart />
              </div>
              <h3>Our Mission</h3>
              <p>To provide pure, natural, and nutrient-rich food products that empower people to lead healthier lives. We believe in bringing the goodness of nature directly to your kitchen.</p>
            </div>
            <div className="mv-card">
              <div className="mv-icon">
                <FiTrendingUp />
              </div>
              <h3>Our Vision</h3>
              <p>To become India's most trusted brand for natural health powders, making wellness accessible and affordable for every family while promoting sustainable farming practices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="our-values">
        <div className="container">
          <h2>What We Stand For</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🌱</div>
              <h3>100% Natural</h3>
              <p>No artificial colors, flavors, or preservatives. Just pure, natural goodness from farm to packet.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">✓</div>
              <h3>Quality Assured</h3>
              <p>FSSAI certified products that meet the highest standards of quality and safety.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Customer First</h3>
              <p>Your health and satisfaction are our top priorities. We're here to support your wellness journey.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌾</div>
              <h3>Farm Fresh</h3>
              <p>Sourced directly from trusted farmers who share our commitment to quality and sustainability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose">
        <div className="container">
          <h2>Why Choose Shriyash Foods?</h2>
          <div className="choose-grid">
            <div className="choose-item">
              <FiAward className="choose-icon" />
              <h3>Premium Quality</h3>
              <p>Handpicked ingredients processed with care to retain maximum nutrition and authentic taste.</p>
            </div>
            <div className="choose-item">
              <FiUsers className="choose-icon" />
              <h3>Trusted by Thousands</h3>
              <p>Join our growing family of health-conscious customers who trust us for their daily nutrition.</p>
            </div>
            <div className="choose-item">
              <FiHeart className="choose-icon" />
              <h3>Made with Love</h3>
              <p>Every product is crafted with care, as if we're making it for our own family.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Products */}
      <section className="our-products-section">
        <div className="container">
          <h2>Our Product Range</h2>
          <p className="section-subtitle">From nature's bounty to your wellness routine</p>
          <div className="products-showcase">
            <div className="product-category">
              <h3>Superfood Powders</h3>
              <ul>
                <li>ABC Powder (Amla, Beetroot, Carrot)</li>
                <li>Moringa Powder</li>
                <li>Beetroot Powder</li>
              </ul>
            </div>
            <div className="product-category">
              <h3>Vegetable Powders</h3>
              <ul>
                <li>Carrot Powder</li>
                <li>Onion Powder</li>
                <li>Tomato Powder</li>
              </ul>
            </div>
            <div className="product-category">
              <h3>Fruit Powders</h3>
              <ul>
                <li>Banana Powder</li>
                <li>And more coming soon...</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <h2>Join the Wellness Revolution</h2>
          <p>Experience the difference of pure, natural nutrition</p>
          <a href="/products" className="btn btn-primary btn-large">
            Explore Our Products
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
