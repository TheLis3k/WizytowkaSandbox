import { useState } from 'react';
import { useMenu } from '../../hooks/useMenu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { UtensilsCrossed } from 'lucide-react';

function MenuItemImage({ src, alt }: { src: string | null; alt: string }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(src ? 'loading' : 'error');

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-muted">
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner className="size-6 text-muted-foreground" />
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
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}

export default function MenuPage() {
  const { data: menuItems, isLoading, isError, error } = useMenu();

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden ring-0">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) return <div className="text-center py-20 text-destructive font-semibold">Błąd: {error.message}</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-extrabold tracking-tight text-center mb-12 scroll-m-20">
        Nasze Menu
      </h1>

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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems?.map((item) => (
            <Card key={item.id} className="group overflow-hidden ring-0 hover:shadow-md transition-all duration-300">
              <MenuItemImage src={item.imageUrl} alt={item.name} />
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                <CardTitle className="text-xl font-bold leading-none">{item.name}</CardTitle>
                <span className="text-lg font-bold text-primary whitespace-nowrap">
                  {item.price.toFixed(2)} zł
                </span>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                  {item.description}
                </p>
                <Badge variant="secondary" className="font-medium">
                  {item.category}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
