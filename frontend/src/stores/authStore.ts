import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  role: string | null;
  setAuth: (accessToken: string, role: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  role: null,
  setAuth: (accessToken, role) => set({ accessToken, role }),
  clearAuth: () => set({ accessToken: null, role: null }),
}));