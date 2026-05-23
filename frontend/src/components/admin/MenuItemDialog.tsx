import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { MenuItemRequest, MenuItemResponse } from '@/types/menu';

const schema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana'),
  description: z.string().min(1, 'Opis jest wymagany'),
  price: z.coerce.number({ error: 'Podaj poprawną cenę' }).positive('Cena musi być większa od 0'),
  category: z.string().min(1, 'Kategoria jest wymagana'),
  imageUrl: z.string().url('Podaj poprawny URL').or(z.literal('')).transform(v => v || null),
});

type FormValues = z.input<typeof schema>;

interface MenuItemDialogProps {
  trigger: React.ReactNode;
  item?: MenuItemResponse;
  categories?: string[];
  onSubmit: (data: MenuItemRequest) => Promise<unknown>;
}

export default function MenuItemDialog({ trigger, item, categories, onSubmit }: MenuItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: item
      ? { ...item, imageUrl: item.imageUrl ?? '', price: item.price }
      : { name: '', description: '', price: 0, category: '', imageUrl: '' },
  });

  useEffect(() => {
    reset(
      item
        ? { ...item, imageUrl: item.imageUrl ?? '' }
        : { name: '', description: '', price: 0, category: '', imageUrl: '' }
    );
  }, [item, reset]);

  const hasCategories = categories && categories.length > 0;
  const categoryOptions = hasCategories
    ? item?.category && !categories.includes(item.category)
      ? [...categories, item.category]
      : categories
    : [];

  return (
    <DialogRoot open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? 'Edytuj pozycję' : 'Nowa pozycja'}</DialogTitle>
          <DialogDescription>
            {item ? 'Zmień dane dania i zapisz.' : 'Wypełnij formularz, aby dodać nowe danie do menu.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(async (values) => {
            setIsSubmitting(true);
            try {
              await onSubmit(values as unknown as MenuItemRequest);
              reset();
              setOpen(false);
            } finally {
              setIsSubmitting(false);
            }
          })} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label htmlFor="name">Nazwa</Label>
            <Input id="name" {...register('name')} aria-invalid={!!errors.name} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Opis</Label>
            <Input id="description" {...register('description')} aria-invalid={!!errors.description} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="price">Cena (zł)</Label>
              <Input id="price" type="number" step="0.01" {...register('price')} aria-invalid={!!errors.price} />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="category">Kategoria</Label>
              {hasCategories ? (
                <select
                  id="category"
                  {...register('category')}
                  aria-invalid={!!errors.category}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm outline-none cursor-pointer text-foreground focus-visible:border-ring dark:bg-card [&>option]:dark:bg-card [&>option]:dark:text-foreground"
                >
                  <option value="">Wybierz kategorię...</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              ) : (
                <Input id="category" {...register('category')} aria-invalid={!!errors.category} />
              )}
              {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="imageUrl">URL zdjęcia (opcjonalnie)</Label>
            <Input id="imageUrl" placeholder="https://..." {...register('imageUrl')} aria-invalid={!!errors.imageUrl} />
            {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">Anuluj</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? <><Spinner className="size-4 mr-1.5" />{item ? 'Zapisywanie…' : 'Dodawanie…'}</>
                : item ? 'Zapisz zmiany' : 'Dodaj'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
