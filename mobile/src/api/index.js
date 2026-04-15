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
  // Để refreshToken ở Backend ghi dạng HttpOnly Cookie vẫn cần credentials (với di động web)
  withCredentials: true 
});

// Gắn Token tự động vào Header nếu có
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Bổ sung logic bắt lỗi 401 (Hết hạn Token / Lỗi xác thực)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('❌ Mất phần quyền (401). Đang xóa Token nội bộ...');
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('userData');
      // Người dùng chỉ cần F5 hoặc mở lại App sẽ văng ra màn Login mặc định
    }
    return Promise.reject(error);
  }
);

export default api;
