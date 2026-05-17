import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Products.css';

const fallbackProducts = [
  {
    _id: 'tomato-powder',
    name: 'Tomato Powder',
    slug: 'tomato-powder',
    description: 'Premium tomato powder rich in lycopene and antioxidants. Perfect for cooking, sauces, and adding authentic tomato flavor.',
    images: [{ url: '/tomato-removebg-preview.png' }],
    variants: [{ price: 199, mrp: 249 }],
  },
  {
    _id: 'beetroot-powder',
    name: 'Beetroot Powder',
    slug: 'beetroot-powder',
    description: 'Natural beetroot powder for healthy circulation, stamina, smoothies, juices, and everyday wellness.',
    images: [{ url: '/beetroot-removebg-preview.png' }],
    variants: [{ price: 199, mrp: 249 }],
  },
  {
    _id: 'banana-powder',
    name: 'Banana Powder',
    slug: 'banana-powder',
    description: 'Natural banana powder rich in potassium and energy. Great for smoothies, desserts, and baby food.',
    images: [{ url: '/banana-removebg-preview.png' }],
    variants: [{ price: 199, mrp: 249 }],
  },
  {
    _id: 'moringa-powder',
    name: 'Moringa Powder',
    slug: 'moringa-powder',
    description: 'Pure moringa powder packed with vitamins, minerals, antioxidants, and natural daily nutrition.',
    images: [{ url: '/moringa-removebg-preview.png' }],
    variants: [{ price: 249, mrp: 299 }],
  },
  {
    _id: 'onion-powder',
    name: 'Onion Powder',
    slug: 'onion-powder',
    description: 'Premium onion powder for cooking, seasoning, marinades, soups, and authentic home-style flavor.',
    images: [{ url: '/onion-removebg-preview.png' }],
    variants: [{ price: 199, mrp: 249 }],
  },
  {
    _id: 'abc-powder',
    name: 'ABC Powder',
    slug: 'abc-powder',
    description: 'Amla, Beetroot, and Carrot powder blend crafted for everyday nourishment and wellness routines.',
    images: [{ url: '/abc-removebg-preview.png' }],
    variants: [{ price: 249, mrp: 299 }],
  },
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

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
      const { data } = await axios.get('/api/products');
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
        <h1>Our Premium Products</h1>
        <p className="subtitle">Handpicked health powders for your wellness journey</p>

        <div className="products-grid">
          {products.map(product => {
            const variant = product.variants[0];
            const discount = variant.mrp > variant.price ? calculateDiscount(variant.mrp, variant.price) : 0;
            
            return (
              <Link to={`/products/${product.slug}`} key={product._id} className="product-card">
                <div className="product-image">
                  <img 
                    src={product.images[0]?.url || '/placeholder.jpg'} 
                    alt={product.name}
                  />
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-desc">{product.description.substring(0, 80)}...</p>
                  <div className="product-price">
                    <span className="price">₹{variant.price}</span>
                    {variant.mrp > variant.price && (
                      <>
                        <span className="mrp">₹{variant.mrp}</span>
                        <span className="discount-badge">{discount}% OFF</span>
                      </>
                    )}
                  </div>
                  <button className="btn btn-primary btn-block">View Details</button>
                </div>
              </Link>
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
