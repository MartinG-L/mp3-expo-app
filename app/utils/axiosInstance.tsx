import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';

const axiosInstance = axios.create({
  baseURL: 'http://192.168.100.6:8080', 
  timeout: 10000,  
  headers: {
    'Content-Type': 'application/json',
  }
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response, 
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado
      await AsyncStorage.removeItem('token');
      router.replace('/auth/login');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;