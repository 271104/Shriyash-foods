import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAward,
  FiCheckCircle,
  FiEye,
  FiFeather,
  FiPackage,
  FiShield,
  FiTarget,
  FiTruck,
  FiUsers,
  FiZap
} from 'react-icons/fi';
import './AboutUs.css';

const whyChoose = [
  {
    icon: FiFeather,
    title: '100% Natural Ingredients',
    text: 'No chemicals or additives. Just pure fruits and vegetables in every scoop.'
  },
  {
    icon: FiUsers,
    title: 'Supporting Farmers',
    text: 'We empower local farmers through fair sourcing and sustainable practices.'
  },
  {
    icon: FiShield,
    title: 'Hygienic Processing',
    text: 'Advanced dehydration and grinding technology helps preserve purity and safety.'
  },
  {
    icon: FiCheckCircle,
    title: 'Sustainable Vision',
    text: 'Committed to reducing food waste and building a healthier future for all.'
  }
];

const processSteps = [
  { icon: FiFeather, title: 'Farm Fresh', text: 'We source quality fruits and vegetables from trusted farmers.' },
  { icon: FiCheckCircle, title: 'Careful Selection', text: 'Only fresh produce is handpicked and inspected.' },
  { icon: FiZap, title: 'Dehydration', text: 'Low-moisture processing locks in nutrition and flavor.' },
  { icon: FiPackage, title: 'Grinding', text: 'Dried produce is finely ground into premium powder.' },
  { icon: FiAward, title: 'Packaging', text: 'Packed hygienically to retain freshness and quality.' },
  { icon: FiTruck, title: 'Delivered', text: 'Delivered to your doorstep with care and convenience.' }
];

const certifications = [
  { title: 'FSSAI Certified', text: 'Food Safety & Standards Authority of India', icon: FiAward },
  { title: 'ISO 22000:2018', text: 'Food safety management standard', icon: FiShield },
  { title: 'Lab Tested', text: 'Every batch is tested for purity and quality', icon: FiZap },
  { title: 'GMP Certified', text: 'Good Manufacturing Practices certified', icon: FiCheckCircle }
];

const productRanges = [
  {
    title: 'Green Powders',
    items: ['Moringa Powder']
  },
  {
    title: 'Vegetable Powders',
    items: ['Tomato Powder', 'Onion Powder']
  },
  {
    title: 'Fruit Powders',
    items: ['Banana Powder', 'ABC Powder', 'More coming soon']
  }
];

const AboutUs = () => {
  useEffect(() => {
    document.body.classList.add('about-page-active');

    return () => {
      document.body.classList.remove('about-page-active');
    };
  }, []);

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-leaf about-leaf-left" aria-hidden="true"></div>
        <div className="about-leaf about-leaf-right" aria-hidden="true"></div>

        <div className="container about-hero-grid">
          <div className="about-hero-copy">
            <p className="about-kicker">About Us</p>
            <h1>From Farms to the Future</h1>
            <p>
              Transforming fresh produce into premium dehydrated powders while supporting
              farmers and delivering natural nutrition worldwide.
            </p>
            <Link to="/products" className="about-primary-link">
              Explore Our Products
              <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>

          <div className="about-hero-collage" aria-label="Shriyash Foods natural products and process">
            <img className="collage-main" src="/about-journey.png" alt="Fresh farm produce and Shriyash Foods products" />
            <img className="collage-small" src="/green_powder.png" alt="Green powder product display" />
            <img className="collage-small" src="/banner_our_journey.png" alt="Food processing facility" />
          </div>
        </div>
      </section>

      <section className="our-story">
        <div className="container story-content">
          <div className="story-image">
            <img src="/about-journey-shriyash.png" alt="Shriyash Foods journey from farms to natural nutrition" />
          </div>
          <div className="story-text">
            <p className="about-kicker">Our Story</p>
            <h2>A Passion for Purity and People</h2>
            <p>Shriyash Foods began with a simple mission: reduce food wastage, support local farmers, and make natural nutrition convenient for every home.</p>
            <p>We work closely with farmers to source fresh fruits and vegetables, which are carefully dehydrated and ground into fine powders under strict quality standards.</p>
            <p>Today, our products are trusted by families who want pure, convenient, and trustworthy nutrition without compromising taste or quality.</p>
            <Link to="/our-journey" className="about-secondary-link">
              Know More About Our Process
              <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="about-feature-section">
        <div className="container">
          <p className="about-kicker centered">Why Choose Us</p>
          <h2>Good for You, Good for the Planet</h2>
          <div className="feature-grid">
            {whyChoose.map((item) => {
              const Icon = item.icon;

              return (
                <article className="feature-card" key={item.title}>
                  <div className="feature-icon">
                    <Icon />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="process-section">
        <div className="container">
          <p className="about-kicker centered">Our Process</p>
          <h2>From Farm to Pack</h2>
          <div className="process-row">
            {processSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article className="process-step" key={step.title}>
                  <div className="process-icon">
                    <Icon />
                  </div>
                  <h3>{index + 1}. {step.title}</h3>
                  <p>{step.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="certification-section">
        <div className="container">
          <p className="about-kicker centered">Certifications</p>
          <h2>Quality You Can Trust</h2>
          <div className="cert-grid">
            {certifications.map((item) => {
              const Icon = item.icon;

              return (
                <article className="cert-card" key={item.title}>
                  <div className="cert-icon">
                    <Icon />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mission-vision">
        <div className="container">
          <div className="mv-grid">
            <div className="mv-card">
              <div className="mv-icon">
                <FiTarget />
              </div>
              <div>
                <p className="about-kicker">Our Mission</p>
                <h3>Natural nutrition for every home</h3>
                <p>To deliver natural, nutritious, and high-quality food products while supporting farmers and promoting healthier lifestyles.</p>
              </div>
            </div>
            <div className="mv-card">
              <div className="mv-icon">
                <FiEye />
              </div>
              <div>
                <p className="about-kicker">Our Vision</p>
                <h3>A trusted global food brand</h3>
                <p>To be a globally trusted brand in dehydrated food products, known for purity, innovation, and commitment toward people and the planet.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="our-products-section">
        <div className="container">
          <h2>Our Product Range</h2>
          <p className="section-subtitle">From nature's bounty to your wellness routine</p>
          <div className="products-showcase">
            {productRanges.map((range) => (
              <article className="product-category" key={range.title}>
                <h3>{range.title}</h3>
                <ul>
                  {range.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="container cta-panel">
          <img src="/green_powder.png" alt="Moringa powder bowl" />
          <div>
            <h2>Ready to Experience Natural Nutrition?</h2>
            <p>Explore our wide range of wholesome powders made with nature's finest ingredients.</p>
          </div>
          <Link to="/products" className="about-cta-link">
            Shop Now
            <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
