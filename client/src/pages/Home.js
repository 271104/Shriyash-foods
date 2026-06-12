import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiStar, FiChevronLeft, FiChevronRight, FiFeather, FiDroplet, FiZap } from 'react-icons/fi';
import './Home.css';

const categories = [
  {
    title: 'Vegetable Powders',
    images: ['/shop_by_Category/vegetable_powder.png'],
  },
  {
    title: 'Fruit Powders',
    images: ['/shop_by_Category/fruit_powder.png'],
  },
  {
    title: 'Green Powders',
    images: ['/shop_by_Category/green_powder.png'],
  },
];

const bestsellers = [
  { name: 'Tomato Powder', image: '/tomato-removebg-preview.png', oldPrice: 'Rs. 249.00', price: 'Rs. 199.00' },
  { name: 'Beetroot Powder', image: '/beetroot-removebg-preview.png', oldPrice: 'Rs. 249.00', price: 'Rs. 199.00' },
  { name: 'Banana Powder', image: '/banana-removebg-preview.png', oldPrice: 'Rs. 249.00', price: 'Rs. 199.00' },
  { name: 'Moringa Powder', image: '/moringa-removebg-preview.png', oldPrice: 'Rs. 299.00', price: 'Rs. 249.00' },
  { name: 'Onion Powder', image: '/onion-removebg-preview.png', oldPrice: 'Rs. 249.00', price: 'Rs. 10.00' },
  { name: 'ABC Powder', image: '/abc-removebg-preview.png', oldPrice: 'Rs. 299.00', price: 'Rs. 249.00' },
];

const RatingStars = () => (
  <span className="rating-stars" aria-label="5 star rating">
    {[1, 2, 3, 4, 5].map((star) => (
      <FiStar key={star} />
    ))}
  </span>
);

const Home = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeBestseller, setActiveBestseller] = useState(0);

  const orderedCategories = useMemo(
    () => categories.map((_, index) => categories[(activeCategory + index) % categories.length]),
    [activeCategory]
  );

  const featuredBestsellers = useMemo(() => {
    const previous = (activeBestseller - 1 + bestsellers.length) % bestsellers.length;
    const next = (activeBestseller + 1) % bestsellers.length;

    return [
      { ...bestsellers[previous], position: 'side' },
      { ...bestsellers[activeBestseller], position: 'center' },
      { ...bestsellers[next], position: 'side' },
    ];
  }, [activeBestseller]);

  const showPreviousCategory = () => {
    setActiveCategory((current) => (current - 1 + categories.length) % categories.length);
  };

  const showNextCategory = () => {
    setActiveCategory((current) => (current + 1) % categories.length);
  };

  const showPreviousBestseller = () => {
    setActiveBestseller((current) => (current - 1 + bestsellers.length) % bestsellers.length);
  };

  const showNextBestseller = () => {
    setActiveBestseller((current) => (current + 1) % bestsellers.length);
  };

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

    const animateElements = document.querySelectorAll('.category-item, .why-card, .bestseller-card, .testimonial-card');
    animateElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const categoryTimer = window.setInterval(() => {
      setActiveCategory((current) => (current + 1) % categories.length);
    }, 3500);

    return () => window.clearInterval(categoryTimer);
  }, []);

  useEffect(() => {
    const bestsellerTimer = window.setInterval(() => {
      setActiveBestseller((current) => (current + 1) % bestsellers.length);
    }, 3800);

    return () => window.clearInterval(bestsellerTimer);
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content-left">
          <h1 className="hero-title">
            FROM FARMS TO<br />
            <span className="hero-title-orange">THE FUTURE</span>
          </h1>
          
          <div className="hero-value-props">
            <div className="value-prop">
              <div className="value-icon">
                <img src="/icons/Layer8.png" alt="Bridge between farmers and families" />
              </div>
              <p>At Shriyash Foods, we are building a bridge between hardworking farmers and health-conscious families across the world.</p>
            </div>
            
            <div className="value-prop">
              <div className="value-icon">
                <img src="/icons/Layer9.png" alt="Fresh farm produce" />
              </div>
              <p>By transforming fresh farm produce into premium dehydrated products, we help preserve nature's nutrition with quality and care.</p>
            </div>
            
            <div className="value-prop">
              <div className="value-icon">
                <img src="/icons/Layer11.png" alt="Sustainable food solutions" />
              </div>
              <p>Our vision is to create sustainable food solutions that support farmers, reduce wastage, and promote healthier lifestyles globally.</p>
            </div>
            
            <div className="value-prop">
              <div className="value-icon">
                <img src="/icons/Layer22.png" alt="Innovation and authenticity" />
              </div>
              <p>With innovation, hygiene, and authenticity at our core, we are shaping the future of natural food - one product at a time.</p>
            </div>
          </div>
          
          <div className="hero-buttons">
            <Link to="/products" className="hero-btn hero-btn-green">
              Explore Products →
            </Link>
            <Link to="/our-journey" className="hero-btn hero-btn-orange">
              Our Journey →
            </Link>
          </div>
        </div>
        
        <div className="hero-image-right">
          <img src="/hero.png?v=20260519" alt="Shriyash Foods Products and Manufacturing" className="hero-showcase-image" />
        </div>
      </section>
      
      {/* Trust Badges */}
      <section className="trust-badges">
        <div className="trust-badge">
          <img className="trust-icon" src="/icons/Layer24.png" alt="" aria-hidden="true" />
          <div className="trust-text">
            <strong>100% Natural</strong>
            <span>Ingredients</span>
          </div>
        </div>
        <div className="trust-badge">
          <img
            className="trust-icon"
            src="/icons/supporting-farmers.png"
            alt=""
            aria-hidden="true"
          />
          <div className="trust-text">
            <strong>Supporting</strong>
            <span>Farmers</span>
          </div>
        </div>
        <div className="trust-badge">
          <img className="trust-icon" src="/icons/Layer23.png" alt="" aria-hidden="true" />
          <div className="trust-text">
            <strong>Hygienically</strong>
            <span>Processed</span>
          </div>
        </div>
        <div className="trust-badge">
          <img className="trust-icon" src="/icons/Layer22.png" alt="" aria-hidden="true" />
          <div className="trust-text">
            <strong>Sustainable</strong>
            <span>Food Vision</span>
          </div>
        </div>
      </section>

      {/* Shop By Category */}
      <section className="category-section">
        <div className="container">
          <div className="section-heading">
            <h2>Shop by Category</h2>
            <span aria-hidden="true"></span>
          </div>

          <div className="category-row">
            <button className="category-arrow" aria-label="Previous category" onClick={showPreviousCategory}>
              <FiChevronLeft />
            </button>

            <div className="category-grid category-slider" aria-live="polite">
              {orderedCategories.map((category, index) => (
                <article
                  className={`category-item category-slide-${index} ${index === 0 ? 'category-item-active' : ''}`}
                  key={`${category.title}-${activeCategory}`}
                >
                  <Link to="/products" className="category-image-wrap">
                    {category.images.map((src, index) => (
                      <img
                        src={src}
                        alt=""
                        className={`category-image category-image-${index + 1}`}
                        key={src}
                      />
                    ))}
                  </Link>
                  <h3>{category.title}</h3>
                  <Link to="/products" className="category-link">Shop Now -></Link>
                </article>
              ))}
            </div>

            <button className="category-arrow" aria-label="Next category" onClick={showNextCategory}>
              <FiChevronRight />
            </button>
          </div>

          <div className="category-dots" aria-label="Category slides">
            {categories.map((category, index) => (
              <button
                className={`category-dot ${index === activeCategory ? 'category-dot-active' : ''}`}
                aria-label={`Show ${category.title}`}
                aria-current={index === activeCategory}
                key={category.title}
                onClick={() => setActiveCategory(index)}
              />
            ))}
          </div>

          <div className="why-card">
            <div className="why-content">
              <h2>Why Choose Shriyash Foods?</h2>
              <div className="why-grid">
                <div className="why-item">
                  <FiFeather />
                  <h3>100% Natural</h3>
                  <p>Made from premium fruits & vegetables.</p>
                </div>
                <div className="why-item">
                  <FiDroplet />
                  <h3>No Additives</h3>
                  <p>Absolutely no artificial colors or additives.</p>
                </div>
                <div className="why-item">
                  <FiZap />
                  <h3>Nutrient Rich</h3>
                  <p>Retains natural goodness & nutrients.</p>
                </div>
                <div className="why-item">
                  <FiShield />
                  <h3>Easy to Use</h3>
                  <p>Just mix & use in your daily recipes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="bestseller-section">
        <div className="section-shell">
          <div className="section-title-row">
            <div className="section-heading compact">
              <h2>Our Bestsellers</h2>
              <span aria-hidden="true"></span>
            </div>
            <Link to="/products" className="view-all-btn">View All Products -></Link>
          </div>

          <div className="bestseller-carousel">
            <button className="bestseller-arrow" aria-label="Previous bestseller" onClick={showPreviousBestseller}>
              <FiChevronLeft />
            </button>

            <div className="bestseller-track" aria-live="polite">
              {featuredBestsellers.map((product, index) => (
                <article
                  className={`bestseller-card bestseller-card-${product.position}`}
                  key={`${product.name}-${activeBestseller}-${index}`}
                >
                  <Link to="/products" className="bestseller-image">
                    <img src={product.image} alt={product.name} />
                  </Link>
                  <h3>{product.name}</h3>
                  <RatingStars />
                  <p className="product-price">
                    <span>{product.oldPrice}</span>
                    {product.price}
                  </p>
                  <Link to="/products" className="add-cart-btn">Shop Now</Link>
                </article>
              ))}
            </div>

            <button className="bestseller-arrow" aria-label="Next bestseller" onClick={showNextBestseller}>
              <FiChevronRight />
            </button>
          </div>

          <div className="bestseller-dots" aria-label="Bestseller slides">
            {bestsellers.map((product, index) => (
              <button
                className={`bestseller-dot ${index === activeBestseller ? 'bestseller-dot-active' : ''}`}
                aria-label={`Show ${product.name}`}
                aria-current={index === activeBestseller}
                key={product.name}
                onClick={() => setActiveBestseller(index)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

