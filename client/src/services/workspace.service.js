import api from '../config/api.config';

export const workspaceService = {
  list: () => api.get('/workspaces'),
  get: (id) => api.get(`/workspaces/${id}`),
  create: (data) => api.post('/workspaces', data),
  update: (id, data) => api.patch(`/workspaces/${id}`, data),
  delete: (id) => api.delete(`/workspaces/${id}`),
  
  // Workspace Members
  getMembers: (id) => api.get(`/workspaces/${id}/members`),
  invite: (id, email, role) => api.post(`/workspaces/${id}/invite`, { email, role }),
  updateMemberRole: (id, userId, role) => api.patch(`/workspaces/${id}/members/${userId}/role`, { role }),
  removeMember: (id, userId) => api.delete(`/workspaces/${id}/members/${userId}`),
};
export default workspaceService;
