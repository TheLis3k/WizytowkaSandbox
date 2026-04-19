import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationService } from '../services/reservationService';

export const useAdminReservations = (page: number, size: number = 20) => {
  const queryClient = useQueryClient();

  const reservationsQuery = useQuery({
    queryKey: ['adminReservations', page, size],
    queryFn: () => reservationService.getAllReservations(page, size),
  });

  const updateMutation = useMutation({
    mutationFn: reservationService.updateReservation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminReservations'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: reservationService.deleteReservation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminReservations'] }),
  });

  return {
    data: reservationsQuery.data,
    isLoading: reservationsQuery.isLoading,
    isError: reservationsQuery.isError,
    updateReservation: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteReservation: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
