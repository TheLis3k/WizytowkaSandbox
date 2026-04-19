import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { reservationService } from '@/services/reservationService';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type State = 'loading' | 'success' | 'error';

export default function ReservationCancelPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [state, setState] = useState<State>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('Brakujący token anulowania.');
      return;
    }
    reservationService
      .cancelReservation(token)
      .then(() => setState('success'))
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Nie udało się anulować rezerwacji.';
        setMessage(msg);
        setState('error');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {state === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Anulowanie rezerwacji…</p>
          </>
        )}

        {state === 'success' && (
          <>
            <CheckCircle2 className="w-14 h-14 text-primary mx-auto" />
            <h1 className="text-2xl font-bold">Rezerwacja anulowana</h1>
            <p className="text-muted-foreground">
              Twoja rezerwacja została anulowana. Jeśli to pomyłka, złóż nową rezerwację.
            </p>
            <Button asChild>
              <Link to="/rezerwacja">Zarezerwuj ponownie</Link>
            </Button>
          </>
        )}

        {state === 'error' && (
          <>
            <XCircle className="w-14 h-14 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Nie udało się anulować</h1>
            <p className="text-muted-foreground">{message}</p>
            <Button asChild variant="outline">
              <Link to="/menu">Wróć do menu</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
