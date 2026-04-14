import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PublicNavbar() {
  const location = useLocation();

  const navLinks = [
    { name: 'Menu', path: '/menu' },
    { name: 'Rezerwacje', path: '/rezerwacje' },
    { name: 'Kontakt', path: '/formularz' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold tracking-tighter">
          Wizytówka<span className="text-primary">.</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Button
              key={link.path}
              variant={location.pathname === link.path ? "secondary" : "ghost"}
              asChild
            >
              <Link to={link.path}>{link.name}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}