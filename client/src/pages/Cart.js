import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiMinus, FiPlus, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, changeCartItemVariant, updateCartQuantity, cartTotal } = useCart();

  const getVariantPrice = (product, variantWeight) => {
    return product.variants?.find(variant => variant.weight === variantWeight)?.price || 0;
  };

  const handleQuantityChange = (item, nextQuantity) => {
    const quantity = Math.max(1, Number(nextQuantity) || 1);
    updateCartQuantity(item._id, quantity);
  };

  const handleRemoveOne = (item) => {
    updateCartQuantity(item._id, (item.quantity || 1) - 1);
  };

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
                  <div className="cart-edit-grid">
                    <label>
                      <span>Weight</span>
                      <select
                        value={item.variant}
                        onChange={(event) => changeCartItemVariant(item, event.target.value)}
                      >
                        {item.product.variants?.map((variant) => (
                          <option value={variant.weight} key={variant.weight}>
                            {variant.weight} - &#8377;{variant.price}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>Quantity</span>
                      <div className="cart-quantity-control">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item, (item.quantity || 1) - 1)}
                          aria-label={`Decrease ${item.product.name} quantity`}
                        >
                          <FiMinus />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) => handleQuantityChange(item, event.target.value)}
                          aria-label={`${item.product.name} quantity`}
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item, (item.quantity || 1) + 1)}
                          aria-label={`Increase ${item.product.name} quantity`}
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </label>
                  </div>
                  <p className="item-price">&#8377;{getVariantPrice(item.product, item.variant) || item.price} each</p>
                </div>

                <div className="item-actions">
                  <span className="item-total">&#8377;{item.price * item.quantity}</span>
                  <button
                    onClick={() => handleRemoveOne(item)}
                    className="btn-remove"
                    title="Remove one item"
                    aria-label={`Remove one ${item.product.name}`}
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
              <span>&#8377;{cartTotal}</span>
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
