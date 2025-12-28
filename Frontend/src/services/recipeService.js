import api from './api';


const recipeService = {
  getProductRecipe: async (productId) => {
    const response = await api.get(`/recipes/product/${productId}`);
    return response.data;
  },

  saveRecipe: async (data) => {
    const response = await api.post(`/recipes`, data);
    return response.data;
  },

  deleteIngredient: async (id) => {
    const response = await api.delete(`/recipes/${id}`);
    return response.data;
  }
};

export default recipeService;