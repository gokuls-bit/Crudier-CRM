import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: (() => {
    try {
      return JSON.parse(localStorage.getItem('crudier_user'));
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('crudier_token') || null,
  isAuthenticated: !!localStorage.getItem('crudier_token'),
  loading: false,
  error: null,

  setAuth: (user, token) => {
    localStorage.setItem('crudier_user', JSON.stringify(user));
    localStorage.setItem('crudier_token', token);
    set({ user, token, isAuthenticated: true, error: null });
  },

  clearAuth: () => {
    localStorage.removeItem('crudier_user');
    localStorage.removeItem('crudier_token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
