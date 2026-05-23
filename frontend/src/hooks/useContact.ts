import { useMutation } from '@tanstack/react-query';
import { contactService } from '../services/contactService';
import type { ContactMessageRequest } from '../types/contact';

export const useContact = () => {
  const submitMutation = useMutation({
    mutationFn: (data: ContactMessageRequest) => contactService.submit(data),
  });

  return {
    submit: submitMutation.mutate,
    submitAsync: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    isSuccess: submitMutation.isSuccess,
    error: submitMutation.error,
  };
};
