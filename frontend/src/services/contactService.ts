import { axiosInstance } from './axiosInstance';
import type {
  ContactMessageRequest,
  ContactMessageResponse,
  AdminReplyRequest,
  PagedContactResponse,
  ContactMessageStatus,
} from '../types/contact';

export const contactService = {
  submit: async (data: ContactMessageRequest): Promise<void> => {
    await axiosInstance.post('/api/public/contact', data);
  },

  verify: async (token: string): Promise<void> => {
    await axiosInstance.post('/api/public/contact/verify', null, { params: { token } });
  },

  getAll: async (
    page: number,
    size: number,
    status?: ContactMessageStatus
  ): Promise<PagedContactResponse> => {
    const response = await axiosInstance.get<PagedContactResponse>('/api/admin/contact', {
      params: { page, size, sort: 'createdAt,desc', ...(status ? { status } : {}) },
    });
    return response.data;
  },

  getById: async (id: number): Promise<ContactMessageResponse> => {
    const response = await axiosInstance.get<ContactMessageResponse>(`/api/admin/contact/${id}`);
    return response.data;
  },

  reply: async ({ id, data }: { id: number; data: AdminReplyRequest }): Promise<ContactMessageResponse> => {
    const response = await axiosInstance.post<ContactMessageResponse>(`/api/admin/contact/${id}/reply`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/admin/contact/${id}`);
  },

  countUnread: async (): Promise<number> => {
    const response = await axiosInstance.get<number>('/api/admin/contact/unread-count');
    return response.data;
  },
};
