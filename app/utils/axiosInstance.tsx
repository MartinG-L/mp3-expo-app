import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { router } from 'expo-router';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL, 
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
        await AsyncStorage.multiRemove(["token", "userId"]);
        router.replace("/auth/login");
        
        return Promise.resolve({ data: null, status: 401 });
      }

      return Promise.reject(error);
    }
);

export default axiosInstance;