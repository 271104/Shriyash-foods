import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiStar, FiChevronLeft, FiChevronRight, FiFeather, FiDroplet, FiZap, FiShoppingCart } from 'react-icons/fi';
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
  { name: 'Onion Powder', image: '/onion-removebg-preview.png', oldPrice: 'Rs. 249.00', price: 'Rs. 199.00' },
  { name: 'ABC Powder', image: '/abc-removebg-preview.png', oldPrice: 'Rs. 299.00', price: 'Rs. 249.00' },
];

const blogPosts = [
  {
    category: 'Nutrition',
    title: 'Benefits of Moringa Powder for a Healthy Lifestyle',
    image: '/moringa-removebg-preview.png',
  },
  {
    category: 'Wellness',
    title: '5 Easy Ways to Add Superfood Powders to Your Diet',
    image: '/carrot-removebg-preview.png',
  },
  {
    category: 'Recipes',
    title: 'Healthy Recipes Using Fruit & Vegetable Powders',
    image: '/abc-removebg-preview.png',
  },
];

const RatingStars = () => (
  <span className="rating-stars" aria-label="5 star rating">
    {[1, 2, 3, 4, 5].map((star) => (
      <FiStar key={star} />
    ))}
  </span>
);

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

    const animateElements = document.querySelectorAll('.category-item, .why-card, .bestseller-card, .testimonial-card, .blog-card');
    animateElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
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
              <div className="value-icon">👥</div>
              <p>At Shriyash Foods, we are building a bridge between hardworking farmers and health-conscious families across the world.</p>
            </div>
            
            <div className="value-prop">
              <div className="value-icon">🌾</div>
              <p>By transforming fresh farm produce into premium dehydrated products, we help preserve nature's nutrition with quality and care.</p>
            </div>
            
            <div className="value-prop">
              <div className="value-icon">🌍</div>
              <p>Our vision is to create sustainable food solutions that support farmers, reduce wastage, and promote healthier lifestyles globally.</p>
            </div>
            
            <div className="value-prop">
              <div className="value-icon">✓</div>
              <p>With innovation, hygiene, and authenticity at our core, we are shaping the future of natural food - one product at a time.</p>
            </div>
          </div>
          
          <div className="hero-buttons">
            <Link to="/products" className="hero-btn hero-btn-green">
              Explore Products →
            </Link>
            <Link to="/about" className="hero-btn hero-btn-orange">
              Our Journey →
            </Link>
          </div>
        </div>
        
        <div className="hero-image-right">
          <img src="/hero.png" alt="Shriyash Foods Products and Manufacturing" className="hero-showcase-image" />
        </div>
      </section>
      
      {/* Trust Badges */}
      <section className="trust-badges">
        <div className="trust-badge">
          <div className="trust-icon">🍃</div>
          <div className="trust-text">
            <strong>100% Natural</strong>
            <span>Ingredients</span>
          </div>
        </div>
        <div className="trust-badge">
          <div className="trust-icon">🤝</div>
          <div className="trust-text">
            <strong>Supporting</strong>
            <span>Farmers</span>
          </div>
        </div>
        <div className="trust-badge">
          <div className="trust-icon">✨</div>
          <div className="trust-text">
            <strong>Hygienically</strong>
            <span>Processed</span>
          </div>
        </div>
        <div className="trust-badge">
          <div className="trust-icon">🌱</div>
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
            <button className="category-arrow" aria-label="Previous category">
              <FiChevronLeft />
            </button>

            <div className="category-grid">
              {categories.map((category) => (
                <article className={`category-item ${category.title === 'Powder Mixes' ? 'category-item-powder-mixes' : ''}`} key={category.title}>
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

            <button className="category-arrow" aria-label="Next category">
              <FiChevronRight />
            </button>
          </div>

          <div className="why-card">
            <div className="why-image-wrap">
              <img src="/moringa-removebg-preview.png" alt="Moringa powder" />
            </div>
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

          <div className="bestseller-grid">
            {bestsellers.map((product) => (
              <article className="bestseller-card" key={product.name}>
                <Link to="/products" className="bestseller-image">
                  <img src={product.image} alt={product.name} />
                </Link>
                <h3>{product.name}</h3>
                <RatingStars />
                <p className="product-price">
                  <span>{product.oldPrice}</span>
                  {product.price}
                </p>
                <button className="add-cart-btn">
                  <FiShoppingCart /> Add to Cart
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="blog-preview-section">
        <div className="section-shell">
          <div className="section-title-row">
            <div className="section-heading compact">
              <h2>Latest from Our Blog</h2>
              <span aria-hidden="true"></span>
            </div>
            <Link to="/blogs" className="view-all-link">View All Posts -></Link>
          </div>

          <div className="blog-preview-grid">
            {blogPosts.map((post) => (
              <article className="blog-card" key={post.title}>
                <div className="blog-image">
                  <img src={post.image} alt={post.title} />
                </div>
                <div className="blog-content">
                  <span>{post.category}</span>
                  <h3>{post.title}</h3>
                  <p>May 10, 2026 - 5 min read</p>
                  <Link to="/blogs">Read More -></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
