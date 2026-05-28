import api from '../config/api.config';

export const taskService = {
  list: (params) => api.get('/tasks', { params }),
  get: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  
  // Status and reviews
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  submitReview: (id, comments) => api.post(`/tasks/${id}/submit`, { comments }),
  approve: (id, feedback) => api.post(`/tasks/${id}/approve`, { feedback }),
  reject: (id, feedback) => api.post(`/tasks/${id}/reject`, { feedback }),

  // Comments
  addComment: (taskId, commentText) => api.post(`/tasks/${taskId}/comments`, { text: commentText }),
  deleteComment: (taskId, commentId) => api.delete(`/tasks/${taskId}/comments/${commentId}`),
};
export default taskService;
