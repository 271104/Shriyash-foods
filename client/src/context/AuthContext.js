import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Setup axios interceptors for token management
  useEffect(() => {
    setupAxiosInterceptors();
    initializeAuth();
    // Run once on app start so token state is restored before rendering auth-only UI.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setupAxiosInterceptors = () => {
    // Request interceptor to add token
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && 
            error.response?.data?.code === 'TOKEN_EXPIRED' && 
            !originalRequest._retry) {
          
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const { data } = await axios.post('/auth/refresh-token', {
                refreshToken
              });
              
              localStorage.setItem('accessToken', data.accessToken);
              localStorage.setItem('refreshToken', data.refreshToken);
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            logout();
          }
        }

        return Promise.reject(error);
      }
    );
  };

  const initializeAuth = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (accessToken && refreshToken) {
        await fetchUser();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const { data } = await axios.get('/auth/me');
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Fetch user error:', error);
      logout();
      throw error;
    }
  };

  const sendOTP = async (phone, purpose = 'login') => {
    try {
      const { data } = await axios.post('/auth/send-otp', { 
        phone, 
        purpose 
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const verifyOTPAndLogin = async (phone, otp, purpose = 'login', guestData = null, userData = null) => {
    try {
      const { data } = await axios.post('/auth/verify-otp', { 
        phone, 
        otp, 
        purpose,
        guestData,
        userData
      });

      if (purpose === 'checkout_guest') {
        return data;
      }
      
      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // Set user state
      setUser(data.user);
      setIsAuthenticated(true);
      
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const logout = async () => {
    try {
      // Call logout API if user is authenticated
      if (isAuthenticated) {
        await axios.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await axios.put('/auth/profile', profileData);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const mergeGuestCart = async (guestCartItems) => {
    try {
      const { data } = await axios.post('/auth/merge-guest-cart', {
        guestCartItems
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // Check if user is guest (not fully registered)
  const isGuest = user && user.isGuest;

  const value = {
    user,
    loading,
    isAuthenticated,
    isGuest,
    sendOTP,
    verifyOTPAndLogin,
    logout,
    updateProfile,
    mergeGuestCart,
    fetchUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
