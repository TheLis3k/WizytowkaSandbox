import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    authService
      .verifyEmail(token)
      .then(() => {
        setStatus('success');
        toast.success('Adres e-mail zweryfikowany pomyślnie!');
        setTimeout(() => navigate('/auth/login'), 2000);
      })
      .catch(() => {
        setStatus('error');
      });
  }, [token, navigate]);

  return (
    <div className="space-y-4 text-center">
      {status === 'loading' && (
        <p className="text-sm text-muted-foreground">Weryfikowanie adresu e-mail...</p>
      )}
      {status === 'success' && (
        <>
          <p className="text-sm text-emerald-600 font-medium">Adres e-mail został zweryfikowany!</p>
          <p className="text-sm text-muted-foreground">Przekierowanie do logowania...</p>
        </>
      )}
      {status === 'error' && (
        <>
          <p className="text-sm text-destructive font-medium">
            Weryfikacja nie powiodła się. Link jest nieprawidłowy lub wygasł.
          </p>
          <button
            onClick={() => navigate('/auth/login')}
            className="text-sm text-primary hover:underline"
          >
            Wróć do logowania
          </button>
        </>
      )}
    </div>
  );
}
