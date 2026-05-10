import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { FiShoppingCart, FiCheck } from 'react-icons/fi';
import './ProductDetail.css';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`/api/products/${slug}`);
      setProduct(data.product);
      setSelectedVariant(data.product.variants[0]);
    } catch (error) {
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Please select a variant');
      return;
    }

    setAdding(true);
    try {
      await addToCart(product._id, selectedVariant.weight, quantity);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="product-detail-grid">
          <div className="product-images">
            <img 
              src={product.images[0]?.url || '/placeholder.jpg'} 
              alt={product.name}
            />
          </div>

          <div className="product-details">
            <h1>{product.name}</h1>
            <p className="product-description">{product.description}</p>

            <div className="variant-selector">
              <label>Select Size:</label>
              <div className="variants">
                {product.variants.map(variant => (
                  <button
                    key={variant._id}
                    className={`variant-btn ${selectedVariant?._id === variant._id ? 'active' : ''}`}
                    onClick={() => setSelectedVariant(variant)}
                  >
                    {variant.weight}
                  </button>
                ))}
              </div>
            </div>

            {selectedVariant && (
              <div className="price-section">
                <span className="price">₹{selectedVariant.price}</span>
                {selectedVariant.mrp > selectedVariant.price && (
                  <>
                    <span className="mrp">₹{selectedVariant.mrp}</span>
                    <span className="discount">
                      {Math.round(((selectedVariant.mrp - selectedVariant.price) / selectedVariant.mrp) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
            )}

            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={adding}
              className="btn btn-primary btn-block"
            >
              <FiShoppingCart />
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>

            {product.benefits && product.benefits.length > 0 && (
              <div className="benefits-section">
                <h3>Benefits:</h3>
                <ul>
                  {product.benefits.map((benefit, index) => (
                    <li key={index}>
                      <FiCheck /> {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.usage && (
              <div className="usage-section">
                <h3>How to Use:</h3>
                <p>{product.usage}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
