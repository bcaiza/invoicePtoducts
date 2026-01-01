import api from './api';

const productionService = {
  getProductions: async (params = {}) => {
    const response = await api.get('/productions', { params });
    return response.data;
  },

  getProductionById: async (productionId) => {
    const response = await api.get(`/productions/${productionId}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/productions/stats');
    return response.data;
  },

  createProduction: async (data) => {
    const response = await api.post('/productions', data);
    return response.data;
  },

  completeProduction: async (productionId, data) => {
    const response = await api.post(`/productions/${productionId}/complete`, data);
    return response.data;
  },

  updateProduction: async (productionId, data) => {
    const response = await api.patch(`/productions/${productionId}`, data);
    return response.data;
  },

  cancelProduction: async (productionId) => {
    const response = await api.patch(`/productions/${productionId}/cancel`);
    return response.data;
  },

  deleteProduction: async (productionId) => {
    const response = await api.delete(`/productions/${productionId}`);
    return response.data;
  }
};

export default productionService;