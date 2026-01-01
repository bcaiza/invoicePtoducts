import api from './api';


const rawMaterialService = {
  getRawMaterials: async (params) => {
    const response = await api.get(`/raw-materials`, );
    return response.data;
  },

  getRawMaterialById: async (id) => {
    const response = await api.get(`/raw-materials/${id}`, );
    return response.data;
  },

  createRawMaterial: async (data) => {
    const response = await api.post(`/raw-materials`, data,);
    return response.data;
  },

  updateRawMaterial: async (id, data) => {
    const response = await api.put(`/raw-materials/${id}`, data,);
    return response.data;
  },

  updateStock: async (id, data) => {
    const response = await api.patch(
      `/raw-materials/${id}/stock`,
      data,
      
    );
    return response.data;
  },

  getLowStock: async () => {
    const response = await api.get(`/raw-materials/low-stock`,);
    return response.data;
  }
};

export default rawMaterialService;