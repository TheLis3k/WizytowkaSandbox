import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { profileService } from '../../services/profileService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Wpisz aktualne hasło'),
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

const emailSchema = z.object({
  newEmail: z.string().email('Nieprawidłowy adres e-mail'),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;
type EmailFormValues = z.infer<typeof emailSchema>;

export default function AdminAccountPage() {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    reset: resetEmail,
    formState: { errors: emailErrors, isSubmitting: isEmailSubmitting },
  } = useForm<EmailFormValues>({ resolver: zodResolver(emailSchema) });

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      await profileService.changePassword(data.oldPassword, data.newPassword);
      toast.success('Hasło zmienione', {
        description: 'Twoje hasło zostało zmienione. Zaloguj się ponownie.',
      });
      resetPassword();
      clearAuth();
      window.location.href = '/auth/login';
    } catch {
      toast.error('Błąd', { description: 'Nie udało się zmienić hasła. Sprawdź aktualne hasło.' });
    }
  };

  const onEmailSubmit = async (data: EmailFormValues) => {
    try {
      await profileService.requestEmailChange(data.newEmail);
      toast.success('E-mail weryfikacyjny wysłany', {
        description: `Sprawdź skrzynkę ${data.newEmail}, aby potwierdzić zmianę adresu.`,
      });
      resetEmail();
    } catch {
      toast.error('Błąd', { description: 'Nie udało się zainicjować zmiany adresu e-mail.' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Ustawienia konta</h2>

      <Card>
        <CardHeader>
          <CardTitle>Zmień hasło</CardTitle>
          <CardDescription>
            Po zmianie hasła zostaniesz automatycznie wylogowany ze wszystkich urządzeń.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4 max-w-sm">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Aktualne hasło</Label>
              <Input
                id="oldPassword"
                type="password"
                {...registerPassword('oldPassword')}
                className={passwordErrors.oldPassword ? 'border-destructive' : ''}
              />
              {passwordErrors.oldPassword && (
                <p className="text-xs text-destructive">{passwordErrors.oldPassword.message}</p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nowe hasło</Label>
              <Input
                id="newPassword"
                type="password"
                {...registerPassword('newPassword')}
                className={passwordErrors.newPassword ? 'border-destructive' : ''}
              />
              {passwordErrors.newPassword && (
                <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...registerPassword('confirmPassword')}
                className={passwordErrors.confirmPassword ? 'border-destructive' : ''}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isPasswordSubmitting}>
              {isPasswordSubmitting ? 'Zapisywanie...' : 'Zmień hasło'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zmień adres e-mail</CardTitle>
          <CardDescription>
            Na nowy adres zostanie wysłana wiadomość weryfikacyjna. Zmiana wejdzie w życie po kliknięciu linku w e-mailu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-4 max-w-sm">
            <div className="space-y-2">
              <Label htmlFor="newEmail">Nowy adres e-mail</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="nowy@example.com"
                {...registerEmail('newEmail')}
                className={emailErrors.newEmail ? 'border-destructive' : ''}
              />
              {emailErrors.newEmail && (
                <p className="text-xs text-destructive">{emailErrors.newEmail.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isEmailSubmitting}>
              {isEmailSubmitting ? 'Wysyłanie...' : 'Wyślij link weryfikacyjny'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
