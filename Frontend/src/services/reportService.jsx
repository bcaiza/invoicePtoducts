import api from './api';

const reportsService = {
  getSalesByPeriod: async (params = {}) => {
    const response = await api.get('/reports/sales', { params });
    return response.data;
  },

  getTopSellingProducts: async (params = {}) => {
    const response = await api.get('/reports/top-products', { params });
    return response.data;
  },

  getInvoiceDetails: async (invoiceId) => {
    const response = await api.get(`/reports/invoice/${invoiceId}`);
    return response.data;
  },

  getSalesByCustomer: async (params = {}) => {
    const response = await api.get('/reports/customers', { params });
    return response.data;
  },

  getDailySalesSummary: async (params = {}) => {
    const response = await api.get('/reports/daily', { params });
    return response.data;
  },

  getSalesByPaymentMethod: async (params = {}) => {
    const response = await api.get('/reports/payment-methods', { params });
    return response.data;
  },

  getProductInventoryReport: async (params = {}) => {
    const response = await api.get('/reports/inventory', { params });
    return response.data;
  },

  getInvoiceProductsDetail: async (params = {}) => {
    const response = await api.get('/reports/invoice-products', { params });
    return response.data;
  }
};

export default reportsService;