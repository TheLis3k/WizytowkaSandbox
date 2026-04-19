import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { reservationService } from '@/services/reservationService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { CalendarDays, Users, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import type { TimeSlotAvailability, AvailableTable } from '@/types/reservation';
import { cn } from '@/lib/utils';

const today = new Date().toISOString().split('T')[0];

const bookingSchema = z.object({
  guestName: z.string().min(1, 'Imię i nazwisko jest wymagane'),
  guestEmail: z.string().email('Podaj poprawny adres e-mail'),
  guestPhone: z
    .string()
    .refine((val) => !val || /^\+?[\d\s\-().]{7,20}$/.test(val), 'Podaj poprawny numer telefonu')
    .optional(),
  tableId: z.coerce.number().min(1, 'Wybierz stolik'),
  comments: z.string().max(1000).optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

const STATUS_LABELS: Record<string, string> = {
  PENDING_CONFIRMATION: 'Oczekuje na potwierdzenie',
  CONFIRMED: 'Potwierdzona',
  CANCELLED: 'Anulowana',
  EXPIRED: 'Wygasła',
};

function SlotRow({
  slot,
  onBook,
}: {
  slot: TimeSlotAvailability;
  onBook: (slot: TimeSlotAvailability) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="w-14 text-sm font-mono text-muted-foreground shrink-0">{slot.time}</span>
      <div
        className={cn(
          'flex flex-1 items-center justify-between rounded-md px-4 py-2.5 text-sm transition-colors',
          slot.available
            ? 'bg-primary/10 hover:bg-primary/20 cursor-pointer border border-primary/20'
            : 'bg-muted/50 border border-transparent cursor-not-allowed opacity-60'
        )}
        onClick={() => slot.available && onBook(slot)}
        role={slot.available ? 'button' : undefined}
        tabIndex={slot.available ? 0 : undefined}
        onKeyDown={(e) => e.key === 'Enter' && slot.available && onBook(slot)}
      >
        {slot.available ? (
          <>
            <span className="font-medium text-primary">
              Dostępne &mdash; {slot.tables.length} {slot.tables.length === 1 ? 'stolik' : 'stoliki'}
            </span>
            <Badge variant="outline" className="text-primary border-primary/30 text-xs">
              Zarezerwuj
            </Badge>
          </>
        ) : (
          <span className="text-muted-foreground">Zajęte</span>
        )}
      </div>
    </div>
  );
}

export default function ReservationPage() {
  const [selectedDate, setSelectedDate] = useState(today);
  const [partySize, setPartySize] = useState(2);
  const [searched, setSearched] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotAvailability | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookingDone, setBookingDone] = useState(false);

  const availabilityQuery = useQuery({
    queryKey: ['availability', selectedDate, partySize],
    queryFn: () => reservationService.getAvailability(selectedDate, partySize),
    enabled: searched,
  });

  const createMutation = useMutation({
    mutationFn: reservationService.createReservation,
    onSuccess: () => {
      setDialogOpen(false);
      setBookingDone(true);
      toast.success('Rezerwacja złożona!', {
        description: 'Sprawdź skrzynkę e-mail — wysłaliśmy link potwierdzający.',
      });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Nie udało się złożyć rezerwacji.';
      toast.error('Błąd rezerwacji', { description: msg });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BookingForm>({ resolver: zodResolver(bookingSchema) });

  const handleSearch = () => {
    setSearched(true);
    setBookingDone(false);
  };

  const handleBook = (slot: TimeSlotAvailability) => {
    setSelectedSlot(slot);
    reset();
    if (slot.tables.length > 0) setValue('tableId', slot.tables[0].id);
    setDialogOpen(true);
  };

  const onSubmit = (values: BookingForm) => {
    if (!selectedSlot) return;
    createMutation.mutate({
      ...values,
      partySize,
      startTime: `${selectedDate}T${selectedSlot.time}:00`,
    });
  };

  const formattedDate = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('pl-PL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Rezerwacja stolika</h1>
        <p className="text-muted-foreground">Wybierz datę i liczbę gości, aby zobaczyć dostępne godziny.</p>
      </div>

      {/* Search controls */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="date" className="flex items-center gap-1.5 text-sm">
              <CalendarDays className="w-4 h-4" />
              Data
            </Label>
            <Input
              id="date"
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSearched(false); }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="partySize" className="flex items-center gap-1.5 text-sm">
              <Users className="w-4 h-4" />
              Liczba gości
            </Label>
            <Input
              id="partySize"
              type="number"
              min={1}
              max={20}
              value={partySize}
              onChange={(e) => { setPartySize(Number(e.target.value)); setSearched(false); }}
            />
          </div>
        </div>
        <Button className="w-full" onClick={handleSearch} disabled={!selectedDate || partySize < 1}>
          Sprawdź dostępność
        </Button>
      </div>

      {/* Day view */}
      {searched && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold capitalize">{formattedDate}</h2>
          </div>

          {availabilityQuery.isLoading && (
            <div className="text-center py-12 text-muted-foreground text-sm">Ładowanie dostępności…</div>
          )}

          {availabilityQuery.isError && (
            <div className="text-center py-12 text-destructive text-sm">Nie udało się załadować dostępności.</div>
          )}

          {availabilityQuery.data && (
            <div className="bg-card border rounded-xl p-4 space-y-1">
              {availabilityQuery.data.map((slot) => (
                <SlotRow key={slot.time} slot={slot} onBook={handleBook} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Success banner */}
      {bookingDone && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4 text-sm">
          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="font-semibold">Rezerwacja przyjęta!</p>
            <p className="text-muted-foreground">
              Sprawdź skrzynkę e-mail i potwierdź rezerwację w ciągu 15 minut.
            </p>
          </div>
        </div>
      )}

      {/* Booking dialog */}
      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rezerwacja — {selectedSlot?.time}</DialogTitle>
            <DialogDescription>
              {formattedDate} · {partySize} {partySize === 1 ? 'gość' : 'gości'} · 90 min
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="tableId">Stolik</Label>
              <select
                id="tableId"
                {...register('tableId')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {selectedSlot?.tables.map((t: AvailableTable) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (do {t.capacity} os.)
                  </option>
                ))}
              </select>
              {errors.tableId && <p className="text-xs text-destructive">{errors.tableId.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="guestName">Imię i nazwisko</Label>
              <Input id="guestName" {...register('guestName')} aria-invalid={!!errors.guestName} />
              {errors.guestName && <p className="text-xs text-destructive">{errors.guestName.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="guestEmail">Adres e-mail</Label>
              <Input id="guestEmail" type="email" {...register('guestEmail')} aria-invalid={!!errors.guestEmail} />
              {errors.guestEmail && <p className="text-xs text-destructive">{errors.guestEmail.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="guestPhone">Telefon (opcjonalnie)</Label>
              <Input id="guestPhone" type="tel" {...register('guestPhone')} aria-invalid={!!errors.guestPhone} />
              {errors.guestPhone && <p className="text-xs text-destructive">{errors.guestPhone.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="comments">Uwagi (opcjonalnie)</Label>
              <Input id="comments" {...register('comments')} placeholder="Alergie, uroczystości…" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">Anuluj</Button>
              </DialogClose>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Wysyłanie…' : 'Zarezerwuj'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
