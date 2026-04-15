import api from './index';

export const getNotifications = async (page = 1, limit = 20) => {
  const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
  return response.data.data || { data: [], total: 0, unreadCount: 0 };
};

export const markNotificationAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

export const getUnreadCount = async () => {
  try {
    const response = await api.get('/notifications?page=1&limit=1');
    return response.data.data?.unreadCount || 0;
  } catch {
    return 0;
  }
};
