import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LayoutDashboard, Utensils, Calendar, MessageSquare, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import DarkModeToggle from '@/components/layout/DarkModeToggle';

export default function AdminLayout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuth();
    navigate('/auth/login');
  };

  const menuItems = [
    { name: 'Menu', path: '/admin/menu', icon: Utensils },
    { name: 'Rezerwacje', path: '/admin/rezerwacje', icon: Calendar },
    { name: 'Wiadomości', path: '/admin/formularz', icon: MessageSquare },
    { name: 'Ustawienia', path: '/admin/konto', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6">
          <Link to="/admin" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <span>Panel Admina</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname.includes(item.path) ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                location.pathname.includes(item.path) && "font-semibold"
              )}
              asChild
            >
              <Link to={item.path}>
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <Separator className="mb-4" />
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-sm text-muted-foreground">Motyw</span>
            <DarkModeToggle />
          </div>
          <Button
            variant="ghost" 
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Wyloguj się
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}