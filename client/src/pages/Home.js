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
  {
    title: 'Spice Powders',
    images: ['/shop_by_Category/spice_powder.png'],
  },
  {
    title: 'Superfood Powders',
    images: ['/shop_by_Category/superfood_powder.png'],
  },
  {
    title: 'Powder Mixes',
    images: ['/shop_by_Category/powder_mixes.png'],
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
