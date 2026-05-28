import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';

export const useAuth = () => {
  const store = useAuthStore();

  const login = async (email, password) => {
    store.setLoading(true);
    try {
      const response = await authService.login(email, password);
      const { user, token } = response.data;
      store.setAuth(user, token);
      return user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      store.setError(msg);
      throw new Error(msg);
    } finally {
      store.setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    store.setLoading(true);
    try {
      const response = await authService.register(name, email, password, role);
      const { user, token } = response.data;
      store.setAuth(user, token);
      return user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      store.setError(msg);
      throw new Error(msg);
    } finally {
      store.setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignored for clean client logout
    } finally {
      store.clearAuth();
    }
  };

  return {
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    loading: store.loading,
    error: store.error,
    login,
    register,
    logout,
  };
};
