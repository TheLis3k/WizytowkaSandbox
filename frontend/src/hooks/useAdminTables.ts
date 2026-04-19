import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tableService } from '../services/tableService';

export const useAdminTables = () => {
  const queryClient = useQueryClient();

  const tablesQuery = useQuery({
    queryKey: ['adminTables'],
    queryFn: tableService.getAllTables,
  });

  const createMutation = useMutation({
    mutationFn: tableService.createTable,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminTables'] }),
  });

  const updateMutation = useMutation({
    mutationFn: tableService.updateTable,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminTables'] }),
  });

  const deactivateMutation = useMutation({
    mutationFn: tableService.deactivateTable,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminTables'] }),
  });

  return {
    tables: tablesQuery.data ?? [],
    isLoading: tablesQuery.isLoading,
    isError: tablesQuery.isError,
    createTable: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateTable: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deactivateTable: deactivateMutation.mutate,
    isDeactivating: deactivateMutation.isPending,
  };
};
