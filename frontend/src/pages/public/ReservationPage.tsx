import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { reservationService } from '@/services/reservationService';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays, Users, Clock, ArrowLeft, Check, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimeSlotAvailability, AvailableTable } from '@/types/reservation';

const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);
const today = todayDate.toISOString().split('T')[0];

const fmtDate = (iso: string) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const guestLabel = (n: number) => (n === 1 ? 'osoba' : n < 5 ? 'osoby' : 'osób');

const HOURS = ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

const STEP_LABELS = ['Termin', 'Godzina', 'Dane', 'Potwierdzenie'] as const;

const bookingSchema = z.object({
  guestName: z.string().min(1, 'Imię i nazwisko jest wymagane'),
  guestPhone: z
    .string()
    .min(1, 'Numer telefonu jest wymagany')
    .refine((v) => /^\+?[\d\s\-(). ]{7,20}$/.test(v), 'Podaj poprawny numer telefonu'),
  guestEmail: z
    .string()
    .min(1, 'Adres e-mail jest wymagany')
    .email('Podaj poprawny adres e-mail'),
  comments: z.string().max(1000).optional(),
  tableId: z.coerce.number().min(1),
});

type BookingForm = z.infer<typeof bookingSchema>;

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {STEP_LABELS.map((label, idx) => {
        const n = idx + 1;
        const isDone = current > n;
        const isActive = current === n;
        return (
          <div key={n} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-7 h-7 rounded-full border-[1.5px] flex items-center justify-center text-xs font-semibold transition-all',
                  isDone && 'bg-green-400 border-green-400 text-black',
                  isActive && !isDone && 'border-green-400 text-green-400',
                  !isDone && !isActive && 'border-border text-muted-foreground bg-card',
                )}
              >
                {isDone ? <Check className="size-3.5 stroke-[3]" /> : n}
              </div>
              <span
                className={cn(
                  'text-[11px] whitespace-nowrap',
                  isActive ? 'text-green-400' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>
            {idx < STEP_LABELS.length - 1 && (
              <div
                className={cn(
                  'w-14 h-px mx-1 mb-5 transition-colors',
                  isDone ? 'bg-green-400' : 'bg-border',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Summary box ───────────────────────────────────────────────────────────────
function SummaryBox({
  rows,
}: {
  rows: { label: string; value: string; highlight?: boolean }[];
}) {
  return (
    <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-2 mb-5">
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">{r.label}</span>
          <span className={cn('font-medium', r.highlight && 'text-green-400 font-semibold')}>
            {r.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Back button ───────────────────────────────────────────────────────────────
function BackBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="size-4" />
      {label}
    </button>
  );
}

// ── Step 1: Date & Guests ─────────────────────────────────────────────────────
function StepSearch({ onSearch }: { onSearch: (date: string, guests: number) => void }) {
  const [date, setDate] = useState<Date | undefined>(todayDate);
  const [guests, setGuests] = useState(2);
  const [open, setOpen] = useState(false);

  const handleSelect = (d: Date | undefined) => {
    setDate(d);
    setOpen(false);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-7 space-y-5">
      <p className="text-sm font-semibold flex items-center gap-2">
        <CalendarDays className="size-4 text-green-400" />
        Wybierz termin
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Data</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!date}
                className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
              >
                <CalendarDays className="size-4 text-green-400" />
                {date ? format(date, 'd MMMM yyyy', { locale: pl }) : 'Wybierz datę'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleSelect}
                disabled={{ before: todayDate }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Liczba gości</Label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none cursor-pointer focus-visible:border-ring dark:bg-input/30"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n} {guestLabel(n)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button
        className="w-full"
        onClick={() => date && onSearch(format(date, 'yyyy-MM-dd'), guests)}
        disabled={!date}
      >
        Sprawdź dostępność
      </Button>
    </div>
  );
}

// ── Step 2: Time slots ────────────────────────────────────────────────────────
function StepSlots({
  date,
  guests,
  slots,
  isLoading,
  isError,
  onBack,
  onSelect,
}: {
  date: string;
  guests: number;
  slots: TimeSlotAvailability[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onBack: () => void;
  onSelect: (slot: TimeSlotAvailability) => void;
}) {
  const [focusHour, setFocusHour] = useState(() => {
    if (date !== today) return '13:00';
    const h = new Date().getHours() + 1;
    const clamped = Math.min(Math.max(h, 10), 20);
    return `${String(clamped).padStart(2, '0')}:00`;
  });
  const [selected, setSelected] = useState<string | null>(null);

  const visibleSlots = useMemo(() => {
    if (!slots) return [];
    const [fh, fm] = focusHour.split(':').map(Number);
    const focusMin = fh * 60 + fm;
    return slots.filter((s) => {
      const [sh, sm] = s.time.split(':').map(Number);
      return Math.abs(sh * 60 + sm - focusMin) <= 60;
    });
  }, [slots, focusHour]);

  const selectedSlot = slots?.find((s) => s.time === selected) ?? null;

  return (
    <div className="space-y-5">
      <BackBtn label="Zmień datę" onClick={onBack} />

      <SummaryBox
        rows={[
          { label: 'Data', value: fmtDate(date) },
          { label: 'Liczba gości', value: `${guests} ${guestLabel(guests)}` },
        ]}
      />

      <div className="bg-card border border-border rounded-2xl p-7 space-y-5">
        <p className="text-sm font-semibold flex items-center gap-2">
          <Clock className="size-4 text-green-400" />
          Wybierz godzinę
        </p>

        {/* Hour pills */}
        <div className="flex flex-wrap gap-2 pb-5 border-b border-border">
          {HOURS.map((h) => (
            <button
              key={h}
              onClick={() => { setFocusHour(h); setSelected(null); }}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all',
                focusHour === h
                  ? 'border-green-400 bg-green-400/10 text-green-400'
                  : 'border-border bg-muted/50 text-muted-foreground hover:border-border/80 hover:text-foreground',
              )}
            >
              {h}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Sloty w okolicach <strong className="text-foreground">{focusHour}</strong> (±1h)
        </p>

        {isLoading && (
          <p className="text-center py-8 text-sm text-muted-foreground">Ładowanie dostępności…</p>
        )}
        {isError && (
          <p className="text-center py-8 text-sm text-destructive">Nie udało się załadować dostępności.</p>
        )}

        {slots && (
          <div className="space-y-2">
            {visibleSlots.length === 0 ? (
              <p className="text-center py-6 text-sm text-muted-foreground">Brak slotów w tym przedziale.</p>
            ) : (
              visibleSlots.map((slot) => {
                const isSelected = selected === slot.time;
                const [sh, sm] = slot.time.split(':').map(Number);
                const now = new Date();
                const isPast = date === today && sh * 60 + sm <= now.getHours() * 60 + now.getMinutes();
                const isUnavail = !slot.available || isPast;
                const tableCount = slot.tables?.length ?? 0;
                const isLow = slot.available && !isPast && tableCount === 1;

                return (
                  <div
                    key={slot.time}
                    onClick={() => !isUnavail && setSelected((s) => s === slot.time ? null : slot.time)}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-lg border transition-all',
                      isSelected && 'border-green-400 bg-green-400/10',
                      isUnavail && 'opacity-40 cursor-not-allowed border-border bg-muted/30',
                      !isUnavail && !isSelected && 'border-border bg-muted/30 hover:border-border/70 cursor-pointer',
                    )}
                  >
                    <span className="text-sm font-semibold tabular-nums">{slot.time}</span>
                    <span
                      className={cn(
                        'text-xs',
                        isUnavail ? 'text-destructive' : isLow ? 'text-yellow-400' : 'text-green-400',
                      )}
                    >
                      {isPast
                        ? 'Miniony'
                        : isUnavail
                        ? 'Niedostępne'
                        : isLow
                        ? 'Ostatni stolik'
                        : `${tableCount} ${tableCount === 1 ? 'stolik' : 'stoliki'} wolne`}
                    </span>
                    <button
                      disabled={isUnavail}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isUnavail) setSelected((s) => s === slot.time ? null : slot.time);
                      }}
                      className={cn(
                        'px-3.5 py-1 rounded-md text-xs font-medium border transition-all',
                        isSelected
                          ? 'bg-green-400 border-green-400 text-black'
                          : isUnavail
                          ? 'border-border text-muted-foreground cursor-not-allowed'
                          : 'border-green-400/40 text-green-400 hover:bg-green-400/10',
                      )}
                    >
                      {isSelected ? '✓ Wybrano' : 'Wybierz'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {selectedSlot && (
        <div className="mt-4">
          <Button className="w-full" onClick={() => onSelect(selectedSlot)}>
            Kontynuuj — {selectedSlot.time}
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Step 3: Contact form ──────────────────────────────────────────────────────
function StepForm({
  date,
  guests,
  slot,
  onBack,
  onConfirm,
  isPending,
}: {
  date: string;
  guests: number;
  slot: TimeSlotAvailability;
  onBack: () => void;
  onConfirm: (data: unknown) => void;
  isPending: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(bookingSchema) as any,
    defaultValues: { tableId: slot.tables[0]?.id },
  });

  return (
    <div>
      <BackBtn label="Zmień godzinę" onClick={onBack} />

      <SummaryBox
        rows={[
          { label: 'Termin', value: `${fmtDate(date)}, ${slot.time}`, highlight: true },
          { label: 'Liczba gości', value: `${guests} ${guestLabel(guests)}` },
        ]}
      />

      <form onSubmit={handleSubmit(onConfirm)}>
        <div className="bg-card border border-border rounded-2xl p-7 space-y-5">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Users className="size-4 text-green-400" />
            Dane kontaktowe
          </p>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Imię i nazwisko *</Label>
            <Input placeholder="Jan Kowalski" {...register('guestName')} aria-invalid={!!errors.guestName} />
            {errors.guestName && <p className="text-xs text-destructive">{errors.guestName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Telefon *</Label>
              <Input type="tel" placeholder="+48 600 000 000" {...register('guestPhone')} aria-invalid={!!errors.guestPhone} />
              {errors.guestPhone && <p className="text-xs text-destructive">{errors.guestPhone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">E-mail *</Label>
              <Input type="email" placeholder="jan@example.com" {...register('guestEmail')} aria-invalid={!!errors.guestEmail} />
              {errors.guestEmail && <p className="text-xs text-destructive">{errors.guestEmail.message}</p>}
            </div>
          </div>

          {slot.tables.length > 1 && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Stolik</Label>
              <select
                {...register('tableId')}
                className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none cursor-pointer focus-visible:border-ring dark:bg-input/30"
              >
                {slot.tables.map((t: AvailableTable) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (do {t.capacity} os.)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* hidden tableId when only one table */}
          {slot.tables.length === 1 && (
            <input type="hidden" {...register('tableId')} value={slot.tables[0].id} />
          )}

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Uwagi do rezerwacji</Label>
            <textarea
              {...register('comments')}
              placeholder="Alergie, okazja specjalna, preferencje dotyczące stolika…"
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-y focus-visible:border-ring dark:bg-input/30"
            />
          </div>

          <div className="h-px bg-border" />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Rezerwowanie…' : 'Potwierdź rezerwację'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ── Step 4: Confirmation ──────────────────────────────────────────────────────
function StepConfirm({
  date,
  guests,
  slot,
  guestName,
  guestPhone,
  onNew,
}: {
  date: string;
  guests: number;
  slot: TimeSlotAvailability;
  guestName: string;
  guestPhone: string;
  onNew: () => void;
}) {
  const firstName = guestName.split(' ')[0];

  return (
    <div className="bg-card border border-border rounded-2xl p-7 text-center space-y-5">
      <div className="w-16 h-16 rounded-full bg-green-400/10 border border-green-400/35 flex items-center justify-center mx-auto">
        <CheckCircle2 className="size-8 text-green-400" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight">Rezerwacja potwierdzona!</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Dziękujemy, {firstName}! Rezerwacja została przyjęta.<br />
          Sprawdź skrzynkę e-mail i kliknij link potwierdzający w ciągu 15 minut — bez potwierdzenia rezerwacja zostanie anulowana.
        </p>
      </div>

      <SummaryBox
        rows={[
          { label: 'Data i godzina', value: `${fmtDate(date)}, ${slot.time}`, highlight: true },
          { label: 'Liczba gości', value: `${guests} ${guestLabel(guests)}` },
          { label: 'Imię i nazwisko', value: guestName },
          { label: 'Telefon', value: guestPhone },
        ]}
      />

      <Button variant="outline" className="w-full" onClick={onNew}>
        Nowa rezerwacja
      </Button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ReservationPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedDate, setSelectedDate] = useState(today);
  const [partySize, setPartySize] = useState(2);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotAvailability | null>(null);
  const [confirmedForm, setConfirmedForm] = useState<BookingForm | null>(null);

  const availabilityQuery = useQuery({
    queryKey: ['availability', selectedDate, partySize],
    queryFn: () => reservationService.getAvailability(selectedDate, partySize),
    enabled: step >= 2,
  });

  const createMutation = useMutation({
    mutationFn: reservationService.createReservation,
    onSuccess: () => setStep(4),
  });

  const handleSearch = (date: string, guests: number) => {
    setSelectedDate(date);
    setPartySize(guests);
    setStep(2);
  };

  const handleSlotSelect = (slot: TimeSlotAvailability) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleFormConfirm = (data: unknown) => {
    const values = data as BookingForm;
    if (!selectedSlot) return;
    setConfirmedForm(values);
    createMutation.mutate({
      ...values,
      partySize,
      startTime: `${selectedDate}T${selectedSlot.time}:00`,
    });
  };

  const reset = () => {
    setStep(1);
    setSelectedSlot(null);
    setConfirmedForm(null);
    createMutation.reset();
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
      <div className="text-center mb-10 space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight scroll-m-20">Rezerwacja stolika</h1>
        <p className="text-sm text-muted-foreground">
          Wybierz datę i liczbę gości, aby zobaczyć dostępne godziny.
        </p>
      </div>

      <StepIndicator current={step} />

      {step === 1 && <StepSearch onSearch={handleSearch} />}

      {step === 2 && (
        <StepSlots
          date={selectedDate}
          guests={partySize}
          slots={availabilityQuery.data}
          isLoading={availabilityQuery.isLoading}
          isError={availabilityQuery.isError}
          onBack={() => setStep(1)}
          onSelect={handleSlotSelect}
        />
      )}

      {step === 3 && selectedSlot && (
        <StepForm
          date={selectedDate}
          guests={partySize}
          slot={selectedSlot}
          onBack={() => setStep(2)}
          onConfirm={handleFormConfirm}
          isPending={createMutation.isPending}
        />
      )}

      {step === 4 && selectedSlot && confirmedForm && (
        <StepConfirm
          date={selectedDate}
          guests={partySize}
          slot={selectedSlot}
          guestName={confirmedForm.guestName}
          guestPhone={confirmedForm.guestPhone}
          onNew={reset}
        />
      )}
    </div>
  );
}
