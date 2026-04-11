import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Zastąp te importy faktycznymi plikami w miarę ich tworzenia
const PublicLayout = () => <div>Layout Publiczny</div>;
const AuthLayout = () => <div>Layout Autoryzacji</div>;
const AdminLayout = () => <div>Layout Administratora (Chroniony)</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<div>Menu Główne</div>} />
          <Route path="/rezerwacje" element={<div>Rezerwacje</div>} />
          <Route path="/formularz" element={<div>Kontakt</div>} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<div>Logowanie</div>} />
          <Route path="/setup" element={<div>Aktywacja z e-maila</div>} />
          <Route path="/forgot-password" element={<div>Przypomnij hasło</div>} />
          <Route path="/reset-password" element={<div>Zmień hasło</div>} />
          <Route path="/verify-email" element={<div>Weryfikacja e-mail</div>} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="menu" element={<div>Zarządzanie Menu</div>} />
          <Route path="rezerwacje" element={<div>Zarządzanie Rezerwacjami</div>} />
          <Route path="formularz" element={<div>Skrzynka Wiadomości</div>} />
          <Route path="konto" element={<div>Ustawienia Konta</div>} />
          <Route path="users" element={<div>Zarządzanie Użytkownikami (Tylko MASTER_USER)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;