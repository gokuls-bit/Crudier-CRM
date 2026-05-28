import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';

export const useAuth = () => {
  const store = useAuthStore();

  const login = async (email, password) => {
    store.setLoading(true);
    try {
      const response = await authService.login(email, password);
      const resData = response.data;
      // Support both structured { success, message, data } and raw responses
      const payload = resData?.data !== undefined ? resData.data : resData;
      
      if (payload && payload.mfaRequired) {
        return { mfaRequired: true, tempToken: payload.tempToken };
      }

      const user = payload?.user;
      const token = payload?.accessToken || payload?.token;
      
      if (user && token) {
        store.setAuth(user, token);
      }
      return user || payload;
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
      const resData = response.data;
      const payload = resData?.data !== undefined ? resData.data : resData;
      
      const user = payload?.user || payload;
      const token = payload?.accessToken || payload?.token;
      
      if (user && token) {
        store.setAuth(user, token);
      }
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
