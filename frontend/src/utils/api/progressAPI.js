import axiosInstance from './axios';

export const progressAPI = {
  getStats: async () => {
    const response = await axiosInstance.get('/progress/stats');
    return response.data;
  },

  getLessonProgress: async () => {
    const response = await axiosInstance.get('/progress/lessons');
    return response.data;
  },

  updateProgress: async (lessonId, data) => {
    const response = await axiosInstance.post(`/progress/lessons/${lessonId}`, data);
    return response.data;
  },

  resetProgress: async (lessonId) => {
    const response = await axiosInstance.delete(`/progress/lessons/${lessonId}`);
    return response.data;
  },
};