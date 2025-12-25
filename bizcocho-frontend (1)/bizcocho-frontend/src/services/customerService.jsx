import api from './api';

const customerService = {
  getCustomers: async (params = {}) => {
    const { page = 1, limit = 10, active, search, identification_type } = params;    
    const queryParams = { page, limit };
    if (active && active !== '') queryParams.active = active;
    if (search && search !== '') queryParams.search = search;
    if (identification_type && identification_type !== '') queryParams.identification_type = identification_type;
    
    const response = await api.get('/customers', { params: queryParams });
    return response.data;
  },

  getCustomerById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  getCustomerByIdentification: async (identification) => {
    const response = await api.get(`/customers/identification/${identification}`);
    return response.data;
  },

  createCustomer: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },

  updateCustomer: async (id, customerData) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },

  deleteCustomer: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  getFinalConsumer: async () => {
    const response = await api.get('/customers/final-consumer');
    return response.data;
  },

  toggleCustomerStatus: async (id) => {
    const response = await api.patch(`/customers/${id}/toggle-status`);
    return response.data;
  },

  getCustomerStats: async () => {
    const response = await api.get('/customers/stats');
    return response.data;
  }
};

export default customerService;