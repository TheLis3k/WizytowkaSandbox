import { useQuery } from '@tanstack/react-query';
import { menuService } from '../services/menuService';
import type { MenuItemResponse } from '../types/menu';

export const useMenu = () => {
  return useQuery<MenuItemResponse[], Error>({
    queryKey: ['publicMenu'],
    queryFn: menuService.getPublicMenu,
  });
};