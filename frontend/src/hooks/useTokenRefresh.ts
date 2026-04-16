import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';

function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function useTokenRefresh() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    if (!accessToken || !refreshToken) return;

    const expiresAt = getTokenExpiry(accessToken);
    if (!expiresAt) return;

    const msUntilRefresh = expiresAt - Date.now() - 60_000; // refresh 60s before expiry

    if (msUntilRefresh <= 0) {
      // Already expired or expiring imminently — refresh now
      authService.refreshToken(refreshToken)
        .then((res) => setAuth(res.accessToken, res.refreshToken, res.role))
        .catch(() => {
          clearAuth();
          window.location.href = '/auth/login';
        });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await authService.refreshToken(refreshToken);
        setAuth(res.accessToken, res.refreshToken, res.role);
      } catch {
        clearAuth();
        window.location.href = '/auth/login';
      }
    }, msUntilRefresh);

    return () => clearTimeout(timer);
  }, [accessToken]); // re-schedules every time a new access token is stored
}
