import api from './api';

const recipeService = {
  getRecipes: async (params = {}) => {
    const response = await api.get('/recipes', { params });
    return response.data;
  },

  getProductRecipe: async (productId) => {
    const response = await api.get(`/recipes/product/${productId}`);
    return response.data;
  },

  saveRecipe: async (recipeData) => {
    const response = await api.post('/recipes', recipeData);
    return response.data;
  },

  addRawMaterial: async (productId, rawMaterialId, notes = null) => {
    const response = await api.post('/recipes/add-material', {
      product_id: productId,
      raw_material_id: rawMaterialId,
      notes
    });
    return response.data;
  },

  updateNotes: async (recipeId, notes) => {
    const response = await api.patch(`/recipes/${recipeId}/notes`, { notes });
    return response.data;
  },

  removeRawMaterial: async (productId, rawMaterialId) => {
    const response = await api.delete(`/recipes/product/${productId}/material/${rawMaterialId}`);
    return response.data;
  },

  deleteRecipe: async (productId) => {
    const response = await api.delete(`/recipes/product/${productId}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/recipes/stats');
    return response.data;
  }
};

export default recipeService;