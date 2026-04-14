import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function AdminLayout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuth();
    navigate('/auth/login');
  };

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-800 text-center">
          Wizytówka<span className="text-blue-500">PRO</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <Link 
            to="/admin/menu" 
            className={`block px-4 py-3 rounded-lg transition-colors ${isActive('/admin/menu') ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
          >
            Zarządzanie Menu
          </Link>
          <Link 
            to="/admin/rezerwacje" 
            className={`block px-4 py-3 rounded-lg transition-colors ${isActive('/admin/rezerwacje') ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
          >
            Rezerwacje
          </Link>
          <Link 
            to="/admin/formularz" 
            className={`block px-4 py-3 rounded-lg transition-colors ${isActive('/admin/formularz') ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
          >
            Wiadomości
          </Link>
          <Link 
            to="/admin/konto" 
            className={`block px-4 py-3 rounded-lg transition-colors ${isActive('/admin/konto') ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
          >
            Ustawienia Konta
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout} 
            className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors font-semibold"
          >
            Wyloguj się
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}