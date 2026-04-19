import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminTables } from '@/hooks/useAdminTables';
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
  DialogTrigger,
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
import { Plus, Edit2, PowerOff, TableProperties } from 'lucide-react';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { SwitchInput } from '@/components/ui/switch';
import type { TableResponse } from '@/types/table';

const tableSchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana'),
  capacity: z.coerce.number().min(1, 'Pojemność musi wynosić co najmniej 1'),
});

type TableForm = z.infer<typeof tableSchema>;

function TableDialog({
  trigger,
  table,
  onSubmit,
  isPending,
}: {
  trigger: React.ReactNode;
  table?: TableResponse;
  onSubmit: (data: TableForm) => void;
  isPending?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TableForm>({
    resolver: zodResolver(tableSchema),
    defaultValues: table ? { name: table.name, capacity: table.capacity } : { name: '', capacity: 2 },
  });

  useEffect(() => {
    reset(table ? { name: table.name, capacity: table.capacity } : { name: '', capacity: 2 });
  }, [table, reset]);

  return (
    <DialogRoot open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{table ? 'Edytuj stolik' : 'Nowy stolik'}</DialogTitle>
          <DialogDescription>
            {table ? 'Zmień dane stolika i zapisz.' : 'Wprowadź dane nowego stolika.'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((values) => { onSubmit(values); setOpen(false); })}
          className="space-y-4 pt-2"
        >
          <div className="space-y-1">
            <Label htmlFor="name">Nazwa stolika</Label>
            <Input id="name" {...register('name')} aria-invalid={!!errors.name} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="capacity">Liczba miejsc</Label>
            <Input id="capacity" type="number" min={1} {...register('capacity')} aria-invalid={!!errors.capacity} />
            {errors.capacity && <p className="text-xs text-destructive">{errors.capacity.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">Anuluj</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Zapisywanie…' : table ? 'Zapisz' : 'Dodaj'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}

export default function AdminTablesPage() {
  const [showInactive, setShowInactive] = useState(false);
  const { tables, isLoading, createTable, isCreating, updateTable, isUpdating, deactivateTable, isDeactivating } =
    useAdminTables();

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Synchronizacja danych…</div>;

  const visibleTables = showInactive ? tables : tables.filter((t) => t.active);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Stoliki</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <SwitchInput
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label htmlFor="show-inactive" className="text-sm text-muted-foreground cursor-pointer">
              Pokaż nieaktywne
            </Label>
          </div>
          <TableDialog
          trigger={
            <Button>
              <Plus /> Nowy stolik
            </Button>
          }
          onSubmit={createTable}
          isPending={isCreating}
        />
        </div>
      </div>

      {visibleTables.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TableProperties />
            </EmptyMedia>
            <EmptyTitle>{tables.length === 0 ? 'Brak stolików' : 'Brak aktywnych stolików'}</EmptyTitle>
            <EmptyDescription>
              {tables.length === 0
                ? 'Dodaj pierwszy stolik, aby umożliwić rezerwacje.'
                : 'Włącz przełącznik "Pokaż nieaktywne", aby wyświetlić dezaktywowane stoliki.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nazwa</TableHead>
              <TableHead>Miejsca</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleTables.map((table) => (
              <TableRow key={table.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">{table.name}</TableCell>
                <TableCell>{table.capacity}</TableCell>
                <TableCell>
                  {table.active ? (
                    <Badge variant="outline" className="text-primary border-primary/40">Aktywny</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Nieaktywny</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <TableDialog
                    trigger={
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    }
                    table={table}
                    onSubmit={(data) => updateTable({ id: table.id, data })}
                    isPending={isUpdating}
                  />
                  {table.active && (
                    <AlertDialogRoot>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={isDeactivating}
                        >
                          <PowerOff className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Dezaktywuj stolik</AlertDialogTitle>
                          <AlertDialogDescription>
                            Czy na pewno chcesz dezaktywować stolik <strong>{table.name}</strong>? Nie będzie widoczny
                            dla gości podczas rezerwacji.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Anuluj</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deactivateTable(table.id)}>
                            Dezaktywuj
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
            Wyświetlono {visibleTables.length} z {tables.length} {tables.length === 1 ? 'stolika' : 'stolików'}
          </TableCaption>
        </Table>
      )}
    </div>
  );
}
