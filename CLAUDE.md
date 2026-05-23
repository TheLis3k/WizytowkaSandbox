# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack restaurant admin panel monorepo. React (Vite) frontend + Spring Boot 4 backend + PostgreSQL. The public site shows a menu; the admin panel manages menu items and users.

## Commands

### Frontend (`/frontend`)
```bash
npm run dev        # start Vite dev server on http://localhost:5173
npm run build      # type-check + production build
npm run lint       # ESLint
```

### Backend (`/backend/backend`)
```bash
./mvnw spring-boot:run          # run with Maven wrapper
./mvnw clean package            # build JAR
./mvnw test                     # run all tests
./mvnw test -Dtest=ClassName    # run a single test class
```

Backend requires a running PostgreSQL on `localhost:5432` (db: `restaurant_db`, user: `postgres`, pass: `postgres`) and a `.env` file at `backend/backend/.env`. See `.env.example` for required variables.

## Architecture

### Frontend

**State & data fetching:** Zustand for auth state (`src/stores/authStore.ts`), TanStack Query for all server state via custom hooks (`src/hooks/`). Each hook wraps a service and exposes data + mutation functions to pages.

**Auth flow:**
- `authStore` persists tokens to `localStorage` (remember me) or `sessionStorage` (session only), controlled by the `auth-remember-me` localStorage flag.
- `axiosInstance` attaches the Bearer token on every request and handles reactive token refresh on 401 — calls `authService.refreshToken`, retries the original request, or clears auth and redirects on failure.
- `useTokenRefresh` hook (used in `AdminLayout`) proactively refreshes the access token 60 seconds before expiry via a `setTimeout`.
- Role is **not** returned by the backend `AuthResponse` — it is decoded from the JWT `authorities` claim in `authService` (the claim is prefixed `ROLE_`, which is stripped before storage).

**Routing:** `App.tsx` defines three layout zones: public (`/`), auth (`/auth/*`), admin (`/admin/*` behind `RequireAuth`). Email-link routes (`/reset-password`, `/setup`, `/verify-email`) are top-level routes outside `/auth` to match backend-generated URLs.

**UI components:** shadcn/ui components built on `radix-ui` (not `@radix-ui/*`). Components are in `src/components/ui/`. The `Card` base class does **not** include `ring-1` (it was removed to prevent a blue border on dark theme). When adding new shadcn components, check the export name — they sometimes differ from the component name (e.g. `CheckboxInput`, not `Checkbox`).

### Backend

**Package structure:**
- `controller/open/` — unauthenticated endpoints (`/api/public/**`, `/api/auth/**`)
- `controller/admin/` — protected endpoints (`/api/admin/**`)
- `controller/profile/` — authenticated user profile (`/api/profile/**`)
- `service/interfaces/` + `service/*Impl` — interface-first service pattern
- `security/` — JWT filter, `UserPrincipal` wrapper, `SecurityConfig`
- `entity/` — JPA entities; `User`, `VerificationToken`, `RefreshToken`, `MenuItem`
- `enums/` — `Role` (`MASTER_USER`, `SUPER_USER`), `VerificationTokenType`

**Auth mechanics:**
- JWT access token (15 min) with `authorities` claim containing `ROLE_<roleName>`.
- UUID-based refresh tokens stored hashed in DB (`RefreshToken` entity), rotated on each use.
- `VerificationToken` table handles invitation, password reset, and email change flows — tokens are stored hashed (`TokenHasher`), never in plaintext.
- Spring Security roles are prefixed `ROLE_` internally (e.g. `ROLE_MASTER_USER`) but the `Role` enum values are `MASTER_USER` / `SUPER_USER`.

**Email links** generated in `EmailServiceImpl` use `${app.cors.allowed-origins}` as the base URL. Current paths: `/reset-password`, `/setup` (invitation/onboarding), `/verify-email`.

**Java boolean serialization gotcha:** Lombok `@Data` on a `boolean isActive` field generates an `isActive()` getter, which Jackson serializes as `active` (strips `is` prefix). Frontend must use `active`, not `isActive`.

**User invitation logic:** `inviteSuperUser` silently skips if the email already exists and is active. If the user is soft-deleted (`isDeleted=true`), it reactivates the account and re-sends the invitation.
