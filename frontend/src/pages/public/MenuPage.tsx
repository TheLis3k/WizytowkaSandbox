import { useMenu } from '../../hooks/useMenu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function MenuPage() {
  const { data: menuItems, isLoading, isError, error } = useMenu();

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden border-none shadow-sm">
              <Skeleton className="h-48 w-full" />
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {menuItems?.map((item) => (
          <Card key={item.id} className="group overflow-hidden border-none bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <div className="aspect-video relative overflow-hidden bg-muted">
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground uppercase text-xs tracking-widest">
                  Brak zdjęcia
                </div>
              )}
            </div>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold leading-none">{item.name}</CardTitle>
              <span className="text-lg font-bold text-primary whitespace-nowrap ml-2">
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
    </div>
  );
}