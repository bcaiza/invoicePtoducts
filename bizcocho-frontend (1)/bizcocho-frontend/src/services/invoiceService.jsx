import api from './api'; 

const invoiceService = {
  getInvoices: async (params = {}) => {
    const { page = 1, limit = 10, status, customer_id, search } = params;
    const response = await api.get('/invoices', {
      params: { page, limit, status, customer_id, search }
    });
    return response.data;
  },

  getInvoiceById: async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (invoiceData) => {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  },

  updateInvoice: async (id, invoiceData) => {
    const response = await api.put(`/invoices/${id}`, invoiceData);
    return response.data;
  },

  deleteInvoice: async (id) => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  },

  updateInvoiceStatus: async (id, status) => {
    const response = await api.patch(`/invoices/${id}/status`, { status });
    return response.data;
  },

  getInvoicesByCustomer: async (customerId) => {
    const response = await api.get(`/invoices/customer/${customerId}`);
    return response.data;
  },

  getInvoiceStats: async () => {
    const response = await api.get('/invoices/stats');
    return response.data;
  }
};

export default invoiceService;