import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const REMEMBER_ME_KEY = 'auth-remember-me';

const dynamicStorage = {
  getItem: (name: string) => {
    return localStorage.getItem(name) ?? sessionStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
    if (rememberMe) {
      localStorage.setItem(name, value);
      sessionStorage.removeItem(name);
    } else {
      sessionStorage.setItem(name, value);
      localStorage.removeItem(name);
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  setAuth: (accessToken: string, refreshToken: string, role: string, rememberMe?: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      role: null,
      setAuth: (accessToken, refreshToken, role, rememberMe) => {
        if (rememberMe !== undefined) {
          localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));
        }
        set({ accessToken, refreshToken, role });
      },
      clearAuth: () => {
        localStorage.removeItem(REMEMBER_ME_KEY);
        set({ accessToken: null, refreshToken: null, role: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => dynamicStorage),
    }
  )
);
