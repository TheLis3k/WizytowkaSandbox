import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { authService } from './authService';
import { toast } from 'sonner';
import type { AuthResponse } from '../types/auth';

// Returns true when the token has expired or will expire within 30 seconds.
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000 - 30_000;
  } catch {
    return true;
  }
}

// Singleton in-flight promise — ensures only one refresh HTTP call is made
// even when multiple interceptors or callers fire simultaneously.
let inflightRefresh: Promise<AuthResponse> | null = null;

// Call this instead of authService.refreshToken directly. It deduplicates
// concurrent refresh attempts and updates the store on success.
export async function ensureFreshToken(): Promise<string | null> {
  const { accessToken, refreshToken, setAuth, clearAuth } = useAuthStore.getState();

  if (!accessToken) return null;
  if (!isTokenExpired(accessToken)) return accessToken;
  if (!refreshToken) return null;

  if (!inflightRefresh) {
    inflightRefresh = authService
      .refreshToken(refreshToken)
      .then((res) => {
        setAuth(res.accessToken, res.refreshToken, res.role);
        return res;
      })
      .catch((err) => {
        clearAuth();
        throw err;
      })
      .finally(() => {
        inflightRefresh = null;
      });
  }

  const res = await inflightRefresh;
  return res.accessToken;
}

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

// REQUEST INTERCEPTOR — proactive pre-flight refresh before the request is sent.
// Auth endpoints are skipped to prevent infinite loops (they use the refresh
// token in the body, not the access token header).
axiosInstance.interceptors.request.use(
  async (config) => {
    if (config.url?.startsWith('/api/auth/')) {
      return config;
    }

    try {
      const token = await ensureFreshToken();
      if (token) config.headers['Authorization'] = `Bearer ${token}`;
    } catch {
      window.location.href = '/auth/login';
      return Promise.reject(new Error('Session expired'));
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR — 401 fallback (edge case: token expired between the
// pre-flight check and the server receiving the request) + error toasts.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { clearAuth } = useAuthStore.getState();
        const token = await ensureFreshToken();
        if (!token) throw new Error('No token');
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      } catch {
        useAuthStore.getState().clearAuth();
        toast.error('Sesja wygasła', { description: 'Zaloguj się ponownie, aby kontynuować.' });
        window.location.href = '/auth/login';
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 400 || error.response?.status === 422) {
      const msg = error.response?.data?.message;
      toast.error('Nieprawidłowe dane', { description: msg || 'Sprawdź poprawność wypełnionego formularza.' });
    }

    if (error.response?.status === 409) {
      const msg = error.response?.data?.message;
      toast.error('Konflikt', { description: msg || 'Operacja nie może zostać wykonana.' });
    }

    if (error.response?.status === 429) {
      const msg = error.response?.data?.message;
      toast.error('Zbyt wiele żądań', { description: msg || 'Spróbuj ponownie za chwilę.' });
    }

    if (error.response?.status >= 500) {
      toast.error('Błąd serwera', { description: 'Wystąpił problem po stronie serwera. Spróbuj ponownie później.' });
    }

    if (error.code === 'ERR_NETWORK') {
      toast.error('Błąd połączenia', { description: 'Nie można połączyć się z serwerem. Sprawdź swoje połączenie.' });
    }

    return Promise.reject(error);
  }
);
