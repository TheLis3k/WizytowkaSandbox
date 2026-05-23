import { useState, useMemo } from 'react';
import { useMenu } from '../../hooks/useMenu';
import { useCategories } from '../../hooks/useCategories';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DialogRoot, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { UtensilsCrossed, LayoutGrid, List, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MenuItemResponse } from '../../types/menu';

const SORT_OPTIONS = [
  { value: 'default', label: 'Domyślnie' },
  { value: 'name-asc', label: 'Nazwa A–Z' },
  { value: 'name-desc', label: 'Nazwa Z–A' },
  { value: 'price-asc', label: 'Cena: rosnąco' },
  { value: 'price-desc', label: 'Cena: malejąco' },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

function MenuItemImage({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(src ? 'loading' : 'error');

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner className="size-5 text-muted-foreground" />
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">
          Brak zdjęcia
        </div>
      )}
      {src && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </div>
  );
}

function MenuCard({
  item,
  view,
  onClick,
}: {
  item: MenuItemResponse;
  view: 'grid' | 'list';
  onClick: (item: MenuItemResponse) => void;
}) {
  const isList = view === 'list';

  if (isList) {
    return (
      <Card
        onClick={() => onClick(item)}
        className="group flex cursor-pointer flex-row overflow-hidden border-border py-0 gap-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-border/80 hover:shadow-lg"
      >
        <MenuItemImage
          src={item.imageUrl}
          alt={item.name}
          className="w-36 min-w-36 shrink-0 sm:w-44 sm:min-w-44"
        />
        <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1 p-4">
          <span className="min-w-32 flex-1 text-base font-semibold leading-tight">{item.name}</span>
          {item.description && (
            <p className="min-w-40 flex-[2] text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}
          <div className="flex items-center gap-3 ml-auto">
            <span className="w-full rounded-full border border-border bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
              {item.category}
            </span>
            <span className="text-base font-bold text-green-400 whitespace-nowrap">
              {item.price.toFixed(2)} zł
            </span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      onClick={() => onClick(item)}
      className="group cursor-pointer overflow-hidden border-border py-0 gap-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-border/80 hover:shadow-lg"
    >
      <MenuItemImage src={item.imageUrl} alt={item.name} className="aspect-video w-full" />
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="text-base font-semibold leading-tight">{item.name}</span>
          <span className="whitespace-nowrap text-base font-bold text-green-400">
            {item.price.toFixed(2)} zł
          </span>
        </div>
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}
        <span className="w-full rounded-full border border-border bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
          {item.category}
        </span>
      </div>
    </Card>
  );
}

function ItemModal({
  item,
  onClose,
}: {
  item: MenuItemResponse | null;
  onClose: () => void;
}) {
  return (
    <DialogRoot open={!!item} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md overflow-hidden p-0 gap-0">
        {item && (
          <>
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              <MenuItemImage src={item.imageUrl} alt={item.name} className="h-full w-full" />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <DialogTitle className="text-xl font-bold leading-tight">{item.name}</DialogTitle>
                <span className="text-xl font-bold text-green-400 whitespace-nowrap">
                  {item.price.toFixed(2)} zł
                </span>
              </div>
              {item.description && (
                <DialogDescription className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {item.description}
                </DialogDescription>
              )}
              <span className="w-full rounded-full border border-border bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
                {item.category}
              </span>
            </div>
          </>
        )}
      </DialogContent>
    </DialogRoot>
  );
}

function CategorySection({
  category,
  items,
  view,
  onCardClick,
}: {
  category: string;
  items: MenuItemResponse[];
  view: 'grid' | 'list';
  onCardClick: (item: MenuItemResponse) => void;
}) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-lg font-semibold tracking-tight whitespace-nowrap">{category}</h2>
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground bg-muted border border-border rounded-full px-2.5 py-0.5 whitespace-nowrap">
          {items.length}
        </span>
      </div>
      <div
        className={cn(
          'grid gap-4',
          view === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1',
        )}
      >
        {items.map((item) => (
          <MenuCard key={item.id} item={item} view={view} onClick={onCardClick} />
        ))}
      </div>
    </section>
  );
}

export default function MenuPage() {
  const { data: menuItems, isLoading, isError, error } = useMenu();
  const { categories: orderedCategories } = useCategories();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortValue>('default');
  const [activeCat, setActiveCat] = useState('Wszystkie');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<MenuItemResponse | null>(null);

  const categories = useMemo(() => {
    if (!menuItems) return [];
    const itemCats = new Set(menuItems.map((i) => i.category));
    // Use backend order, then append any categories from items not yet in the list
    const ordered = orderedCategories.map((c) => c.name).filter((n) => itemCats.has(n));
    const extra = [...itemCats].filter((n) => !ordered.includes(n));
    return ['Wszystkie', ...ordered, ...extra];
  }, [menuItems, orderedCategories]);

  const filtered = useMemo(() => {
    if (!menuItems) return [];
    let items = menuItems.filter((item) => {
      const matchCat = activeCat === 'Wszystkie' || item.category === activeCat;
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    if (sort === 'name-asc') items = [...items].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
    else if (sort === 'name-desc')
      items = [...items].sort((a, b) => b.name.localeCompare(a.name, 'pl'));
    else if (sort === 'price-asc') items = [...items].sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') items = [...items].sort((a, b) => b.price - a.price);

    return items;
  }, [menuItems, search, sort, activeCat]);

  const grouped = useMemo(() => {
    if (activeCat !== 'Wszystkie' || sort !== 'default') {
      const label = activeCat === 'Wszystkie' ? null : activeCat;
      return label ? [{ cat: label, items: filtered }] : null;
    }
    // Use backend-ordered categories, then append any unmanaged ones
    const itemCats = new Set(menuItems?.map((i) => i.category) ?? []);
    const ordered = orderedCategories.map((c) => c.name).filter((n) => itemCats.has(n));
    const extra = [...itemCats].filter((n) => !ordered.includes(n));
    const cats = [...ordered, ...extra];
    const sections = cats
      .map((cat) => ({ cat, items: filtered.filter((i) => i.category === cat) }))
      .filter((g) => g.items.length > 0);
    return sections.length > 0 ? sections : null;
  }, [filtered, activeCat, sort, menuItems, orderedCategories]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Skeleton className="h-10 w-48 mx-auto mb-3" />
        <Skeleton className="h-4 w-64 mx-auto mb-10" />
        <div className="flex gap-3 mb-6">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-20 ml-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError)
    return (
      <div className="text-center py-20 text-destructive font-semibold">
        Błąd: {error.message}
      </div>
    );

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight scroll-m-20 mb-2">Nasze Menu</h1>
        <p className="text-muted-foreground text-sm">Odkryj smaki, które pokochasz</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center mb-5">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8"
            placeholder="Szukaj dania..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortValue)}
          className="h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-sm outline-none cursor-pointer text-foreground focus-visible:border-ring dark:bg-card [&>option]:dark:bg-card [&>option]:dark:text-foreground"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="flex border border-input rounded-md overflow-hidden ml-auto">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setView('grid')}
            className={cn(
              'rounded-none border-0',
              view === 'grid' && 'bg-muted text-foreground',
            )}
            aria-label="Widok siatki"
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setView('list')}
            className={cn(
              'rounded-none border-0',
              view === 'list' && 'bg-muted text-foreground',
            )}
            aria-label="Widok listy"
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap',
                activeCat === cat
                  ? 'bg-green-400/10 border-green-400 text-green-400'
                  : 'border-border text-muted-foreground hover:border-border/80 hover:text-foreground',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {menuItems?.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UtensilsCrossed />
            </EmptyMedia>
            <EmptyTitle>Brak pozycji w menu</EmptyTitle>
            <EmptyDescription>Menu jest aktualnie puste. Zajrzyj później.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyTitle>Brak wyników</EmptyTitle>
            <EmptyDescription>Nie znaleziono dań pasujących do wyszukiwania.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : grouped ? (
        grouped.map(({ cat, items }) => (
          <CategorySection
            key={cat}
            category={cat}
            items={items}
            view={view}
            onCardClick={setSelectedItem}
          />
        ))
      ) : (
        <div
          className={cn(
            'grid gap-4',
            view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1',
          )}
        >
          {filtered.map((item) => (
            <MenuCard key={item.id} item={item} view={view} onClick={setSelectedItem} />
          ))}
        </div>
      )}

      <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
