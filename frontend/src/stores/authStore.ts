import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  setAuth: (accessToken: string, refreshToken: string, role: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      role: null,
      setAuth: (accessToken, refreshToken, role) => 
        set({ accessToken, refreshToken, role }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, role: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);