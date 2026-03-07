import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

export const predictionAPI = {
  predictSign: async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const token = localStorage.getItem('accessToken');
    const response = await axios.post(`${API_BASE_URL}/prediction/predict`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  predictFromVideo: async (videoBlob) => {
    const formData = new FormData();
    formData.append('video', videoBlob);

    const token = localStorage.getItem('accessToken');
    const response = await axios.post(`${API_BASE_URL}/prediction/predict-video`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};