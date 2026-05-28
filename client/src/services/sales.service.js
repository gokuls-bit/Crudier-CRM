import api from '../config/api.config';

export const salesService = {
  // Leads
  listLeads: (params) => api.get('/sales/leads', { params }),
  getLead: (id) => api.get(`/sales/leads/${id}`),
  createLead: (data) => api.post('/sales/leads', data),
  updateLead: (id, data) => api.patch(`/sales/leads/${id}`, data),
  deleteLead: (id) => api.delete(`/sales/leads/${id}`),

  // Pipeline & Analytics
  getPipeline: () => api.get('/sales/pipeline'),
  updatePipelineStage: (id, stage) => api.patch(`/sales/leads/${id}/stage`, { stage }),
  getAnalytics: (params) => api.get('/sales/analytics', { params }),
  getFollowUps: () => api.get('/sales/follow-ups'),

  // Accounts
  listAccounts: (params) => api.get('/sales/accounts', { params }),
  getAccount: (id) => api.get(`/sales/accounts/${id}`),
  createAccount: (data) => api.post('/sales/accounts', data),
  updateAccount: (id, data) => api.patch(`/sales/accounts/${id}`, data),
  deleteAccount: (id) => api.delete(`/sales/accounts/${id}`),

  // Contacts
  listContacts: (params) => api.get('/sales/contacts', { params }),
  getContact: (id) => api.get(`/sales/contacts/${id}`),
  createContact: (data) => api.post('/sales/contacts', data),
  updateContact: (id, data) => api.patch(`/sales/contacts/${id}`, data),
  deleteContact: (id) => api.delete(`/sales/contacts/${id}`),
  mergeContacts: (data) => api.post('/sales/contacts/merge', data),
  convertLead: (leadId) => api.post(`/sales/leads/${leadId}/convert`),

  // Opportunities
  listOpportunities: (params) => api.get('/sales/opportunities', { params }),
  getOpportunity: (id) => api.get(`/sales/opportunities/${id}`),
  createOpportunity: (data) => api.post('/sales/opportunities', data),
  updateOpportunity: (id, data) => api.patch(`/sales/opportunities/${id}`, data),
  deleteOpportunity: (id) => api.delete(`/sales/opportunities/${id}`),
  addOpportunityProduct: (id, data) => api.post(`/sales/opportunities/${id}/products`, data),
  removeOpportunityProduct: (oppId, lineItemId) => api.delete(`/sales/opportunities/${oppId}/products/${lineItemId}`),
  getOpportunityQuote: (id) => api.get(`/sales/opportunities/${id}/quote`),

  // Forecasting & Quotas
  getForecasts: (params) => api.get('/sales/forecasts', { params }),
  getRepForecast: (params) => api.get('/sales/forecasts/rep', { params }),
  updateQuota: (data) => api.post('/sales/quotas', data),

  // Cases
  listCases: (params) => api.get('/sales/cases', { params }),
  getCase: (id) => api.get(`/sales/cases/${id}`),
  createCase: (data) => api.post('/sales/cases', data),
  updateCase: (id, data) => api.patch(`/sales/cases/${id}`, data),
  deleteCase: (id) => api.delete(`/sales/cases/${id}`),
  mergeCases: (data) => api.post('/sales/cases/merge', data),
  simulateEmailToCaseWebhook: (data) => api.post('/sales/cases/webhook', data),

  // Products & Price Books
  listProducts: (params) => api.get('/sales/products', { params }),
  createProduct: (data) => api.post('/sales/products', data),
  listPriceBooks: (params) => api.get('/sales/pricebooks', { params }),
  createPriceBook: (data) => api.post('/sales/pricebooks', data),

  // Territories
  listTerritories: (params) => api.get('/sales/territories', { params }),
  saveTerritoryRules: (data) => api.post('/sales/territories', data),

  // Emails
  sendEmails: (data) => api.post('/sales/emails/send', data),
  listEmailTemplates: (params) => api.get('/sales/emails/templates', { params }),
  createEmailTemplate: (data) => api.post('/sales/emails/templates', data),
};
export default salesService;
