import React, { useEffect } from 'react';
import { FiAward, FiHeart, FiTrendingUp, FiUsers } from 'react-icons/fi';
import './AboutUs.css';

const beliefs = [
  {
    number: '01',
    title: 'Empowering Farmers & Rural Communities',
    text: 'We create better opportunities for farmers by adding value to fresh farm produce.',
  },
  {
    number: '02',
    title: 'Sustainable & Responsible Food Processing',
    text: 'We work to reduce food wastage and make natural nutrition more accessible.',
  },
  {
    number: '03',
    title: 'Hygienic Manufacturing Standards',
    text: 'Every product is processed with care, cleanliness, and consistent quality controls.',
  },
  {
    number: '04',
    title: 'Natural Nutrition for Modern Lifestyles',
    text: 'We craft convenient food solutions for families seeking pure and trustworthy nutrition.',
  },
  {
    number: '05',
    title: 'Innovation with Purpose',
    text: 'Our innovation is focused on real impact for farmers, consumers, and the future of food.',
  },
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
        <div className="container">
          <h1>About Shriyash Foods</h1>
          <p className="hero-subtitle">Pure by Nature, Nourished by Choice</p>
        </div>
      </section>

      <section className="our-story">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2>Our Journey</h2>
              <h3>From Farms to the Future</h3>
              <p>Shriyash Foods was founded in Solapur, Maharashtra with a vision to create sustainable food solutions while supporting the hardworking farmers who are the true strength of our country.</p>
              <p>Started by a passionate young entrepreneur at the age of 20, Shriyash Foods is not just a business. It is a mission driven by innovation, purpose, and the dream of creating real impact in the agricultural and food industry.</p>
              <p>Coming from a region deeply connected to farming, we closely witnessed the challenges faced by farmers, including crop wastage, unstable market prices, and limited opportunities to increase the value of their produce.</p>
              <p>With the aim of solving these problems, Shriyash Foods began transforming fresh farm produce into premium dehydrated products that help preserve nutrition, increase shelf life, and create better opportunities for farmers.</p>
              <p>At Shriyash Foods, we carefully source natural ingredients and process them hygienically using modern dehydration techniques to maintain authentic taste, natural quality, and essential nutrients.</p>
              <p>Our products are crafted for health-conscious families looking for pure, convenient, and trustworthy food solutions.</p>
              <p>Our vision goes beyond building a brand. We aim to create a strong bridge between farmers and consumers by promoting sustainable agriculture, reducing food wastage, and bringing high-quality natural products from Indian farms to homes across the country and around the world.</p>
              <p>With quality, innovation, and authenticity at our core, we are committed to shaping the future of natural nutrition, one product at a time.</p>
            </div>
            <div className="story-image">
              <img src="/about-journey-shriyash.png" alt="Shriyash Foods journey from farms to natural nutrition" />
            </div>
          </div>
        </div>
      </section>

      <section className="mission-vision">
        <div className="container">
          <div className="mv-grid">
            <div className="mv-card">
              <div className="mv-icon">
                <FiHeart />
              </div>
              <h3>Our Mission</h3>
              <p>To support farmers by creating value-added natural food products that promote healthy living, sustainability, and long-term agricultural growth.</p>
            </div>
            <div className="mv-card">
              <div className="mv-icon">
                <FiTrendingUp />
              </div>
              <h3>Our Vision</h3>
              <p>To build a globally trusted food brand from Solapur, Maharashtra that connects farmers to the future through innovation, sustainability, and natural nutrition.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="our-values">
        <div className="container">
          <h2>What We Believe In</h2>
          <div className="values-grid values-grid-beliefs">
            {beliefs.map((belief) => (
              <div className="value-card" key={belief.title}>
                <div className="value-icon">{belief.number}</div>
                <h3>{belief.title}</h3>
                <p>{belief.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
              <h3>Farmer-Focused Purpose</h3>
              <p>Every product supports our larger mission of creating value for farmers and rural communities.</p>
            </div>
            <div className="choose-item">
              <FiHeart className="choose-icon" />
              <h3>Made with Care</h3>
              <p>Our natural powders are crafted for families who want pure, convenient, and trustworthy nutrition.</p>
            </div>
          </div>
        </div>
      </section>

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
