import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminContact } from '@/hooks/useAdminContact';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
import { MessageSquare, ChevronLeft, ChevronRight, Trash2, Reply } from 'lucide-react';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import type { ContactMessageResponse, ContactMessageStatus } from '@/types/contact';

const PAGE_SIZE = 20;

const STATUS_LABELS: Record<ContactMessageStatus, string> = {
  PENDING_VERIFICATION: 'Oczekuje',
  UNREAD: 'Nieprzeczytana',
  READ: 'Przeczytana',
  REPLIED: 'Odpowiedziana',
};

const STATUS_VARIANTS: Record<ContactMessageStatus, string> = {
  PENDING_VERIFICATION: 'border-yellow-500/40 text-yellow-600 dark:text-yellow-400',
  UNREAD: 'border-primary/40 text-primary',
  READ: 'border-muted-foreground/40 text-muted-foreground',
  REPLIED: 'border-green-500/40 text-green-600 dark:text-green-400',
};

const FILTER_TABS: { label: string; value?: ContactMessageStatus }[] = [
  { label: 'Wszystkie' },
  { label: 'Nieprzeczytane', value: 'UNREAD' },
  { label: 'Przeczytane', value: 'READ' },
  { label: 'Odpowiedziane', value: 'REPLIED' },
];

const replySchema = z.object({
  reply: z.string().min(1, 'Odpowiedź jest wymagana').max(2000),
});
type ReplyForm = z.infer<typeof replySchema>;

function MessageDetailDialog({
  message,
  open,
  onOpenChange,
  onReply,
  isReplying,
}: {
  message: ContactMessageResponse;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onReply: (id: number, reply: string) => void;
  isReplying: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReplyForm>({ resolver: zodResolver(replySchema) });

  const createdAt = new Date(message.createdAt).toLocaleString('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const onSubmit = (data: ReplyForm) => {
    onReply(message.id, data.reply);
    reset();
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {message.subject}
            <Badge variant="outline" className={STATUS_VARIANTS[message.status]}>
              {STATUS_LABELS[message.status]}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {message.name} · {message.email} · {createdAt}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
            {message.message}
          </div>

          {message.adminReply && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Twoja odpowiedź
              </p>
              <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
                {message.adminReply}
              </div>
              {message.repliedAt && (
                <p className="text-xs text-muted-foreground">
                  Wysłano:{' '}
                  {new Date(message.repliedAt).toLocaleString('pl-PL', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              )}
            </div>
          )}

          {message.status !== 'REPLIED' && (
            <>
              <Separator />
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Odpowiedź</Label>
                  <textarea
                    rows={4}
                    maxLength={2000}
                    placeholder="Napisz odpowiedź..."
                    className={`flex w-full resize-y rounded-md border ${
                      errors.reply ? 'border-destructive' : 'border-input'
                    } bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                    {...register('reply')}
                  />
                  {errors.reply && (
                    <p className="text-[11px] text-destructive">{errors.reply.message}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Zamknij
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isReplying} className="gap-2">
                    <Reply className="h-4 w-4" />
                    {isReplying ? 'Wysyłanie...' : 'Wyślij odpowiedź'}
                  </Button>
                </div>
              </form>
            </>
          )}

          {message.status === 'REPLIED' && (
            <div className="flex justify-end">
              <DialogClose asChild>
                <Button variant="outline">Zamknij</Button>
              </DialogClose>
            </div>
          )}
        </div>
      </DialogContent>
    </DialogRoot>
  );
}

export default function AdminContactPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ContactMessageStatus | undefined>(undefined);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageResponse | null>(null);

  const { data, isLoading, unreadCount, reply, isReplying, deleteMessage, isDeleting } =
    useAdminContact(page, PAGE_SIZE, statusFilter);

  const handleFilterChange = (value?: ContactMessageStatus) => {
    setStatusFilter(value);
    setPage(0);
  };

  const handleReply = (id: number, replyText: string) => {
    reply(
      { id, data: { reply: replyText } },
      {
        onSuccess: (updated) => {
          setSelectedMessage(updated);
        },
      }
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Synchronizacja danych…</div>;
  }

  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Wiadomości</h2>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              {unreadCount} nieprzeczytanych
            </p>
          )}
        </div>
        {data && (
          <span className="text-sm text-muted-foreground">Łącznie: {data.totalElements}</span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-lg border bg-muted/40 p-1 w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleFilterChange(tab.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {data?.content.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquare />
            </EmptyMedia>
            <EmptyTitle>Brak wiadomości</EmptyTitle>
            <EmptyDescription>Nie ma żadnych wiadomości w tej kategorii.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nadawca</TableHead>
                <TableHead>Temat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.content.map((msg) => {
                const createdAt = new Date(msg.createdAt).toLocaleDateString('pl-PL', {
                  dateStyle: 'short',
                });
                return (
                  <TableRow
                    key={msg.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedMessage(msg)}
                  >
                    <TableCell>
                      <div className={`font-medium ${msg.status === 'UNREAD' ? 'text-foreground' : ''}`}>
                        {msg.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{msg.email}</div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{msg.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_VARIANTS[msg.status]}>
                        {STATUS_LABELS[msg.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {createdAt}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
                            <AlertDialogTitle>Usuń wiadomość</AlertDialogTitle>
                            <AlertDialogDescription>
                              Czy na pewno chcesz usunąć wiadomość od{' '}
                              <strong>{msg.name}</strong>? Tej operacji nie można cofnąć.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Anuluj</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMessage(msg.id)}>
                              Usuń
                            </AlertDialogAction>
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
              <Button
                variant="outline"
                size="icon"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
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

      {selectedMessage && (
        <MessageDetailDialog
          message={selectedMessage}
          open={!!selectedMessage}
          onOpenChange={(v) => !v && setSelectedMessage(null)}
          onReply={handleReply}
          isReplying={isReplying}
        />
      )}
    </div>
  );
}
