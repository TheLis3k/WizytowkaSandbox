import { Separator } from '@/components/ui/separator';

export default function PublicFooter() {
  return (
    <footer className="border-t bg-card text-card-foreground">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center gap-4">
        <div className="font-bold text-lg tracking-tight">
          Wizytówka<span className="text-primary">.</span>
        </div>
        <Separator className="max-w-xs" />
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} WizytowkaSandbox. Wykonano w oparciu o shadcn/ui.
        </p>
      </div>
    </footer>
  );
}