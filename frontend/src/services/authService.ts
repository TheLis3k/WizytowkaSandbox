import { axiosInstance } from './axiosInstance';
import type { AuthResponse } from '../types/auth';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },
};