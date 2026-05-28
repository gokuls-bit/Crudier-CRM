import api from '../config/api.config';

export const teamService = {
  list: () => api.get('/team'),
  getProfile: (userId) => api.get(`/team/${userId}`),
  updateProfile: (userId, data) => api.patch(`/team/${userId}`, data),
  updateAvatar: (userId, formData) => api.post(`/team/${userId}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateRole: (userId, role) => api.patch(`/team/${userId}/role`, { role }),
  updateDepartment: (userId, department) => api.patch(`/team/${userId}/department`, { department }),
  deactivate: (userId) => api.patch(`/team/${userId}/deactivate`),
};
export default teamService;
