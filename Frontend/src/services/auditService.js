
import api from './api';

const auditService = {
  getAuditLogs: async (params) => {
    const response = await api.get(`/audit/audit-logs`, {
      params,
    });
    return response.data;
  },

  getAuditStats: async () => {
    const response = await axios.get(`${API_URL}/audit/audit-logs/stats`,);
    return response.data;
  }
};

export default auditService;