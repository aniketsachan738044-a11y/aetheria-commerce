import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist from localStorage or API
  useEffect(() => {
    const loadWishlist = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          const res = await api.get('/wishlist');
          if (res.data?.data?.products) {
            setWishlist(res.data.data.products);
            return;
          }
        } catch {
          // fallback to localStorage if offline/error
        } finally {
          setLoading(false);
        }
      }

      // Guest / offline fallback
      try {
        const stored = localStorage.getItem('aetheria_wishlist');
        if (stored) {
          setWishlist(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to parse local wishlist:', e);
      }
    };

    loadWishlist();
  }, [isAuthenticated]);

  // Sync to localStorage
  const saveLocal = (items) => {
    try {
      localStorage.setItem('aetheria_wishlist', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save local wishlist:', e);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item) === productId);
  };

  const toggleWishlist = async (product) => {
    const pId = product._id;
    const exists = isInWishlist(pId);

    let updated;
    if (exists) {
      updated = wishlist.filter((item) => (item._id || item) !== pId);
    } else {
      updated = [...wishlist, product];
    }

    setWishlist(updated);
    saveLocal(updated);

    if (isAuthenticated) {
      try {
        await api.post(`/wishlist/toggle/${pId}`);
      } catch (err) {
        console.warn('Could not sync wishlist with server:', err.message);
      }
    }

    return !exists; // returns true if now added, false if removed
  };

  const removeFromWishlist = async (productId) => {
    const updated = wishlist.filter((item) => (item._id || item) !== productId);
    setWishlist(updated);
    saveLocal(updated);

    if (isAuthenticated) {
      try {
        await api.delete(`/wishlist/${productId}`);
      } catch (err) {
        console.warn('Could not remove wishlist from server:', err.message);
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
