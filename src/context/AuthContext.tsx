import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  farmSize?: string;
  cropTypes?: string;
  avatar?: string;
  type: 'farmer' | 'consumer' | 'admin';
  location?: string;
  description?: string;
  farmImages?: Array<{ url: string; caption: string }>;
  farmVideos?: Array<{ url: string; caption: string }>;
  totalOrders?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, type: 'farmer' | 'consumer' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/check-auth`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth status check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, type: 'farmer' | 'consumer' | 'admin') => {
    try {
      const endpoint = type === 'admin' ? 'admin/login' : type === 'farmer' ? 'farmers/login' : 'consumers/login';
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user || data.farmer || data.consumer || data.admin);
      
      // After successful login, check auth status to ensure we have the latest user data
      await checkAuthStatus();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // First try the type-specific logout
      if (user?.type) {
        const endpoint = user.type === 'admin' ? 'admin/logout' : user.type === 'farmer' ? 'farmers/logout' : 'consumers/logout';
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/${endpoint}`, {
          method: 'POST',
          credentials: 'include'
        });

        if (response.ok) {
          setUser(null);
          return;
        }
      }

      // Fallback to general logout
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;