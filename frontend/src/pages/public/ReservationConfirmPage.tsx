import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { reservationService } from '@/services/reservationService';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type State = 'loading' | 'success' | 'error';

export default function ReservationConfirmPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [state, setState] = useState<State>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('Brakujący token potwierdzenia.');
      return;
    }
    reservationService
      .confirmReservation(token)
      .then(() => setState('success'))
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Nie udało się potwierdzić rezerwacji.';
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
            <p className="text-muted-foreground">Potwierdzanie rezerwacji…</p>
          </>
        )}

        {state === 'success' && (
          <>
            <CheckCircle2 className="w-14 h-14 text-primary mx-auto" />
            <h1 className="text-2xl font-bold">Rezerwacja potwierdzona!</h1>
            <p className="text-muted-foreground">
              Twoja rezerwacja została potwierdzona. Do zobaczenia w restauracji!
            </p>
            <Button asChild>
              <Link to="/menu">Wróć do menu</Link>
            </Button>
          </>
        )}

        {state === 'error' && (
          <>
            <XCircle className="w-14 h-14 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Nie udało się potwierdzić</h1>
            <p className="text-muted-foreground">{message}</p>
            <Button asChild variant="outline">
              <Link to="/rezerwacja">Złóż nową rezerwację</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
