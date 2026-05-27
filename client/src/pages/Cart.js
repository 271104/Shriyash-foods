import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, cartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <FiShoppingBag size={80} />
        <h2>Your cart is empty</h2>
        <p>Add some products to get started</p>
        <Link to="/products" className="btn btn-primary">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>

        <div className="cart-grid">
          <div className="cart-items">
            {cartItems.map(item => (
                <div key={item._id} className="cart-item">
                  <img 
                    src={item.product.images?.[0]?.url || '/placeholder.jpg'} 
                    alt={item.product.name || 'Product'}
                  />
                  <div className="item-details">
                    <h3>{item.product.name}</h3>
                    <p>Variant: {item.variant}</p>
                    <p className="item-price">₹{item.price} × {item.quantity}</p>
                  </div>
                  <div className="item-actions">
                    <span className="item-total">₹{item.price * item.quantity}</span>
                    <button 
                      onClick={() => removeFromCart(item._id)}
                      className="btn-remove"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total">
              <span>Total</span>
              <span>&#8377;{cartTotal}</span>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="btn btn-primary btn-block"
            >
              Proceed to Checkout
            </button>

            <Link to="/products" className="continue-shopping">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

