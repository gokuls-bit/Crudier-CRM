import api from '../config/api.config';

export const attendanceService = {
  checkIn: (data) => api.post('/attendance/checkin', data),
  checkOut: (data) => api.post('/attendance/checkout', data),
  getToday: () => api.get('/attendance/today'),
  getHistory: (params) => api.get('/attendance/history', { params }),
  getReport: (params) => api.get('/attendance/report', { params }),
};
export default attendanceService;
