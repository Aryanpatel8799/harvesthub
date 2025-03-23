import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Create axios instance with base URL and default configs
const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

  // Update localStorage whenever user changes
  useEffect(() => {
    saveUserToStorage(user);
  }, [user]);

  useEffect(() => {
    // Log cookie on initial render for debugging
    const authCookie = getCookie('token');
    console.log('Auth cookie on init:', authCookie ? 'present' : 'none');
    
    // Only check auth status if we don't have a user
    if (!user) {
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Determine the endpoint based on userType in localStorage
      const userType = localStorage.getItem('userType');
      let endpoint;
      
      if (userType === 'farmer') {
        endpoint = '/api/farmers/check-auth';
      } else if (userType === 'consumer') {
        endpoint = '/api/consumers/check-auth';
      } else if (userType === 'admin') {
        endpoint = '/api/admin/check-auth';
      } else {
        // Default if no userType is stored
        endpoint = '/api/users/check-auth';
      }
      
      console.log('Checking auth status with endpoint:', endpoint);
      const response = await api.get(endpoint);

      if (response.data && response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth status check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, type: 'farmer' | 'consumer' | 'admin') => {
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
      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
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

      const response = await api.put(endpoint, data);
      setUser(response.data.user);
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