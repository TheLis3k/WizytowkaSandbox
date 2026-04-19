import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import {
  ContextMenuRoot,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from '@/components/ui/context-menu';

export default function PublicFooter() {
  const navigate = useNavigate();

  return (
    <footer className="border-t bg-card text-card-foreground">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} WizytowkaSandbox
        </span>

        <span className="text-xs font-semibold tracking-tight">
          Wizytówka<span className="text-primary">.</span>
        </span>

        <ContextMenuRoot>
          <ContextMenuTrigger>
            <span className="text-xs text-muted-foreground select-none cursor-default">
              shadcn/ui
            </span>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onSelect={() => navigate('/auth/login')}>
              <LogIn className="w-3.5 h-3.5" />
              Panel administracyjny
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenuRoot>
      </div>
    </footer>
  );
}
