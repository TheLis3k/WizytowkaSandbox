import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import MenuPage from './pages/public/MenuPage';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import OnboardingPage from './pages/auth/OnboardingPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import RequireAuth from './components/auth/RequireAuth';
import AdminMenuManager from './pages/admin/AdminMenuManager';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAccountPage from './pages/admin/AdminAccountPage';
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
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="verify-email" element={<VerifyEmailPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/setup" element={<OnboardingPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* Strefa chroniona (Admin) - owinięta w RequireAuth */}
        <Route element={<RequireAuth />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/menu" replace />} />
            <Route path="menu" element={<AdminMenuManager />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="konto" element={<AdminAccountPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;