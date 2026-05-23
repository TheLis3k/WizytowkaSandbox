import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';

export function useCategories() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories'] });

  const query = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  });

  const createMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: invalidate,
  });

  const renameMutation = useMutation({
    mutationFn: categoryService.renameCategory,
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: invalidate,
  });

  const reorderMutation = useMutation({
    mutationFn: categoryService.reorderCategories,
    onSuccess: invalidate,
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutate,
    rename: renameMutation.mutate,
    remove: deleteMutation.mutate,
    reorder: reorderMutation.mutate,
  };
}
