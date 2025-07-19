// API Configuration
export const API_BASE_URL = 'http://localhost:4000';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    VERIFY: '/api/auth/verify',
  },
  
  // User endpoints
  USERS: {
    PROFILE: '/api/auth/profile',
    UPDATE: '/api/auth/update',
  },
  
  // Farmer endpoints
  FARMERS: {
    REGISTER: '/api/farmers/register',
    PROFILE: '/api/farmers/profile',
    PRODUCTS: '/api/farmers/products',
    ORDERS: '/api/farmers/orders',
  },
  
  // Consumer endpoints
  CONSUMERS: {
    REGISTER: '/api/consumers/register',
    PROFILE: '/api/consumers/profile',
    ORDERS: '/api/consumers/orders',
  },
  
  // Product endpoints
  PRODUCTS: {
    LIST: '/api/products',
    CREATE: '/api/products',
    DETAILS: (id: string) => `/api/products/${id}`,
    UPDATE: (id: string) => `/api/products/${id}`,
    DELETE: (id: string) => `/api/products/${id}`,
  },
  
  // Order endpoints
  ORDERS: {
    CREATE: '/api/orders',
    LIST: '/api/orders',
    DETAILS: (id: string) => `/api/orders/${id}`,
    UPDATE: (id: string) => `/api/orders/${id}`,
  },
  
  // Payment endpoints
  PAYMENTS: {
    CREATE_PAYMENT_INTENT: '/api/payments/create-payment-intent',
    WEBHOOK: '/api/payments/webhook',
  },
  
  // Soil endpoints
  SOIL: {
    DETAILS: '/api/soil/details',
    CERTIFICATION: '/api/soil/certification',
  },
  
  // Admin endpoints
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    USERS: '/api/admin/users',
    PRODUCTS: '/api/admin/products',
  },
  
  // Market data endpoints
  MARKET_DATA: {
    TRENDS: '/api/market-data/trends',
    PRICES: '/api/market-data/prices',
  },
  
  // Translation endpoints
  TRANSLATIONS: {
    TRANSLATE: '/api/translations/translate',
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to get full URL for images and files
export const getFullUrl = (url: string): string => {
  if (url.startsWith('http')) {
    return url;
  }
  return `${API_BASE_URL}${url}`;
};

// Axios configuration
export const axiosConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
}; 