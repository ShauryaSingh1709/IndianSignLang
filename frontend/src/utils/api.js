import axios from 'axios';

// API URL
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

console.log('🔗 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  verify: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  }
};

// Prediction API - Fast and reliable
export const predictSign = async (imageBase64, expectedLetter = null) => {
  try {
    const response = await api.post('/predict/', {
      image: imageBase64,
      expected: expectedLetter
    });
    
    return response.data;
  } catch (error) {
    console.error('Prediction API error:', error.message);
    
    // Return error response
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Prediction failed',
      handDetected: false,
      predicted: null,
      confidence: 0
    };
  }
};

// Check model health
export const checkModelHealth = async () => {
  try {
    const response = await api.get('/predict/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error.message);
    return { status: 'unavailable' };
  }
};

export default api;