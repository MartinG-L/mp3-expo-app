import { getLogout } from "@/contexts/AuthContext";
import { showSessionExpired } from '@/lib/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';


const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
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
    if (error.response?.status === 401 || error.response?.status === 403) {
        const logout = getLogout();
        logout && logout();
        router.replace("/auth/login");
        showSessionExpired("Sesión expirada. Por favor, inicia sesión nuevamente.");
        return Promise.resolve({ data: null, status: 401 });
      }

      return Promise.reject(error);
    }
);

export default axiosInstance;