import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '../services/contactService';
import type { ContactMessageStatus } from '../types/contact';
import type { AdminReplyRequest } from '../types/contact';

export const useAdminContact = (page: number, size: number = 20, statusFilter?: ContactMessageStatus) => {
  const queryClient = useQueryClient();

  const messagesQuery = useQuery({
    queryKey: ['adminContact', page, size, statusFilter],
    queryFn: () => contactService.getAll(page, size, statusFilter),
  });

  const unreadCountQuery = useQuery({
    queryKey: ['adminContactUnread'],
    queryFn: contactService.countUnread,
    refetchInterval: 60_000,
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminReplyRequest }) =>
      contactService.reply({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminContact'] });
      queryClient.invalidateQueries({ queryKey: ['adminContactUnread'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: contactService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminContact'] });
      queryClient.invalidateQueries({ queryKey: ['adminContactUnread'] });
    },
  });

  return {
    data: messagesQuery.data,
    isLoading: messagesQuery.isLoading,
    isError: messagesQuery.isError,
    unreadCount: unreadCountQuery.data ?? 0,
    reply: replyMutation.mutate,
    isReplying: replyMutation.isPending,
    deleteMessage: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
