import { axiosInstance } from './axiosInstance';
import type {
  ReservationResponse,
  ReservationRequest,
  AdminReservationUpdateRequest,
  TimeSlotAvailability,
  PagedResponse,
} from '../types/reservation';

export const reservationService = {
  getAvailability: async (date: string, partySize: number): Promise<TimeSlotAvailability[]> => {
    const response = await axiosInstance.get<TimeSlotAvailability[]>('/api/public/reservations/availability', {
      params: { date, partySize },
    });
    return response.data;
  },

  createReservation: async (data: ReservationRequest): Promise<ReservationResponse> => {
    const response = await axiosInstance.post<ReservationResponse>('/api/public/reservations', data);
    return response.data;
  },

  confirmReservation: async (token: string): Promise<void> => {
    await axiosInstance.post('/api/public/reservations/confirm', null, { params: { token } });
  },

  cancelReservation: async (token: string): Promise<void> => {
    await axiosInstance.post('/api/public/reservations/cancel', null, { params: { token } });
  },

  getAllReservations: async (page: number, size: number): Promise<PagedResponse<ReservationResponse>> => {
    const response = await axiosInstance.get<PagedResponse<ReservationResponse>>('/api/admin/reservations', {
      params: { page, size, sort: 'startTime,desc' },
    });
    return response.data;
  },

  updateReservation: async ({ id, data }: { id: number; data: AdminReservationUpdateRequest }): Promise<ReservationResponse> => {
    const response = await axiosInstance.patch<ReservationResponse>(`/api/admin/reservations/${id}`, data);
    return response.data;
  },

  deleteReservation: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/admin/reservations/${id}`);
  },
};
