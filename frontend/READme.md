# Wizytówka Sandbox - Frontend ⚛️

Ten katalog zawiera aplikację front-endową dla projektu Wizytówka Sandbox. Została ona zbudowana przy użyciu nowoczesnego ekosystemu React, zapewniając wysoką wydajność, bezpieczeństwo i świetne doświadczenie programistyczne (DX).

Aplikacja składa się z dwóch głównych części:
1. **Widok Publiczny:** Interaktywna wizytówka restauracji/usługi (Menu, Formularz Kontaktowy, Rezerwacje).
2. **Panel Administratora:** Zabezpieczony tokenami JWT panel do zarządzania treścią i personelem.

## 🛠️ Stos Technologiczny

- **Core:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Język:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Komponenty UI:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Komunikacja HTTP:** [Axios](https://axios-http.com/) (z interceptorami do JWT)
- **Zarządzanie Stanem / Cache API:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Formularze i Walidacja:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Routing:** [React Router v6](https://reactrouter.com/)

## 📦 Wymagania

Zanim zaczniesz, upewnij się, że masz zainstalowane na swoim komputerze:
- [Node.js](https://nodejs.org/) (zalecana wersja 18+ lub 20+)
- npm lub yarn
- Działający backend w Dockerze (zobacz instrukcję uruchamiania backendu w głównym pliku docker-compose).

## 🚀 Uruchomienie lokalne (Development)

1. **Zainstaluj zależności:**
   ```bash
   npm install
   ```

2. **Zmienne środowiskowe:**
   Utwórz plik `.env.local` w głównym folderze `frontend` (obok pliku `package.json`) i skonfiguruj adres lokalnego API backendu (działającego przez Dockera):
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```

3. **Uruchom serwer deweloperski (Vite):**
   ```bash
   npm run dev
   ```
   Aplikacja będzie dostępna pod adresem: `http://localhost:5173`

## 📁 Struktura Projektu (Katalog `/src`)

```text
/src
 ├── /assets         # Pliki statyczne (logo, czcionki, obrazki)
 ├── /components     # Globalne komponenty UI (Button, Input, Navbar, Sidebar)
 ├── /contexts       # Konteksty Reacta (np. AuthProvider dla sesji JWT)
 ├── /hooks          # Customowe hooki (np. useAuth, useAxiosPrivate)
 ├── /layouts        # Główne układy stron (PublicLayout, AdminLayout, AuthLayout)
 ├── /pages          # Widoki przypisane do konkretnych ścieżek
 │   ├── /public     # Strony otwarte (Home, Menu)
 │   ├── /admin      # Strony panelu (AdminMenu, AdminUsers)
 │   └── /auth       # Ekrany logowania, resetu hasła i onboardingu
 ├── /services       # Konfiguracja Axiosa i zapytania do API (authService, menuService)
 ├── /types          # Definicje typów TS (DTO odwzorowujące dane z Spring Boot)
 └── /lib            # Funkcje pomocnicze (utils.ts)
```

## 🔒 Autoryzacja i JWT

Komunikacja z zamkniętymi endpointami `/api/admin/**` oraz `/api/profile/**` wymaga uwierzytelnienia.
- Aplikacja przechowuje `accessToken` (krótkożyjący) oraz `refreshToken` (długożyjący).
- Logika odświeżania tokenów jest automatyczna i zaszyta w instancji Axios (`axios-interceptors`). 
- **Role:** Dostęp do zakładki `/admin/users` ma wyłącznie użytkownik z rolą `MASTER_USER`.

## 📜 Skrypty NPM

- `npm run dev` - Uruchamia aplikację w trybie deweloperskim (z HMR).
- `npm run build` - Buduje zoptymalizowaną, produkcyjną wersję aplikacji do folderu `/dist`.
- `npm run lint` - Sprawdza kod pod kątem błędów za pomocą ESLint.
- `npm run preview` - Służy do lokalnego podglądu zbudowanej wersji produkcyjnej.