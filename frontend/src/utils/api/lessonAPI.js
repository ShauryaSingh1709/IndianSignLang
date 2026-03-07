import axiosInstance from './axios';

export const lessonAPI = {
  getAllLessons: async (params = {}) => {
    const response = await axiosInstance.get('/lessons', { params });
    return response.data;
  },

  getLessonById: async (id) => {
    const response = await axiosInstance.get(`/lessons/${id}`);
    return response.data;
  },

  getLessonSigns: async (lessonId) => {
    const response = await axiosInstance.get(`/lessons/${lessonId}/signs`);
    return response.data;
  },

  searchLessons: async (query) => {
    const response = await axiosInstance.get('/lessons/search', {
      params: { q: query },
    });
    return response.data;
  },
};