import api from './index';

// ── Projects ──────────────────────────────────────────────────
export const getProjects = async () => {
  const response = await api.get('/projects');
  return response.data.data || [];
};

export const getProject = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data.data;
};

export const createProject = async (data) => {
  const response = await api.post('/projects', data);
  return response.data.data;
};

export const deleteProject = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data.data;
};

// ── Tasks ─────────────────────────────────────────────────────
export const getProjectTasks = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/tasks`);
  return response.data.data || [];
};

export const createTask = async (projectId, taskData) => {
  const response = await api.post(`/projects/${projectId}/tasks`, taskData);
  return response.data.data;
};

export const updateTask = async (taskId, taskData) => {
  const response = await api.patch(`/projects/tasks/${taskId}`, taskData);
  return response.data.data;
};

export const deleteTask = async (taskId) => {
  const response = await api.delete(`/projects/tasks/${taskId}`);
  return response.data.data;
};

// ── Team (reuse chat/users) ───────────────────────────────────
export const getTeamMembers = async () => {
  const response = await api.get('/chat/users');
  return response.data.data || [];
};
