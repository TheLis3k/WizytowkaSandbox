import { useState } from 'react';
import { useAdminMenu } from '../../hooks/useAdminMenu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckboxInput } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2 } from "lucide-react";
import MenuItemDialog from '@/components/admin/MenuItemDialog';
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

export default function AdminMenuManager() {
  const { menuItems, isLoading, createMenuItem, isCreating, updateMenuItem, isUpdating, deleteMenuItem, deleteManyMenuItems, isDeletingMany } = useAdminMenu();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Synchronizacja danych...</div>;

  const allIds = menuItems?.map((i) => i.id) ?? [];
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const someSelected = allIds.some((id) => selectedIds.has(id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDeleteMany = () => {
    deleteManyMenuItems([...selectedIds], {
      onSuccess: () => setSelectedIds(new Set()),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Katalog Dań</h2>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <AlertDialogRoot>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeletingMany}>
                  <Trash2 /> Usuń zaznaczone ({selectedIds.size})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Usuń zaznaczone pozycje</AlertDialogTitle>
                  <AlertDialogDescription>
                    Czy na pewno chcesz usunąć <strong>{selectedIds.size}</strong> {selectedIds.size === 1 ? 'pozycję' : 'pozycje'}? Tej operacji nie można cofnąć.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteMany}>Usuń</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogRoot>
          )}
          <MenuItemDialog
            trigger={
              <Button>
                <Plus /> Nowa pozycja
              </Button>
            }
            onSubmit={createMenuItem}
            isPending={isCreating}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <CheckboxInput
                  checked={allSelected}
                  data-state={someSelected && !allSelected ? 'indeterminate' : undefined}
                  onCheckedChange={toggleAll}
                  aria-label="Zaznacz wszystkie"
                />
              </TableHead>
              <TableHead className="w-[100px]">Zdjęcie</TableHead>
              <TableHead>Nazwa</TableHead>
              <TableHead>Kategoria</TableHead>
              <TableHead>Cena</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems?.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-muted/50 transition-colors"
                data-state={selectedIds.has(item.id) ? 'selected' : undefined}
              >
                <TableCell>
                  <CheckboxInput
                    checked={selectedIds.has(item.id)}
                    onCheckedChange={() => toggleOne(item.id)}
                    aria-label={`Zaznacz ${item.name}`}
                  />
                </TableCell>
                <TableCell>
                  <img src={item.imageUrl || ''} alt="" className="h-10 w-10 rounded-md object-cover bg-muted" />
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.category}</Badge>
                </TableCell>
                <TableCell>{item.price.toFixed(2)} zł</TableCell>
                <TableCell className="text-right space-x-2">
                  <MenuItemDialog
                    trigger={
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    }
                    item={item}
                    onSubmit={(data) => updateMenuItem({ id: item.id, data })}
                    isPending={isUpdating}
                  />
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
                        <AlertDialogTitle>Usuń pozycję</AlertDialogTitle>
                        <AlertDialogDescription>
                          Czy na pewno chcesz usunąć <strong>{item.name}</strong>? Tej operacji nie można cofnąć.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMenuItem(item.id)}>
                          Usuń
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialogRoot>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
