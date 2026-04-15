import { Outlet } from 'react-router-dom';
import DarkModeToggle from '@/components/layout/DarkModeToggle';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-xl shadow-lg border">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-foreground">Wizytówka Sandbox</h2>
            <p className="mt-2 text-sm text-muted-foreground italic">Panel Administratora</p>
          </div>
          <DarkModeToggle />
        </div>
        <Outlet />
      </div>
    </div>
  );
}