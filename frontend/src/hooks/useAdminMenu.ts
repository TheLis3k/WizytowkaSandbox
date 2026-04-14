import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuService } from '../services/menuService';

export const useAdminMenu = () => {
  const queryClient = useQueryClient();

  // 1. Pobieranie dań (korzystamy z tego samego endpointu co widok publiczny)
  const menuQuery = useQuery({
    queryKey: ['adminMenu'],
    queryFn: menuService.getPublicMenu,
  });

  // 2. Mutacja do dodawania
  const createMutation = useMutation({
    mutationFn: menuService.createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMenu'] });
      queryClient.invalidateQueries({ queryKey: ['publicMenu'] });
    },
  });

  // 3. Mutacja do edycji
  const updateMutation = useMutation({
    mutationFn: menuService.updateMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMenu'] });
      queryClient.invalidateQueries({ queryKey: ['publicMenu'] });
    },
  });

  // 4. Mutacja do usuwania
  const deleteMutation = useMutation({
    mutationFn: menuService.deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMenu'] });
      queryClient.invalidateQueries({ queryKey: ['publicMenu'] });
    },
  });

  // 5. Mutacja do usuwania wielu
  const deleteManyMutation = useMutation({
    mutationFn: menuService.deleteManyMenuItems,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMenu'] });
      queryClient.invalidateQueries({ queryKey: ['publicMenu'] });
    },
  });

  return {
    menuItems: menuQuery.data,
    isLoading: menuQuery.isLoading,
    isError: menuQuery.isError,
    createMenuItem: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateMenuItem: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteMenuItem: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    deleteManyMenuItems: deleteManyMutation.mutate,
    isDeletingMany: deleteManyMutation.isPending,
  };
};