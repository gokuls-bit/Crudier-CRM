import api from '../config/api.config';

export const salesService = {
  // Leads
  listLeads: (params) => api.get('/sales/leads', { params }),
  getLead: (id) => api.get(`/sales/leads/${id}`),
  createLead: (data) => api.post('/sales/leads', data),
  updateLead: (id, data) => api.patch(`/sales/leads/${id}`, data),
  deleteLead: (id) => api.delete(`/sales/leads/${id}`),

  // Pipeline
  getPipeline: () => api.get('/sales/pipeline'),
  updatePipelineStage: (id, stage) => api.patch(`/sales/leads/${id}/stage`, { stage }),

  // Analytics
  getAnalytics: (params) => api.get('/sales/analytics', { params }),
};
export default salesService;
