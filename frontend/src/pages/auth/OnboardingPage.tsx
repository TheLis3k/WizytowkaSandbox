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

const onboardingSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Hasło musi mieć min. 8 znaków')
      .regex(/\d/, 'Hasło musi zawierać cyfrę')
      .regex(/[a-z]/, 'Hasło musi zawierać małą literę')
      .regex(/[A-Z]/, 'Hasło musi zawierać wielką literę')
      .regex(/[^a-zA-Z0-9]/, 'Hasło musi zawierać znak specjalny'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła nie są identyczne',
    path: ['confirmPassword'],
  });

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.error('Nieprawidłowy link aktywacyjny');
      navigate('/auth/login');
    }
  }, [token, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormValues>({ resolver: zodResolver(onboardingSchema) });

  const onSubmit = async (data: OnboardingFormValues) => {
    if (!token) return;
    try {
      await authService.onboarding(token, data.password);
      toast.success('Konto aktywowane!', {
        description: 'Możesz się teraz zalogować.',
      });
      navigate('/auth/login');
    } catch {
      toast.error('Błąd aktywacji', {
        description: 'Link aktywacyjny jest nieprawidłowy lub wygasł.',
      });
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-1 mb-6">
        <h3 className="text-lg font-semibold">Aktywacja konta</h3>
        <p className="text-sm text-muted-foreground">Ustaw hasło, aby dokończyć rejestrację.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Hasło</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          className={errors.password ? 'border-destructive' : ''}
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
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
        {isSubmitting ? 'Aktywacja...' : 'Aktywuj konto'}
      </Button>
    </form>
  );
}
