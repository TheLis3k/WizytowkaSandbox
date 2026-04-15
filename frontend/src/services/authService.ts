import { axiosInstance } from './axiosInstance';
import type { AuthResponse } from '../types/auth';

function extractRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const authority: string = payload.authorities?.[0] ?? '';
    return authority.replace(/^ROLE_/, '') || null;
  } catch {
    return null;
  }
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });
    return { ...response.data, role: extractRoleFromToken(response.data.accessToken) ?? '' };
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/api/auth/refresh', {
      refreshToken,
    });
    return { ...response.data, role: extractRoleFromToken(response.data.accessToken) ?? '' };
  },

  logout: async (refreshToken: string): Promise<void> => {
    await axiosInstance.post('/api/auth/logout', { refreshToken });
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>('/api/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>('/api/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },

  onboarding: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>('/api/auth/onboarding', {
      token,
      password,
    });
    return response.data;
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>('/api/auth/onboarding/verify-email', { token });
    return response.data;
  },
};