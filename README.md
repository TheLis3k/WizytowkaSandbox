# PROJECT SPECIFICATION AND DOCUMENTATION

## 1. PROJECT OVERVIEW
This document outlines the architecture, directory structure, and technical decisions for a full-stack restaurant/service website. The application is organized as a monorepo, utilizing React for the frontend and Java/Spring Boot for the backend, supported by a PostgreSQL database and containerized via Docker.

## 2. TECHNOLOGY STACK & RECOMMENDATIONS
* **Frontend:** React (Bootstrapped with Vite for performance)
* **Backend:** Java (17 or 21) with Spring Boot 3.x
* **Database:** PostgreSQL
* **Infrastructure:** Docker & Docker Compose

### Hosting Recommendations (Cost-Free Tier)
To achieve a $0/month deployment while supporting a Java backend and PostgreSQL, use the following combination:
* **Frontend:** Vercel or Netlify. Both offer generous, perpetual free tiers for static React applications.
* **Backend:** Render (Free Web Service) or Koyeb. Render supports Dockerized Spring Boot apps. Note: Free instances spin down after inactivity and take ~30 seconds to wake up.
* **Database:** Neon.tech or Supabase. Both offer perpetual free-tier managed PostgreSQL databases that integrate perfectly with Spring Boot.

### Security Implementation
Since users do not log in, but admins do, security needs to be split between public safety and admin authentication:
* **Admin Auth:** Spring Security with JWT (JSON Web Tokens). All `/api/admin/**` endpoints must be restricted.
* **CORS Configuration:** Spring Boot must be configured to only accept requests from your specific frontend domain.
* **Spam Prevention:** Implement Spring Boot rate limiting (e.g., Bucket4j) on the contact form and reservation endpoints to prevent abuse. Consider adding Google reCAPTCHA v3 on the frontend.
* **Input Validation:** Use Spring Boot `spring-boot-starter-validation` (@NotNull, @Email, etc.) to sanitize all incoming data before it hits the database.
* **Secrets Management:** Never hardcode passwords. Pass database URIs and email SMTP credentials to Docker via `.env` files.

---

## 3. MONOREPO DIRECTORY STRUCTURE

```text
/my-website-monorepo
│
├── /frontend                        # React Application
│   ├── /src
│   │   ├── /components              # UI components (Welcome, CTA, Menu)
│   │   ├── /pages                   # Page layouts (Home, AdminDashboard)
│   │   ├── /services                # Axios/Fetch API calls to backend
│   │   └── App.js
│   ├── package.json
│   └── Dockerfile.frontend          
│
├── /backend                         # Spring Boot Application
│   ├── /src/main/java/com/app
│   │   ├── /config                  # CORS, Spring Security, Swagger
│   │   ├── /controllers             # Public and Admin REST API endpoints
│   │   ├── /models                  # JPA Entities (Reservation, Menu, Message)
│   │   ├── /repositories            # Spring Data JPA interfaces
│   │   └── /services                # Business logic, Email confirmation
│   ├── pom.xml / build.gradle
│   └── Dockerfile.backend           
│
├── .gitignore
├── docker-compose.yml               # Local development orchestration
└── README.md                        # Setup instructions
```

---

## 4. FUNCTIONALITY & VIEWS

### Public User View (No Authentication Required)
* **Welcome Page & CTA:** Static or dynamic content introducing the service with a Call-To-Action.
* **Menu View:** Fetches the current menu list from the backend (`GET /api/public/menu`).
* **Contact Form:** Allows users to send messages (`POST /api/public/contact`).
* **Reservation Calendar:**
    1. User selects a date/time and submits details.
    2. Backend saves reservation as `STATUS: PENDING` and generates a unique UUID token.
    3. Backend sends an email (via Spring Boot JavaMailSender + free SMTP like Gmail or SendGrid) containing a confirmation link.
    4. User clicks link -> frontend calls `GET /api/public/reservations/confirm?token=UUID`.
    5. Backend updates reservation to `STATUS: CONFIRMED`.

### Admin View (Authentication Required)
* **Login:** Admin enters credentials to receive a JWT.
* **Menu Management:** CRUD operations to add, edit, or delete menu items (`POST/PUT/DELETE /api/admin/menu`).
* **Reservation Management:** View calendar, approve, manually configure, or cancel user visits (`GET/PUT /api/admin/reservations`).
* **Contact Submissions:** Inbox-style view to read messages submitted via the public contact form (`GET /api/admin/messages`).

---

## 5. DOCKER INTEGRATION (docker-compose.yml)
For local development, your `docker-compose.yml` at the root of the monorepo should define three services:

1.  **db:** Uses the official `postgres:15-alpine` image. Exposes port `5432`.
2.  **backend:** Builds `./backend/Dockerfile.backend`. Exposes port `8080`. Depends on `db`.
3.  **frontend:** Builds `./frontend/Dockerfile.frontend`. Exposes port `3000` (or `5173` for Vite).

To run the entire stack locally, a developer simply runs:
`docker-compose up --build`