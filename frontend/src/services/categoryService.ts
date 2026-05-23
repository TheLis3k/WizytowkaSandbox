import { axiosInstance } from './axiosInstance';
import type { CategoryResponse } from '../types/menu';

export const categoryService = {
  getCategories: async (): Promise<CategoryResponse[]> => {
    const response = await axiosInstance.get<CategoryResponse[]>('/api/public/categories');
    return response.data;
  },

  createCategory: async (name: string): Promise<CategoryResponse> => {
    const response = await axiosInstance.post<CategoryResponse>('/api/admin/categories', { name });
    return response.data;
  },

  renameCategory: async ({ id, name }: { id: number; name: string }): Promise<CategoryResponse> => {
    const response = await axiosInstance.put<CategoryResponse>(`/api/admin/categories/${id}`, { name });
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/admin/categories/${id}`);
  },

  reorderCategories: async (ids: number[]): Promise<void> => {
    await axiosInstance.put('/api/admin/categories/reorder', { ids });
  },
};
