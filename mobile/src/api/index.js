import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// API_BASE_URL_START
export const API_BASE_URL = 'https://necklace-insight-starring-machinery.trycloudflare.com/api/v1';
// API_BASE_URL_END

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Credentials needed for HttpOnly refreshToken cookie from Backend (for mobile web)
  withCredentials: true 
});

// Automatically attach Token to Header if available
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Logic to handle 401 errors (Token expired / Authentication error)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('❌ Unauthorized (401). Removing local Token...');
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('userData');
      // User only needs to reload or reopen App to be kicked to default Login screen
    }
    return Promise.reject(error);
  }
);

export default api;
