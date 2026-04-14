import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Wizytówka Sandbox</h2>
          <p className="mt-2 text-sm text-gray-600 italic">Panel Administratora</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}