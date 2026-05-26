import api from './api';

const taskService = {

  // Get all task types for the dropdown
  getTaskTypes: async () => {
    const response = await api.get('/api/tasks/types');
    return response.data;
  },

  // Submit a new task
  submitTask: async (taskData) => {
    const response = await api.post('/api/tasks', taskData);
    return response.data;
  },

  // Get all tasks
  getAllTasks: async () => {
    const response = await api.get('/api/tasks');
    return response.data;
  },

  // Get current user's tasks
  getMyTasks: async () => {
    const response = await api.get('/api/tasks/my');
    return response.data;
  },

  // Delete a task (admin only)
  deleteTask: async (taskId) => {
    const response = await api.delete(`/api/tasks/${taskId}`);
    return response.data;
  },
};

export default taskService;