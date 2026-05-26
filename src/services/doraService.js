import api from './api';

const doraService = {
  saveDora: async (doraData) => {
    const response = await api.post('/api/dora', doraData);
    return response.data;
  },
  getAllDora: async () => {
    const response = await api.get('/api/dora');
    return response.data;
  },
  getDoraSummary: async () => {
    const response = await api.get('/api/dora/summary');
    return response.data;
  },
};

export default doraService;