import { axiosInstance } from './axiosInstance';
import type { TableResponse, TableRequest } from '../types/table';

export const tableService = {
  getActiveTables: async (): Promise<TableResponse[]> => {
    const response = await axiosInstance.get<TableResponse[]>('/api/public/tables');
    return response.data;
  },

  getAllTables: async (): Promise<TableResponse[]> => {
    const response = await axiosInstance.get<TableResponse[]>('/api/admin/tables');
    return response.data;
  },

  createTable: async (data: TableRequest): Promise<TableResponse> => {
    const response = await axiosInstance.post<TableResponse>('/api/admin/tables', data);
    return response.data;
  },

  updateTable: async ({ id, data }: { id: number; data: TableRequest }): Promise<TableResponse> => {
    const response = await axiosInstance.put<TableResponse>(`/api/admin/tables/${id}`, data);
    return response.data;
  },

  deactivateTable: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/admin/tables/${id}`);
  },
};
