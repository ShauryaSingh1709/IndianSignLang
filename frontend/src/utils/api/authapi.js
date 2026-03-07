import axiosInstance from './axios';

export const authAPI = {
  login: async (credentials) => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    
    const response = await axiosInstance.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await axiosInstance.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (passwords) => {
    const response = await axiosInstance.post('/auth/change-password', passwords);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};