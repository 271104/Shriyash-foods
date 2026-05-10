import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiAward, FiHeart, FiStar } from 'react-icons/fi';
import './Home.css';

const Home = () => {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.feature-box, .tagline-section h2, .tagline-section p, .cta-content h2, .cta-content p, .cta-content .btn, .trust-item');
    animateElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: 'url(/heroPageBg.png)' }}>
        <div className="hero-content-left">
          <p className="hero-subtitle">Nature's Purity. Everyday Wellness.</p>
          <h1 className="hero-title">The Shriyash Promise</h1>
          <p className="hero-description">
            ShriYash Foods brings you pure, nutrient-rich vegetable and superfood powders crafted from carefully selected natural ingredients. Designed to support everyday wellness, our products deliver authentic nutrition, rich flavor, and trusted quality — helping you nourish your body the natural way.
          </p>
          <Link to="/products" className="hero-shop-btn">
            SHOP NOW
          </Link>
        </div>
        <img src="/combined-removebg-preview.png" alt="Products" className="hero-combined-image" />
        <img src="/shade.png" alt="Shade" className="hero-shade-image" />
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-icon">
                <FiShield />
              </div>
              <h3>Premium Quality</h3>
              <p>Handpicked from the farm, ensuring pure, rich nutrition</p>
            </div>
            
            <div className="feature-box">
              <div className="feature-icon">
                <FiAward />
              </div>
              <h3>FSSAI Certified</h3>
              <p>Sourced directly from nature, delivering authentic taste</p>
            </div>
            
            <div className="feature-box">
              <div className="feature-icon">
                <FiHeart />
              </div>
              <h3>100% Natural</h3>
              <p>No additives, just pure, farm-fresh powders in every packet</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tagline Section */}
      <section className="tagline-section">
        <div className="container">
          <h2>"Wellness Begins in the Kitchen"</h2>
          <p>Discover the magic of clean, powerful health powders with Shriyash Foods – for kitchens that crave quality.</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Start Your Health Journey Today</h2>
            <p>Experience the difference of premium, natural health powders</p>
            <Link to="/products" className="btn btn-secondary btn-large">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <FiStar className="trust-icon" />
              <h4>Premium Quality</h4>
              <p>Handpicked ingredients</p>
            </div>
            <div className="trust-item">
              <FiShield className="trust-icon" />
              <h4>100% Safe</h4>
              <p>FSSAI certified products</p>
            </div>
            <div className="trust-item">
              <FiHeart className="trust-icon" />
              <h4>Customer Love</h4>
              <p>Trusted by thousands</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
