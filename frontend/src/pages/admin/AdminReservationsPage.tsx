import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminReservations } from '@/hooks/useAdminReservations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialogRoot,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Edit2, Trash2, ChevronLeft, ChevronRight, CalendarX2 } from 'lucide-react';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import type { ReservationResponse, ReservationStatus } from '@/types/reservation';

const PAGE_SIZE = 20;

const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING_CONFIRMATION: 'Oczekuje',
  CONFIRMED: 'Potwierdzona',
  CANCELLED: 'Anulowana',
  EXPIRED: 'Wygasła',
};

const STATUS_VARIANTS: Record<ReservationStatus, string> = {
  PENDING_CONFIRMATION: 'border-yellow-500/40 text-yellow-600 dark:text-yellow-400',
  CONFIRMED: 'border-primary/40 text-primary',
  CANCELLED: 'border-destructive/40 text-destructive',
  EXPIRED: 'border-muted-foreground/40 text-muted-foreground',
};

const updateSchema = z.object({
  status: z.enum(['PENDING_CONFIRMATION', 'CONFIRMED', 'CANCELLED', 'EXPIRED']).optional(),
  comments: z.string().optional(),
});

type UpdateForm = z.infer<typeof updateSchema>;

function EditReservationDialog({
  reservation,
  onSubmit,
  isPending,
  open,
  onOpenChange,
}: {
  reservation: ReservationResponse;
  onSubmit: (data: UpdateForm) => void;
  isPending: boolean;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { register, handleSubmit } = useForm<UpdateForm>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      status: reservation.status,
      comments: reservation.comments ?? '',
    },
  });

  const startDate = new Date(reservation.startTime).toLocaleString('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edytuj rezerwację #{reservation.id}</DialogTitle>
          <DialogDescription>
            {reservation.guestName} · {startDate} · {reservation.tableName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              {...register('status')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {(Object.keys(STATUS_LABELS) as ReservationStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="comments">Uwagi</Label>
            <Input id="comments" {...register('comments')} placeholder="Opcjonalne uwagi…" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">Anuluj</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Zapisywanie…' : 'Zapisz'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}

export default function AdminReservationsPage() {
  const [page, setPage] = useState(0);
  const [editingReservation, setEditingReservation] = useState<ReservationResponse | null>(null);

  const { data, isLoading, updateReservation, isUpdating, deleteReservation, isDeleting } =
    useAdminReservations(page, PAGE_SIZE);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Synchronizacja danych…</div>;

  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Rezerwacje</h2>
        {data && (
          <span className="text-sm text-muted-foreground">
            Łącznie: {data.totalElements}
          </span>
        )}
      </div>

      {data?.content.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarX2 />
            </EmptyMedia>
            <EmptyTitle>Brak rezerwacji</EmptyTitle>
            <EmptyDescription>Nie ma jeszcze żadnych rezerwacji.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gość</TableHead>
                <TableHead>Stolik</TableHead>
                <TableHead>Data i godzina</TableHead>
                <TableHead>Goście</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.content.map((r) => {
                const startDate = new Date(r.startTime).toLocaleString('pl-PL', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                });
                return (
                  <TableRow key={r.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="font-medium">{r.guestName}</div>
                      <div className="text-xs text-muted-foreground">{r.guestEmail}</div>
                    </TableCell>
                    <TableCell>{r.tableName}</TableCell>
                    <TableCell className="whitespace-nowrap">{startDate}</TableCell>
                    <TableCell>{r.partySize}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_VARIANTS[r.status]}>
                        {STATUS_LABELS[r.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary"
                        onClick={() => setEditingReservation(r)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialogRoot>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Usuń rezerwację</AlertDialogTitle>
                            <AlertDialogDescription>
                              Czy na pewno chcesz usunąć rezerwację gościa <strong>{r.guestName}</strong>? Tej
                              operacji nie można cofnąć.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Anuluj</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteReservation(r.id)}>Usuń</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialogRoot>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Strona {page + 1} z {totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {editingReservation && (
        <EditReservationDialog
          reservation={editingReservation}
          open={!!editingReservation}
          onOpenChange={(v) => !v && setEditingReservation(null)}
          isPending={isUpdating}
          onSubmit={(data) =>
            updateReservation(
              { id: editingReservation.id, data },
              { onSuccess: () => setEditingReservation(null) }
            )
          }
        />
      )}
    </div>
  );
}
