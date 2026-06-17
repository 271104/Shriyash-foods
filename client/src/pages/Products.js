import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Products.css';

const fallbackProducts = [
  {
    _id: 'tomato-powder',
    name: 'Tomato Powder',
    slug: 'tomato-powder',
    description: 'Premium Tomato Powder - Rich in lycopene & antioxidants that supports immunity, enhances flavor naturally, and serves as a convenient replacement for fresh tomato.',
    images: [{ url: '/tomato-removebg-preview.png' }],
    variants: [{ price: 10, mrp: 249 }],
  },
  {
    _id: 'beetroot-powder',
    name: 'Beetroot Powder',
    slug: 'beetroot-powder',
    description: 'Natural Beetroot Powder - Rich in iron & antioxidants that helps boost immunity, supports stamina & blood circulation, and increases energy naturally.',
    images: [{ url: '/beetroot-removebg-preview.png' }],
    variants: [{ price: 199, mrp: 249 }],
  },
  {
    _id: 'banana-powder',
    name: 'Banana Powder',
    slug: 'banana-powder',
    description: 'Natural Banana Powder - A rich source of natural energy and potassium that supports digestion, helps in healthy weight management, and is naturally sweet & nutritious.',
    images: [{ url: '/banana-removebg-preview.png' }],
    variants: [{ price: 199, mrp: 249 }],
  },
  {
    _id: 'moringa-powder',
    name: 'Moringa Powder',
    slug: 'moringa-powder',
    description: 'Pure Moringa Powder - A nutrient-rich superfood packed with vitamins & minerals that supports overall wellness, improves energy naturally, and boosts immunity.',
    images: [{ url: '/moringa-removebg-preview.png' }],
    variants: [{ price: 249, mrp: 299 }],
  },
  {
    _id: 'onion-powder',
    name: 'Onion Powder',
    slug: 'onion-powder',
    description: 'Premium Onion Powder - Enhances flavor naturally, rich in antioxidants, supports heart health, and serves as a convenient substitute for fresh onion.',
    images: [{ url: '/onion-removebg-preview.png' }],
    variants: [{ price: 199, mrp: 249 }],
  },
  {
    _id: 'abc-powder',
    name: 'ABC Powder',
    slug: 'abc-powder',
    description: 'ABC Powder (Apple + Beetroot + Carrot) - A powerful blend rich in antioxidants & vitamins that supports immunity, improves energy levels, and promotes overall wellness.',
    images: [{ url: '/abc-removebg-preview.png' }],
    variants: [{ price: 249, mrp: 299 }],
  },
];

const categorySections = [
  {
    id: 'green-powder',
    title: 'Green Powder',
    description: 'Nutrient-rich green superfood powders.',
    productKeys: ['moringa']
  },
  {
    id: 'fruits',
    title: 'Fruits',
    description: 'Naturally sweet and wholesome fruit-based powders.',
    productKeys: ['apple', 'banana', 'tomato', 'abc']
  },
  {
    id: 'vegetables',
    title: 'Vegetables',
    description: 'Everyday vegetable powders for flavor and nutrition.',
    productKeys: ['tomato', 'onion', 'beetroot']
  }
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlightedCategory, setHighlightedCategory] = useState('');
  const location = useLocation();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (loading || !location.hash) return undefined;

    const categoryId = location.hash.replace('#', '');
    const target = document.getElementById(categoryId);

    if (!target) return undefined;

    const scrollTimer = setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHighlightedCategory(categoryId);
    }, 120);

    const highlightTimer = setTimeout(() => {
      setHighlightedCategory('');
    }, 2600);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(highlightTimer);
    };
  }, [loading, location.hash, products]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, observerOptions);

    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [products]);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/products');
      setProducts(data.products?.length ? data.products : fallbackProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = (mrp, price) => {
    return Math.round(((mrp - price) / mrp) * 100);
  };

  const productMatchesKey = (product, key) => {
    const searchable = `${product.slug || ''} ${product.name || ''}`.toLowerCase();
    return searchable.includes(key);
  };

  const getCategoryProducts = (productKeys) => {
    return productKeys
      .map(key => products.find(product => productMatchesKey(product, key)))
      .filter(Boolean);
  };

  const renderProductCard = (product, isHighlighted = false) => {
    const variant = product.variants[0];
    const discount = variant.mrp > variant.price ? calculateDiscount(variant.mrp, variant.price) : 0;

    return (
      <Link
        to={`/products/${product.slug}`}
        key={`${product._id}-${product.slug}`}
        className={`product-card ${isHighlighted ? 'product-card-highlight' : ''}`}
      >
        {discount > 0 && (
          <div className="product-badge">{discount}% OFF</div>
        )}
        <div className="product-image">
          <img
            src={product.images[0]?.url || '/placeholder.jpg'}
            alt={product.name}
          />
        </div>
        <div className="product-info">
          <h3>{product.name}</h3>
          <p className="product-desc">{product.description}</p>
          <div className="product-price">
            <span className="price">₹{variant.price}</span>
            {variant.mrp > variant.price && (
              <>
                <span className="mrp">₹{variant.mrp}</span>
                <span className="discount-badge">SAVE ₹{variant.mrp - variant.price}</span>
              </>
            )}
          </div>
          <button className="btn btn-primary btn-block">View Details &rarr;</button>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <h1>Our Premium Products</h1>
          <p className="subtitle">Handpicked health powders for your wellness journey</p>
        </div>

        <div className="product-categories">
          {categorySections.map((category) => {
            const categoryProducts = getCategoryProducts(category.productKeys);

            if (categoryProducts.length === 0) return null;

            return (
              <section className="product-category" id={category.id} key={category.title}>
                <div className="category-heading">
                  <h2>{category.title}</h2>
                  <p>{category.description}</p>
                </div>
                <div className="products-grid">
                  {categoryProducts.map((product) => renderProductCard(
                    product,
                    highlightedCategory === category.id
                  ))}
                </div>
              </section>
            );
          })}
        </div>
        {products.length === 0 && (
          <div className="no-products">
            <p>No products available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;


