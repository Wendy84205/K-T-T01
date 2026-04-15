import api from './index';

export const getMyTasks = async () => {
  const response = await api.get('/projects/tasks/my');
  return response.data.data || [];
};

export const updateTaskStatus = async (taskId, status) => {
  const response = await api.patch(`/projects/tasks/${taskId}`, { status });
  return response.data.data;
};

export const updateTask = async (taskId, taskData) => {
  const response = await api.patch(`/projects/tasks/${taskId}`, taskData);
  return response.data.data;
};
