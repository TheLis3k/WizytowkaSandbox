import { axiosInstance } from './axiosInstance';
import type { MenuItemResponse, MenuItemRequest } from '../types/menu';

export const menuService = {
  // POBIERANIE (Dostępne dla wszystkich)
  getPublicMenu: async (): Promise<MenuItemResponse[]> => {
    const response = await axiosInstance.get<MenuItemResponse[]>('/api/public/menu');
    return response.data;
  },

  // DODAWANIE (Tylko Admin)
  createMenuItem: async (data: MenuItemRequest): Promise<MenuItemResponse> => {
    const response = await axiosInstance.post<MenuItemResponse>('/api/admin/menu', data);
    return response.data;
  },

  // EDYCJA (Tylko Admin)
  updateMenuItem: async ({ id, data }: { id: number; data: MenuItemRequest }): Promise<MenuItemResponse> => {
    const response = await axiosInstance.put<MenuItemResponse>(`/api/admin/menu/${id}`, data);
    return response.data;
  },

  // USUWANIE (Tylko Admin)
  deleteMenuItem: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/admin/menu/${id}`);
  },

  // USUWANIE WIELU (Tylko Admin)
  deleteManyMenuItems: async (ids: number[]): Promise<void> => {
    await Promise.all(ids.map((id) => axiosInstance.delete(`/api/admin/menu/${id}`)));
  },
};