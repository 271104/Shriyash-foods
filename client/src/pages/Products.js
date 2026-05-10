import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Products.css';

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
      setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
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
