import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Hasło musi mieć min. 8 znaków')
      .regex(/\d/, 'Hasło musi zawierać cyfrę')
      .regex(/[a-z]/, 'Hasło musi zawierać małą literę')
      .regex(/[A-Z]/, 'Hasło musi zawierać wielką literę')
      .regex(/[^a-zA-Z0-9]/, 'Hasło musi zawierać znak specjalny'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Hasła nie są identyczne',
    path: ['confirmPassword'],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.error('Nieprawidłowy link resetujący');
      navigate('/auth/login');
    }
  }, [token, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({ resolver: zodResolver(resetSchema) });

  const onSubmit = async (data: ResetFormValues) => {
    if (!token) return;
    try {
      await authService.resetPassword(token, data.newPassword);
      toast.success('Hasło zostało zmienione', {
        description: 'Możesz się teraz zalogować nowym hasłem.',
      });
      navigate('/auth/login');
    } catch {
      toast.error('Błąd resetowania hasła', {
        description: 'Link resetujący jest nieprawidłowy lub wygasł.',
      });
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-1 mb-6">
        <h3 className="text-lg font-semibold">Nowe hasło</h3>
        <p className="text-sm text-muted-foreground">Ustaw nowe hasło do swojego konta.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Nowe hasło</Label>
        <Input
          id="newPassword"
          type="password"
          {...register('newPassword')}
          className={errors.newPassword ? 'border-destructive' : ''}
        />
        {errors.newPassword && (
          <p className="text-xs text-destructive">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          className={errors.confirmPassword ? 'border-destructive' : ''}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
        {isSubmitting ? 'Zapisywanie...' : 'Ustaw nowe hasło'}
      </Button>
    </form>
  );
}
