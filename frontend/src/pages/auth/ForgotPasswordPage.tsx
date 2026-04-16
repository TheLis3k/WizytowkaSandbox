import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const forgotSchema = z.object({
  email: z.string().email('Nieprawidłowy adres e-mail'),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ForgotFormValues>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (data: ForgotFormValues) => {
    try {
      await authService.forgotPassword(data.email);
      toast.success('E-mail wysłany', {
        description: 'Sprawdź skrzynkę pocztową i kliknij link resetujący hasło.',
      });
    } catch {
      // Backend returns success even for unknown emails for security reasons,
      // so any error here is a real server issue
      toast.error('Błąd serwera', { description: 'Spróbuj ponownie później.' });
    }
  };

  if (isSubmitSuccessful) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Jeśli podany adres e-mail istnieje w systemie, wysłaliśmy na niego link do resetowania hasła.
        </p>
        <Link to="/auth/login" className="text-sm text-primary hover:underline block">
          Wróć do logowania
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-1 mb-6">
        <h3 className="text-lg font-semibold">Resetowanie hasła</h3>
        <p className="text-sm text-muted-foreground">
          Podaj swój adres e-mail, a wyślemy Ci link do zresetowania hasła.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@example.com"
          {...register('email')}
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
        {isSubmitting ? 'Wysyłanie...' : 'Wyślij link resetujący'}
      </Button>

      <Link
        to="/auth/login"
        className="text-sm text-muted-foreground hover:text-foreground block text-center"
      >
        Wróć do logowania
      </Link>
    </form>
  );
}
