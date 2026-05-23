import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Phone, Clock, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useContact } from '@/hooks/useContact';
import type { ContactMessageRequest } from '@/types/contact';

const SUBJECTS = [
  'Rezerwacja grupowa',
  'Zapytanie o menu',
  'Organizacja eventu',
  'Współpraca',
  'Reklamacja',
  'Inne',
];

const MAX_MSG = 2000;

const schema = z.object({
  name: z.string().min(1, 'Imię i nazwisko jest wymagane').max(100),
  email: z.string().min(1, 'Adres e-mail jest wymagany').email('Nieprawidłowy adres e-mail').max(255),
  subject: z.string().min(1, 'Wybierz temat wiadomości'),
  message: z
    .string()
    .min(10, 'Wiadomość jest zbyt krótka (min. 10 znaków)')
    .max(MAX_MSG, `Maksymalnie ${MAX_MSG} znaków`),
});

type FormValues = z.infer<typeof schema>;

function InfoCard({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/35 bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium leading-snug">{children}</span>
    </div>
  );
}

function SuccessView({
  sentData,
  onReset,
}: {
  sentData: FormValues;
  onReset: () => void;
}) {
  return (
    <div className="rounded-[14px] border bg-card p-7">
      <div className="flex flex-col items-center py-8 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-primary/35 bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight">Sprawdź skrzynkę e-mail!</h2>
        <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Dziękujemy, <strong className="text-foreground">{sentData.name.split(' ')[0]}</strong>!
          Wysłaliśmy link weryfikacyjny na{' '}
          <strong className="text-foreground">{sentData.email}</strong>.
          Kliknij w link, aby Twoja wiadomość dotarła do nas.
        </p>

        <div className="mb-6 flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Oczekuje na weryfikację e-mail
        </div>

        <div className="mb-7 w-full rounded-xl border bg-muted/40 p-4 text-left">
          <div className="space-y-2.5">
            {[
              ['Temat', sentData.subject],
              ['E-mail', sentData.email],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
            <Separator />
            <p className="text-xs leading-relaxed text-muted-foreground">
              „{sentData.message.slice(0, 120)}
              {sentData.message.length > 120 ? '…' : ''}"
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={onReset}>
          Wyślij kolejną wiadomość
        </Button>
      </div>
    </div>
  );
}

function ContactForm({ onSuccess }: { onSuccess: (data: FormValues) => void }) {
  const { submitAsync, isSubmitting } = useContact();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  });

  const msgLen = watch('message')?.length ?? 0;

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);
    try {
      const payload: ContactMessageRequest = {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      };
      await submitAsync(payload);
      onSuccess(data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      if (status === 429) {
        setSubmitError('Zbyt wiele wiadomości. Spróbuj ponownie za 10 minut.');
      } else {
        setSubmitError('Wystąpił błąd podczas wysyłania. Spróbuj ponownie.');
      }
    }
  };

  const fieldClass = (hasError?: boolean) =>
    `flex h-10 w-full rounded-md border ${
      hasError ? 'border-destructive ring-2 ring-destructive/20' : 'border-input'
    } bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`;

  return (
    <div className="space-y-3">
      {/* Info cards */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 max-[560px]:grid-cols-1">
        <InfoCard icon={MapPin} label="Adres">
          ul. Przykładowa 12
          <br />
          00-001 Warszawa
        </InfoCard>
        <InfoCard icon={Phone} label="Telefon">
          +48 600 000 000
        </InfoCard>
        <InfoCard icon={Clock} label="Godziny otwarcia">
          Pon–Pt: 10–22
          <br />
          Sob–Nd: 11–23
        </InfoCard>
      </div>

      {/* Form card */}
      <div className="rounded-[14px] border bg-card p-7">
        <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Mail className="h-3.5 w-3.5 text-primary" />
          Wyślij wiadomość
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          {/* Name + Email row */}
          <div className="grid grid-cols-2 gap-3.5 max-[560px]:grid-cols-1">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs text-muted-foreground">
                Imię i nazwisko *
              </Label>
              <Input
                id="name"
                placeholder="Jan Kowalski"
                className={errors.name ? 'border-destructive ring-2 ring-destructive/20' : ''}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-[11px] text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-muted-foreground">
                Adres e-mail *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jan@example.com"
                className={errors.email ? 'border-destructive ring-2 ring-destructive/20' : ''}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-[11px] text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="subject" className="text-xs text-muted-foreground">
              Temat *
            </Label>
            <select id="subject" {...register('subject')} className={fieldClass(!!errors.subject)}>
              <option value="">Wybierz temat...</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.subject && (
              <p className="text-[11px] text-destructive">{errors.subject.message}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-xs text-muted-foreground">
              Wiadomość *
            </Label>
            <textarea
              id="message"
              rows={5}
              maxLength={MAX_MSG}
              placeholder="Opisz swoje pytanie lub prośbę..."
              className={`flex w-full resize-y rounded-md border ${
                errors.message ? 'border-destructive ring-2 ring-destructive/20' : 'border-input'
              } bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[120px]`}
              {...register('message')}
            />
            <div className="flex items-start justify-between">
              <span>
                {errors.message && (
                  <p className="text-[11px] text-destructive">{errors.message.message}</p>
                )}
              </span>
              <span
                className={`text-[11px] ${
                  msgLen > MAX_MSG * 0.9 ? 'text-destructive' : 'text-muted-foreground'
                }`}
              >
                {msgLen} / {MAX_MSG}
              </span>
            </div>
          </div>

          <Separator />

          {submitError && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {submitError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wysyłanie...
              </>
            ) : (
              'Wyślij wiadomość'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const [sentData, setSentData] = useState<FormValues | null>(null);

  return (
    <div className="mx-auto max-w-[700px] px-6 py-14 pb-20">
      <div className="mb-11 text-center">
        <h1 className="mb-2.5 text-4xl font-bold tracking-tight">Kontakt</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Masz pytanie lub chcesz się skontaktować? Napisz do nas.
        </p>
      </div>

      {sentData ? (
        <SuccessView sentData={sentData} onReset={() => setSentData(null)} />
      ) : (
        <ContactForm onSuccess={setSentData} />
      )}
    </div>
  );
}
