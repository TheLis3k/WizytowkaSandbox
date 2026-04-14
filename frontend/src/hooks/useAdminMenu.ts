import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuService } from '../services/menuService';

export const useAdminMenu = () => {
  const queryClient = useQueryClient();

  // 1. Pobieranie dań (korzystamy z tego samego endpointu co widok publiczny)
  const menuQuery = useQuery({
    queryKey: ['adminMenu'],
    queryFn: menuService.getPublicMenu,
  });

  // 2. Mutacja do usuwania
  const deleteMutation = useMutation({
    mutationFn: menuService.deleteMenuItem,
    onSuccess: () => {
      // Automatycznie odśwież tabelę po usunięciu!
      queryClient.invalidateQueries({ queryKey: ['adminMenu'] });
      // Odśwież też publiczne menu
      queryClient.invalidateQueries({ queryKey: ['publicMenu'] }); 
    },
  });

  return {
    menuItems: menuQuery.data,
    isLoading: menuQuery.isLoading,
    isError: menuQuery.isError,
    deleteMenuItem: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};