import { axiosInstance } from './axiosInstance';
import type { UserResponse } from '../types/user';

export const userService = {
  getUsers: async (page = 0, size = 50): Promise<UserResponse[]> => {
    const response = await axiosInstance.get<UserResponse[]>('/api/admin/users', {
      params: { page, size },
    });
    return response.data;
  },

  inviteUser: async (email: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>('/api/admin/users/invite', { email });
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/admin/users/${id}`);
  },
};
