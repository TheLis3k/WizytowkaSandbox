import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { contactService } from '@/services/contactService';

type State = 'loading' | 'success' | 'error' | 'expired';

export default function ContactVerifyPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<State>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setErrorMsg('Brak tokenu weryfikacyjnego.');
      return;
    }

    contactService
      .verify(token)
      .then(() => setState('success'))
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 410) {
          setState('expired');
        } else {
          setState('error');
          setErrorMsg(err?.response?.data?.message ?? 'Weryfikacja nie powiodła się.');
        }
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        {state === 'loading' && (
          <>
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Weryfikacja...</h2>
            <p className="mt-2 text-sm text-muted-foreground">Trwa potwierdzanie Twojej wiadomości.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/35 bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mb-2 text-2xl font-bold tracking-tight">Wiadomość potwierdzona!</h2>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              Twoja wiadomość dotarła do nas i oczekuje na odpowiedź.
              Odezwiemy się na podany adres e-mail.
            </p>
            <Button asChild>
              <Link to="/menu">Wróć do strony głównej</Link>
            </Button>
          </>
        )}

        {state === 'expired' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="mb-2 text-2xl font-bold tracking-tight">Link wygasł</h2>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              Link weryfikacyjny jest ważny przez 24 godziny. Wyślij formularz kontaktowy ponownie.
            </p>
            <Button asChild>
              <Link to="/formularz">Wyślij ponownie</Link>
            </Button>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="mb-2 text-2xl font-bold tracking-tight">Weryfikacja nieudana</h2>
            <p className="mb-6 text-sm text-muted-foreground">{errorMsg}</p>
            <Button asChild>
              <Link to="/formularz">Wróć do formularza</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
