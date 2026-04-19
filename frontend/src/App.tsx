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
import AdminTablesPage from './pages/admin/AdminTablesPage';
import AdminReservationsPage from './pages/admin/AdminReservationsPage';
import ReservationPage from './pages/public/ReservationPage';
import ReservationConfirmPage from './pages/public/ReservationConfirmPage';
import ReservationCancelPage from './pages/public/ReservationCancelPage';
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
          <Route path="rezerwacja" element={<ReservationPage />} />
        </Route>

        {/* Email token landing pages */}
        <Route path="/confirm-reservation" element={<ReservationConfirmPage />} />
        <Route path="/cancel-reservation" element={<ReservationCancelPage />} />

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
            <Route path="stoliki" element={<AdminTablesPage />} />
            <Route path="rezerwacje" element={<AdminReservationsPage />} />
            <Route path="konto" element={<AdminAccountPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;