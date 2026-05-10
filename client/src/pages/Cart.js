import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, cartTotal } = useContext(CartContext);

  if (cart.items.length === 0) {
    return (
      <div className="empty-cart">
        <FiShoppingBag size={80} />
        <h2>Your cart is empty</h2>
        <p>Add some products to get started</p>
        <Link to="/products" className="btn btn-primary">Shop Now</Link>
      </div>
    );
  }

  const shipping = cartTotal >= 500 ? 0 : 40;
  const total = cartTotal + shipping;

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>

        <div className="cart-grid">
          <div className="cart-items">
            {cart.items.map(item => (
              <div key={item._id} className="cart-item">
                <img 
                  src={item.product.images[0]?.url || '/placeholder.jpg'} 
                  alt={item.product.name}
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
              <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            {cartTotal < 500 && (
              <div className="free-shipping-msg">
                Add ₹{500 - cartTotal} more for FREE shipping!
              </div>
            )}

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
