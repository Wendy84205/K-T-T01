import api from './index';
import { API_BASE_URL } from './index';

export const getFiles = async () => {
  const response = await api.get('/files');
  return response.data.data || [];
};

export const verifyFileIntegrity = async (fileId) => {
  const response = await api.post(`/files/${fileId}/verify`);
  return response.data.data;
};

// URL tải về dùng để mở trong WebView hoặc tải về trực tiếp
export const getFileDownloadUrl = (fileId) => {
  return `${API_BASE_URL}/files/${fileId}/download`;
};

export const deleteFile = async (fileId) => {
  const response = await api.delete(`/files/${fileId}`);
  return response.data.data;
};
