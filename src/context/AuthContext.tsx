import React, { createContext, useState, useContext, useEffect, useRef, ReactNode } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Create axios instance with base URL and default configs
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Since the token is set as httpOnly cookie, we don't need to manually add it
    // The browser will automatically include it with withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear user data
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      console.log('Authentication failed, clearing user data');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        console.log('Redirecting to login page');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface User {
  _id: string;
  fullName: string;
  email: string;
  type: 'farmer' | 'consumer' | 'admin';
  location?: string;
  description?: string;
  farmImages?: Array<{ url: string; caption: string }>;
  farmVideos?: Array<{ url: string; caption: string }>;
  totalOrders?: number;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, type: 'farmer' | 'consumer' | 'admin') => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Function to save user data to localStorage
const saveUserToStorage = (user: User | null) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userType', user.type);
  } else {
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  }
};

// Function to get user data from localStorage
const getUserFromStorage = (): User | null => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }
  return null;
};

// Add this helper function at the top level for debugging cookies
function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize user state from localStorage
  const [user, setUser] = useState<User | null>(() => getUserFromStorage());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasCheckedAuth = useRef(false);

  // Update localStorage whenever user changes
  useEffect(() => {
    saveUserToStorage(user);
  }, [user]);

  useEffect(() => {
    // Only check auth status once on mount
    if (hasCheckedAuth.current) {
      setLoading(false);
      return;
    }

    console.log('AuthProvider mounted, checking auth status');
    console.log('Current pathname:', window.location.pathname);

    // Check if user is already in localStorage
    const storedUser = getUserFromStorage();
    if (storedUser) {
      console.log('User found in localStorage:', storedUser);
      
      // Check if token cookie exists
      const token = getCookie('token');
      if (!token) {
        console.log('User found in localStorage but no token cookie - clearing user data');
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        setLoading(false);
        hasCheckedAuth.current = true;
        return;
      }
      
      setUser(storedUser);
      setLoading(false);
      hasCheckedAuth.current = true;
      return;
    }

    // If no stored user, try to check auth status from server
    checkAuthStatus();
    hasCheckedAuth.current = true;
  }, []); // Empty dependency array - only run once

  const checkAuthStatus = async () => {
    try {
      // Use the general auth endpoint since specific check-auth endpoints don't exist
      const endpoint = '/api/auth/check-auth';
      
      console.log('Checking auth status with endpoint:', endpoint);
      const response = await api.get(endpoint);

      if (response.data && response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth status check error:', error);
      // If check-auth fails, just set user to null without trying localStorage
      // This prevents infinite loops
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, type: 'farmer' | 'consumer' | 'admin') => {
    console.log('Login function called with:', { email, password, type });
    setLoading(true);
    setError(null);
    
    try {
      let endpoint;
      
      if (type === 'farmer') {
        endpoint = '/api/farmers/login';
      } else if (type === 'consumer') {
        endpoint = '/api/consumers/login';
      } else {
        endpoint = '/api/admin/login';
      }
      
      console.log(`Attempting login to: ${endpoint}`);
      console.log('Login data:', { email, password, userType: type });
      
      const response = await api.post(endpoint, { 
        email, 
        password,
        userType: type
      });
      
      const userData = response.data.user;
      console.log('Login response:', response.data);
      
      setUser({
        ...userData,
        type
      });
      
      setLoading(false);
      console.log('Login successful, user set');
      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Login error response:', err.response?.data);
      console.error('Login error status:', err.response?.status);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
      console.log('Login failed, returning false');
      return false;
    }
  };

  const logout = async () => {
    try {
      // Determine the endpoint based on current user type
      let endpoint;
      
      if (user?.type === 'farmer') {
        endpoint = '/api/farmers/logout';
      } else if (user?.type === 'consumer') {
        endpoint = '/api/consumers/logout';
      } else if (user?.type === 'admin') {
        endpoint = '/api/admin/logout';
      } else {
        endpoint = '/api/users/logout';
      }
      
      await api.post(endpoint);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the server-side logout fails, clear the user from state
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('No user logged in');

    try {
      let endpoint;
      
      if (user.type === 'farmer') {
        endpoint = '/api/farmers/profile';
      } else if (user.type === 'consumer') {
        endpoint = '/api/consumers/profile';
      } else if (user.type === 'admin') {
        endpoint = '/api/admin/profile';
      } else {
        endpoint = '/api/users/profile';
      }

      console.log('Updating profile for user type:', user.type);
      console.log('Using endpoint:', endpoint);
      console.log('Request data:', data);

      const response = await api.put(endpoint, data);
      console.log('Profile update response:', response.data);
      
      // Handle different response formats
      if (response.data.user) {
        setUser(response.data.user);
      } else if (response.data.data) {
        // For farmer profile updates that return { success: true, data: farmer }
        setUser(response.data.data);
      } else {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      error,
      login,
      logout,
      updateProfile,
      checkAuthStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;