
import api from './api';

const productionService = {
  getProductions: async (params) => {
    const response = await api.get(`/productions`, {
      params,
      
    });
    return response.data;
  },

  createProduction: async (data) => {
    const response = await api.post(`/productions`, data);
    return response.data;
  }
};

export default productionService;