import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import MenuPage from './pages/public/MenuPage';
import LoginPage from './pages/auth/LoginPage';
import RequireAuth from './components/auth/RequireAuth';
import AdminMenuManager from './pages/admin/AdminMenuManager';
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />

      <Routes>
        {/* Strefa otwarta */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Navigate to="/menu" replace />} />
          <Route path="menu" element={<MenuPage />} />
        </Route>

        {/* Strefa autoryzacji */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
        </Route>

        {/* Strefa chroniona (Admin) - owinięta w RequireAuth */}
        <Route element={<RequireAuth />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/menu" replace />} />
            <Route path="menu" element={<AdminMenuManager />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;