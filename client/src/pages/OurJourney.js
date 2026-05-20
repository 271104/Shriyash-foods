import React, { useEffect } from 'react';
import { FiHeart, FiUsers, FiShield, FiGlobe } from 'react-icons/fi';
import './OurJourney.css';

const OurJourney = () => {
  useEffect(() => {
    document.body.classList.add('journey-page-active');

    return () => {
      document.body.classList.remove('journey-page-active');
    };
  }, []);

  return (
    <div className="journey-page">
      <section className="journey-hero">
      </section>

      <section className="journey-story">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2>Welcome to Shriyash Foods</h2>
              <h3>Where nature, quality, and innovation come together</h3>
              <p>Founded in Solapur, Maharashtra, we specialize in premium dehydrated products and spices crafted with care, hygiene, and authenticity. Using advanced dehydration processes, we preserve the natural taste, aroma, and nutrition of every product while ensuring long shelf life and consistent quality.</p>
              
              <p>As an FSSAI & ISO certified company, we are committed to delivering trusted products for retail, bulk, and export markets. Every product reflects our dedication to purity, sustainability, and excellence.</p>
              
              <p>We proudly support Indian farmers by sourcing quality raw materials and transforming them into products made for the future.</p>
              
              <div className="journey-tagline">
                <strong>From Farms to the Future.</strong>
              </div>
            </div>
            <div className="story-image">
              <img src="/journey_image.png" alt="Shriyash Foods journey from farms to future" />
            </div>
          </div>
        </div>
      </section>

      <section className="journey-values">
        <div className="container">
          <h2>Our Commitment</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <FiHeart />
              </div>
              <h3>Quality & Care</h3>
              <p>Every product is crafted with care, hygiene, and authenticity using advanced dehydration processes.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FiShield />
              </div>
              <h3>Certified Excellence</h3>
              <p>FSSAI & ISO certified company committed to delivering trusted products with consistent quality.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FiUsers />
              </div>
              <h3>Supporting Farmers</h3>
              <p>We proudly support Indian farmers by sourcing quality raw materials and creating value-added products.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FiGlobe />
              </div>
              <h3>Global Reach</h3>
              <p>Delivering trusted products for retail, bulk, and export markets worldwide.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="journey-cta">
        <div className="container">
          <h2>Experience Pure Natural Nutrition</h2>
          <p>Discover our range of premium dehydrated products</p>
          <a href="/products" className="btn btn-primary btn-large">
            Explore Our Products
          </a>
        </div>
      </section>
    </div>
  );
};

export default OurJourney;