import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

export const CartContext = createContext();

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  // Generate session ID for guest users
  const getSessionId = () => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  const fetchCart = async () => {
    try {
      const headers = {};
      
      if (isAuthenticated) {
        // For authenticated users, use Authorization header
        const token = localStorage.getItem('accessToken');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } else {
        // For guest users, use session ID
        headers['x-session-id'] = getSessionId();
      }
      
      const { data } = await axios.get('/cart', { headers });
      setCart(data.cart || { items: [] });
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const addToCart = async (productId, variant, quantity = 1) => {
    try {
      const headers = {};
      
      if (isAuthenticated) {
        const token = localStorage.getItem('accessToken');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } else {
        headers['x-session-id'] = getSessionId();
      }
      
      const { data } = await axios.post('/cart/add', {
        productId,
        variant,
        quantity
      }, { headers });
      
      setCart(data.cart);
      return data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const headers = {};
      
      if (isAuthenticated) {
        const token = localStorage.getItem('accessToken');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } else {
        headers['x-session-id'] = getSessionId();
      }
      
      const { data } = await axios.delete(`/cart/remove/${itemId}`, { headers });
      setCart(data.cart);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateCartQuantity = async (itemId, quantity) => {
    try {
      if (quantity <= 0) {
        return removeFromCart(itemId);
      }

      const headers = {};
      
      if (isAuthenticated) {
        const token = localStorage.getItem('accessToken');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } else {
        headers['x-session-id'] = getSessionId();
      }
      
      const { data } = await axios.put(`/cart/update/${itemId}`, { quantity }, { headers });
      setCart(data.cart);
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  const clearCart = async () => {
    try {
      const headers = {};
      
      if (isAuthenticated) {
        const token = localStorage.getItem('accessToken');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } else {
        headers['x-session-id'] = getSessionId();
      }
      
      await axios.delete('/cart/clear', { headers });
      setCart({ items: [] });
    } catch (error) {
      console.error('Error clearing cart:', error);
      setCart({ items: [] });
    }
  };

  // Merge guest cart with user cart after authentication
  const mergeGuestCart = async () => {
    try {
      if (!isAuthenticated) return;
      
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) return;

      // Send merge request to backend
      const { data } = await axios.post('/cart/merge-guest', {
        sessionId
      });

      // Update cart with merged data
      setCart(data.cart);
      
      // Clear session ID since user is now authenticated
      localStorage.removeItem('sessionId');
      
      return data;
    } catch (error) {
      console.error('Error merging guest cart:', error);
      throw error;
    }
  };

  const cartItems = cart.items.filter(item => item.product);

  // Get cart totals
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 0;
    return sum + (price * quantity);
  }, 0);

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Get cart items count by product (for display)
  const getProductQuantity = (productId, variant) => {
    const item = cartItems.find(
      item => item.product?._id === productId && item.variant === variant
    );
    return item ? item.quantity : 0;
  };

  const value = {
    cart,
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    fetchCart,
    mergeGuestCart,
    cartTotal,
    cartCount,
    getProductQuantity,
    isGuestCart: !isAuthenticated
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
