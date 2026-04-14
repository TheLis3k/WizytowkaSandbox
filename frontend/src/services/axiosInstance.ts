import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { authService } from './authService';
import { toast } from 'sonner';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { refreshToken, setAuth, clearAuth } = useAuthStore.getState();

      if (refreshToken) {
        try {
          const response = await authService.refreshToken(refreshToken);
          
          setAuth(response.accessToken, response.refreshToken, response.role);

          originalRequest.headers['Authorization'] = `Bearer ${response.accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          clearAuth();
          toast.error("Sesja wygasła", {
            description: "Zaloguj się ponownie, aby kontynuować."
          });
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        }
      } else {
        clearAuth();
      }
    }

    if (error.response?.status >= 500) {
      toast.error("Błąd serwera", {
        description: "Wystąpił problem po stronie serwera. Spróbuj ponownie później."
      });
    }

    if (error.code === 'ERR_NETWORK') {
      toast.error("Błąd połączenia", {
        description: "Nie można połączyć się z serwerem. Sprawdź swoje połączenie."
      });
    }

    return Promise.reject(error);
  }
);