import { axiosInstance } from './axiosInstance';

export const profileService = {
  changePassword: async (oldPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await axiosInstance.put<{ message: string }>('/api/profile/password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  requestEmailChange: async (newEmail: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>('/api/profile/email/request-change', {
      newEmail,
    });
    return response.data;
  },
};
