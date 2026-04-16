import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '../../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckboxInput } from '@/components/ui/checkbox';
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy adres e-mail'),
  password: z.string().min(6, 'Hasło musi mieć min. 6 znaków'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [rememberMe, setRememberMe] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const remembered = localStorage.getItem('auth-remember-me') === 'true';
    if (remembered && accessToken) {
      navigate('/admin/menu', { replace: true });
    }
  }, [accessToken, navigate]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

	const onSubmit = async (data: LoginFormValues) => {
		try {
			const response = await authService.login(data.email, data.password);
			setAuth(response.accessToken, response.refreshToken, response.role, rememberMe);
			toast.success("Zalogowano pomyślnie!");
			navigate('/admin/menu');
		} catch (error) {
			toast.error("Błąd logowania", {
				description: "Nieprawidłowy e-mail lub hasło. Spróbuj ponownie."
			});
		}
	};

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder="admin@example.com"
          {...register('email')}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Hasło</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          className={errors.password ? "border-destructive" : ""}
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <CheckboxInput
          id="rememberMe"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked === true)}
        />
        <Label htmlFor="rememberMe" className="font-normal cursor-pointer">
          Zapamiętaj mnie
        </Label>
      </div>

      <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
        {isSubmitting ? "Autoryzacja..." : "Zaloguj się"}
      </Button>

      <Link
        to="/auth/forgot-password"
        className="text-sm text-muted-foreground hover:text-foreground block text-center"
      >
        Nie pamiętasz hasła?
      </Link>
    </form>
  );
}
