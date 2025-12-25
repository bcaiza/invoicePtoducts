import api from './api';

const productService = {
  getProducts: async (params = {}) => {
    const { page = 1, limit = 10, search } = params;
    const response = await api.get('/products', {
      params: { page, limit, search }
    });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  toggleProductStatus: async (id) => {
    const response = await api.patch(`/products/${id}/toggle-status`);
    return response.data;
  },

  updateStock: async (id, quantity, operation) => {
    const response = await api.patch(`/products/${id}/stock`, {
      quantity,
      operation 
    });
    return response.data;
  },

  getLowStockProducts: async (threshold = 10) => {
    const response = await api.get('/products/low-stock', {
      params: { threshold }
    });
    return response.data;
  },

  getProductStats: async () => {
    const response = await api.get('/products/stats');
    return response.data;
  },

  bulkUpdateStock: async (updates) => {
    const response = await api.post('/products/bulk-stock', { updates });
    return response.data;
  }
};

export default productService;
