import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
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
  DialogTrigger,
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
import { UserPlus, Trash2, Users } from 'lucide-react';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { toast } from 'sonner';
import type { UserResponse } from '@/types/user';

const inviteSchema = z.object({
  email: z.string().email('Nieprawidłowy adres e-mail'),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

function RoleBadge({ role }: { role: UserResponse['role'] }) {
  return (
    <Badge variant={role === 'MASTER_USER' ? 'default' : 'secondary'}>
      {role === 'MASTER_USER' ? 'Administrator' : 'Użytkownik'}
    </Badge>
  );
}

function StatusBadge({ isActive, emailVerified }: { isActive: boolean; emailVerified: boolean }) {
  if (!isActive) {
    return <Badge variant="outline" className="text-muted-foreground">Oczekuje na aktywację</Badge>;
  }
  if (!emailVerified) {
    return <Badge variant="outline" className="text-amber-600 border-amber-400">E-mail niezweryfikowany</Badge>;
  }
  return <Badge variant="outline" className="text-emerald-600 border-emerald-400">Aktywny</Badge>;
}

export default function AdminUsersPage() {
  const { users, isLoading, inviteUser, isInviting, deleteUser } = useAdminUsers();
  const [inviteOpen, setInviteOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
  });

  const onInvite = (data: InviteFormValues) => {
    inviteUser(data.email, {
      onSuccess: () => {
        toast.success('Zaproszenie wysłane', {
          description: `Wysłano e-mail z zaproszeniem na adres ${data.email}.`,
        });
        reset();
        setInviteOpen(false);
      },
      onError: () => {
        toast.error('Błąd', { description: 'Nie udało się wysłać zaproszenia.' });
      },
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Synchronizacja danych...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Użytkownicy</h2>
        <DialogRoot open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4" />
              Zaproś użytkownika
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Zaproś nowego użytkownika</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onInvite)} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Adres e-mail</Label>
                <Input
                  id="invite-email"
                  placeholder="uzytkownik@example.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Anuluj</Button>
                </DialogClose>
                <Button type="submit" disabled={isInviting}>
                  {isInviting ? 'Wysyłanie...' : 'Wyślij zaproszenie'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </DialogRoot>
      </div>

      {users?.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>Brak użytkowników</EmptyTitle>
            <EmptyDescription>Zaproś pierwszego użytkownika, aby nadać mu dostęp do panelu.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <button className="text-sm text-primary hover:underline" onClick={() => setInviteOpen(true)}>
              + Zaproś użytkownika
            </button>
          </EmptyContent>
        </Empty>
      ) : (
      <Table>
          <TableHeader>
            <TableRow>
              <TableHead>E-mail</TableHead>
              <TableHead>Rola</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell>
                  <StatusBadge isActive={user.active} emailVerified={user.emailVerified} />
                </TableCell>
                <TableCell className="text-right">
                  {user.role !== 'MASTER_USER' && (
                    <AlertDialogRoot>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Usuń użytkownika</AlertDialogTitle>
                          <AlertDialogDescription>
                            Czy na pewno chcesz usunąć użytkownika <strong>{user.email}</strong>?
                            Tej operacji nie można cofnąć.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Anuluj</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              deleteUser(user.id, {
                                onSuccess: () =>
                                  toast.success('Użytkownik usunięty'),
                                onError: () =>
                                  toast.error('Błąd', { description: 'Nie udało się usunąć użytkownika.' }),
                              })
                            }
                          >
                            Usuń
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialogRoot>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableCaption>
            Łącznie {users?.length} {users?.length === 1 ? 'użytkownik' : 'użytkowników'}
          </TableCaption>
        </Table>
      )}
    </div>
  );
}
