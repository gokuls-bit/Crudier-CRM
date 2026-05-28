import api from '../config/api.config';

export const meetingService = {
  list: (params) => api.get('/meetings', { params }),
  get: (id) => api.get(`/meetings/${id}`),
  create: (data) => api.post('/meetings', data),
  update: (id, data) => api.patch(`/meetings/${id}`, data),
  delete: (id) => api.delete(`/meetings/${id}`),
  rsvp: (id, status) => api.post(`/meetings/${id}/rsvp`, { status }),
  getUpcoming: () => api.get('/meetings/upcoming'),
};
export default meetingService;
