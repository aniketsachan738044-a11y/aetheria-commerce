import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart({ items: [], totalAmount: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      setCart(res.data.cart || { items: [], totalAmount: 0 });
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await api.post('/cart', { productId, quantity });
    setCart(res.data.cart);
    return res;
  };

  const updateQuantity = async (productId, quantity) => {
    const res = await api.put(`/cart/${productId}`, { quantity });
    setCart(res.data.cart);
    return res;
  };

  const removeFromCart = async (productId) => {
    const res = await api.delete(`/cart/${productId}`);
    setCart(res.data.cart);
    return res;
  };

  const clearCart = async () => {
    const res = await api.delete('/cart');
    setCart({ items: [], totalAmount: 0 });
    return res;
  };

  const cartCount = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
