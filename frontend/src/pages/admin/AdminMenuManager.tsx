import { useState, useCallback, useEffect } from 'react';

function TableItemImage({ src }: { src: string }) {
  const [broken, setBroken] = useState(false);
  const handleError = useCallback(() => setBroken(true), []);
  if (broken) return <div className="h-10 w-10 rounded-md bg-muted" />;
  return <img src={src} alt="" onError={handleError} className="h-10 w-10 rounded-md object-cover bg-muted" />;
}

import { useAdminMenu } from '../../hooks/useAdminMenu';
import { useCategories } from '../../hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckboxInput } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, UtensilsCrossed, ChevronUp, ChevronDown, Tags, X } from 'lucide-react';
import MenuItemDialog from '@/components/admin/MenuItemDialog';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
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
import type { CategoryResponse } from '@/types/menu';

function CategoryManagerDialog({
  categories,
  onCreate,
  onRename,
  onRemove,
  onReorder,
}: {
  categories: CategoryResponse[];
  onCreate: (name: string) => void;
  onRename: (args: { id: number; name: string }) => void;
  onRemove: (id: number) => void;
  onReorder: (ids: number[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [localOrder, setLocalOrder] = useState<CategoryResponse[]>(categories);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  useEffect(() => {
    setLocalOrder(categories);
  }, [categories]);

  const swap = (i: number, j: number) => {
    const next = [...localOrder];
    [next[i], next[j]] = [next[j], next[i]];
    setLocalOrder(next);
    onReorder(next.map((c) => c.id));
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    onCreate(newName.trim());
    setNewName('');
  };

  const startEdit = (cat: CategoryResponse) => {
    setEditingId(cat.id);
    setEditingValue(cat.name);
  };

  const commitEdit = () => {
    if (editingId !== null && editingValue.trim()) {
      onRename({ id: editingId, name: editingValue.trim() });
    }
    setEditingId(null);
    setEditingValue('');
  };

  return (
    <DialogRoot open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Tags className="size-4" /> Kategorie
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Zarządzaj kategoriami</DialogTitle>
          <DialogDescription>
            Ustaw kolejność i nazwy kategorii. Kliknij dwukrotnie nazwę, aby ją edytować.
          </DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead>Nazwa</TableHead>
              <TableHead className="text-right w-28">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localOrder.map((cat, i) => (
              <TableRow key={cat.id}>
                <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                <TableCell>
                  {editingId === cat.id ? (
                    <Input
                      autoFocus
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEdit();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="h-7 text-sm"
                    />
                  ) : (
                    <span
                      className="cursor-pointer select-none"
                      onDoubleClick={() => startEdit(cat)}
                      title="Kliknij dwukrotnie, aby edytować"
                    >
                      {cat.name}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => swap(i, i - 1)}
                      disabled={i === 0}
                      aria-label="Przesuń wyżej"
                    >
                      <ChevronUp className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => swap(i, i + 1)}
                      disabled={i === localOrder.length - 1}
                      aria-label="Przesuń niżej"
                    >
                      <ChevronDown className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onRemove(cat.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      aria-label={`Usuń kategorię ${cat.name}`}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell />
              <TableCell>
                <Input
                  placeholder="Nowa kategoria..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  className="h-7 text-sm"
                />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={handleAdd}
                  disabled={!newName.trim()}
                  aria-label="Dodaj kategorię"
                >
                  <Plus className="size-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
    </DialogRoot>
  );
}

export default function AdminMenuManager() {
  const {
    menuItems,
    isLoading,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    deleteManyMenuItems,
    isDeletingMany,
  } = useAdminMenu();
  const { categories, create, rename, remove, reorder } = useCategories();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Synchronizacja danych...</div>;

  const categoryNames = categories.map((c) => c.name);

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
          <CategoryManagerDialog
            categories={categories}
            onCreate={create}
            onRename={rename}
            onRemove={remove}
            onReorder={reorder}
          />
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
                    Czy na pewno chcesz usunąć <strong>{selectedIds.size}</strong>{' '}
                    {selectedIds.size === 1 ? 'pozycję' : 'pozycje'}? Tej operacji nie można cofnąć.
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
            categories={categoryNames}
            onSubmit={createMenuItem}
          />
        </div>
      </div>

      {menuItems?.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UtensilsCrossed />
            </EmptyMedia>
            <EmptyTitle>Brak pozycji w menu</EmptyTitle>
            <EmptyDescription>Dodaj pierwszą pozycję, aby zaczać budować menu.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <MenuItemDialog
              trigger={<button className="text-sm text-primary hover:underline">+ Dodaj pozycję</button>}
              categories={categoryNames}
              onSubmit={createMenuItem}
            />
          </EmptyContent>
        </Empty>
      ) : (
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
                  {item.imageUrl ? (
                    <TableItemImage src={item.imageUrl} />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-muted" />
                  )}
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
                    categories={categoryNames}
                    onSubmit={(data) => updateMenuItem({ id: item.id, data })}
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
                          Czy na pewno chcesz usunąć <strong>{item.name}</strong>? Tej operacji nie
                          można cofnąć.
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
          <TableCaption>
            Łącznie {menuItems?.length} {menuItems?.length === 1 ? 'pozycja' : 'pozycji'} w menu
          </TableCaption>
        </Table>
      )}
    </div>
  );
}
