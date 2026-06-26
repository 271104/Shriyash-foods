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
    title: 'Built Around Real Produce',
    text: 'Our powders begin with recognizable fruits, vegetables, and greens selected for everyday use.'
  },
  {
    icon: FiUsers,
    title: 'Rooted in Local Sourcing',
    text: 'We work toward creating a dependable bridge between farm harvests and modern kitchens.'
  },
  {
    icon: FiShield,
    title: 'Care at Every Stage',
    text: 'From sorting to packing, our process is designed to keep each batch consistent and clean.'
  },
  {
    icon: FiCheckCircle,
    title: 'Practical Nutrition',
    text: 'We make shelf-stable powders that are easy to store, measure, mix, and use daily.'
  }
];

const processSteps = [
  { icon: FiFeather, title: 'Sourcing', text: 'Produce is selected with attention to freshness, season, and suitability for powder making.' },
  { icon: FiCheckCircle, title: 'Inspection', text: 'Raw material is checked and cleaned before it enters the processing workflow.' },
  { icon: FiZap, title: 'Drying', text: 'Moisture is reduced carefully to improve shelf life while retaining natural character.' },
  { icon: FiPackage, title: 'Milling', text: 'Dried produce is ground into a fine, convenient powder for everyday use.' },
  { icon: FiAward, title: 'Batch Care', text: 'Each batch is packed with hygiene, consistency, and traceability in mind.' },
  { icon: FiTruck, title: 'Dispatch', text: 'Products are prepared for delivery so they reach customers in usable condition.' }
];

const certifications = [
  { title: 'FSSAI Registered', text: 'Operating under Indian food safety compliance requirements', icon: FiAward },
  { title: 'Food Safety Focus', text: 'Process decisions are guided by hygiene, documentation, and batch control', icon: FiShield },
  { title: 'Quality Checks', text: 'Products are reviewed for consistency before they move toward dispatch', icon: FiZap },
];

const productRanges = [
  {
    title: 'Green Powders',
    items: ['Moringa Powder', 'Curry Leaves Powder']
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
            <h1>Making Natural Powders More Useful</h1>
            <p>
              Shriyash Foods creates dehydrated fruit, vegetable, and green powders for
              homes that want convenient ingredients without moving away from real food.
            </p>
            <Link to="/products" className="about-primary-link">
              Explore Our Products
              <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>

          <div className="about-hero-collage" aria-label="Shriyash Foods natural products and process">
            <img className="collage-main" src="/aboutus1.png" alt="Shriyash Foods natural farm story" />
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
            <h2>Small Ingredients, Bigger Everyday Value</h2>
            <p>Shriyash Foods was started with a clear idea: good produce should not be limited by season, storage, or busy routines.</p>
            <p>Based in Solapur, Maharashtra, we focus on turning selected farm produce into powders that are simple to carry, measure, cook with, and add to daily meals.</p>
            <p>Our work sits between agriculture and modern food habits, helping customers use familiar ingredients in a more convenient form.</p>
            <Link to="/our-journey" className="about-secondary-link">
              Know More About Our Process
              <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="about-feature-section">
        <div className="container">
          <p className="about-kicker centered">What Defines Us</p>
          <h2>A Company Built for Everyday Kitchens</h2>
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
          <p className="about-kicker centered">How We Work</p>
          <h2>From Selection to Shelf</h2>
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
          <p className="about-kicker centered">Quality Approach</p>
          <h2>Standards Behind the Pack</h2>
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
                <h3>Make real ingredients easier to use</h3>
                <p>To create dependable natural powders that help families, food makers, and wellness-focused customers use produce more conveniently.</p>
              </div>
            </div>
            <div className="mv-card">
              <div className="mv-icon">
                <FiEye />
              </div>
              <div>
                <p className="about-kicker">Our Vision</p>
                <h3>Grow as a responsible food brand</h3>
                <p>To build a trusted Indian dehydrated-food brand known for useful products, steady quality, and respect for farm-grown ingredients.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="our-products-section">
        <div className="container">
          <h2>What We Make</h2>
          <p className="section-subtitle">Simple powder formats for cooking, drinks, recipes, and daily nutrition</p>
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
            <h2>Explore Ingredients Made for Daily Use</h2>
            <p>Browse our current powders and find the format that fits your kitchen, routine, or recipe.</p>
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
