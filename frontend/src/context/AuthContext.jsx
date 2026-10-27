import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);

  // Fetch current logged-in user on mount
  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/current_user');
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        setWishlistIds(res.data.user.wishlist || []);
      } else {
        setUser(null);
        setWishlistIds([]);
      }
    } catch (err) {
      setUser(null);
      setWishlistIds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (identifier, password) => {
    try {
      const res = await api.post('/auth/login', { identifier, username: identifier, password });
      if (res.data.success) {
        setUser(res.data.user);
        setWishlistIds(res.data.user.wishlist || []);
        toast.success(res.data.message || `Welcome back, ${res.data.user.username}!`);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await api.post('/auth/signup', userData);
      if (res.data.success) {
        setUser(res.data.user);
        setWishlistIds(res.data.user.wishlist || []);
        toast.success(res.data.message || 'Account created successfully!');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      const res = await api.post('/auth/logout');
      if (res.data.success) {
        setUser(null);
        setWishlistIds([]);
        toast.info('Logged out successfully.');
      }
    } catch (err) {
      toast.error('Logout failed.');
    }
  };

  const toggleWishlist = async (listingId) => {
    if (!user) {
      toast.warn('Please log in to save materials to your wishlist!');
      return false;
    }

    try {
      const res = await api.post(`/listings/${listingId}/wishlist`);
      if (res.data.success) {
        const isNowSaved = res.data.isSaved;
        if (isNowSaved) {
          setWishlistIds((prev) => [...prev, listingId]);
          toast.success('Saved to your Wishlist!');
        } else {
          setWishlistIds((prev) => prev.filter((id) => (typeof id === 'string' ? id !== listingId : id._id !== listingId)));
          toast.info('Removed from Wishlist.');
        }
        return isNowSaved;
      }
    } catch (err) {
      toast.error('Could not update wishlist.');
      return false;
    }
  };

  const isSaved = (listingId) => {
    return wishlistIds.some((id) => (typeof id === 'string' ? id === listingId : id?._id === listingId));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        wishlistCount: wishlistIds.length,
        wishlistIds,
        login,
        signup,
        logout,
        toggleWishlist,
        isSaved,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
