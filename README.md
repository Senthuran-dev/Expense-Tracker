# Expense Tracker

A full-stack personal finance web application that allows users to track, categorise, budget, and analyse their spending habits with interactive charts, PDF/CSV exports, and secure JWT authentication.

## Technology Stack

### Frontend (Angular SPA)
* **Framework:** Angular 21.2 (Standalone Components)
* **Language:** TypeScript 5.9
* **UI Library:** Angular Material 21.2, Tailwind CSS 3.x
* **Styling:** SCSS, Tailwind CSS
* **Charts:** Chart.js 4.5 + ng2-charts 10.0
* **Testing:** Vitest 4.0

### Backend (Spring Boot REST API)
* **Framework:** Spring Boot 4.1
* **Language:** Java 17
* **Security:** Spring Security 6 (JWT Filter Chain)
* **Data Access:** Spring Data JPA / Hibernate
* **Database Migration:** Flyway
* **API Docs:** SpringDoc OpenAPI (Swagger UI)
* **Exports:** CSV, PDF (OpenPDF)

### Database
* **Database:** PostgreSQL 15 (Supabase)

## Architecture

The application follows a layered enterprise architecture with a decoupled SPA frontend and REST API backend:

```mermaid
flowchart LR
    A[Angular SPA] <-->|JSON over HTTP| B(Spring Boot REST API)
    
    subgraph Spring Boot Layer
      B --> C(Controllers)
      C --> D(Services)
      D --> E(Repositories)
    end
    
    E <-->|JPA / SQL| F[(PostgreSQL)]
```

### Layer Responsibilities
- **Presentation (Angular):** SPA rendering, reactive forms, lazy-loaded feature modules, app shell layout with navbar/sidebar.
- **API Layer (Spring MVC):** HTTP routing, DTO mapping, request validation, response serialisation.
- **Business Logic (Spring @Service):** Expense aggregation, budget vs actual calculation, profile management, password changes, PDF/CSV export.
- **Security (Spring Security):** Stateless JWT authentication, configurable CORS origins, role-based security.
- **Data Access (Spring Data JPA):** Repository pattern, custom JPQL queries, projection interfaces, ORM mapping.

## Key Features

- **JWT Authentication** — Register, login, profile update, password change
- **Expense CRUD** — Create, read, update, delete with filters and server-side pagination
- **CSV/PDF Export** — Export expenses with date range filtering
- **Category Management** — 9 pre-seeded defaults + custom categories with icon/colour
- **Budget Management** — Monthly budgets per category with upsert logic
- **Analytics Dashboard** — Category breakdown (pie), monthly trend (bar), daily trend (line), yearly summary
- **Profile Settings** — Update display name, change password
- **Responsive App Shell** — Navbar + sidebar layout with route guards

## Setup and Run Locally

### 1. Database (Supabase / PostgreSQL)
1. Set up a free-tier project on [Supabase](https://supabase.com).
2. Collect the PostgreSQL connection string (host, port, dbname, user, password).
3. Update `backend/src/main/resources/application.yml` with your connection details.

### 2. Backend (Spring Boot)
1. Ensure you have Java 17+ installed.
2. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
3. Run the application:
   ```bash
   # Windows
   ./mvnw.cmd spring-boot:run
   # macOS/Linux
   ./mvnw spring-boot:run
   ```
4. The API starts at `http://localhost:8080`. Swagger UI available at `http://localhost:8080/swagger-ui.html`.

### 3. Frontend (Angular)
1. Ensure you have Node.js 22+ and npm 9+ installed.
2. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
3. Install dependencies and start the development server:
   ```bash
   npm install
   npm start
   ```
4. Access the application at `http://localhost:4200/`.

## REST API Endpoints

Base URL: `http://localhost:8080/api/v1`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user | ❌ |
| `POST` | `/auth/login` | Login with credentials | ❌ |
| `PUT` | `/auth/me` | Update user profile (name) | ✅ |
| `PUT` | `/auth/change-password` | Change password | ✅ |
| `GET` | `/expenses` | List expenses (paginated, filterable) | ✅ |
| `GET` | `/expenses/{id}` | Get single expense | ✅ |
| `POST` | `/expenses` | Create expense | ✅ |
| `PUT` | `/expenses/{id}` | Update expense | ✅ |
| `DELETE` | `/expenses/{id}` | Delete expense | ✅ |
| `GET` | `/expenses/export/csv` | Export as CSV | ✅ |
| `GET` | `/expenses/export/pdf` | Export as PDF | ✅ |
| `GET` | `/categories` | List all categories | ✅ |
| `POST` | `/categories` | Create custom category | ✅ |
| `PUT` | `/categories/{id}` | Update custom category | ✅ |
| `DELETE` | `/categories/{id}` | Delete custom category | ✅ |
| `GET` | `/budgets?month=&year=` | List budgets for a month | ✅ |
| `POST` | `/budgets` | Create or update budget | ✅ |
| `DELETE` | `/budgets/{id}` | Delete budget | ✅ |
| `GET` | `/budgets/summary?month=&year=` | Budget vs. actual summary | ✅ |
| `GET` | `/analytics/category-breakdown?month=&year=` | Category spending breakdown | ✅ |
| `GET` | `/analytics/monthly-trend?year=` | Monthly spending trend | ✅ |
| `GET` | `/analytics/yearly-summary` | Year-to-date summary | ✅ |

## Project Structure

```text
Expense Tracker/
├── backend/                           # Spring Boot REST API
│   ├── src/main/java/...              # Source code (Controllers, Services, Models, Repositories)
│   ├── src/main/resources/            # Application config (application.yml) & Flyway migrations
│   └── src/test/...                   # Unit & Integration tests
├── frontend/                          # Angular SPA
│   ├── src/app/                       # Angular application code
│   │   ├── core/                      # Singleton services & guards
│   │   ├── features/                  # Lazy-loaded feature modules (Auth, Dashboard, Expenses, etc.)
│   │   └── shared/                    # Reusable components
│   └── tailwind.config.js             # Tailwind styling configuration
├── render.yaml                        # Render deployment configuration
└── .gitignore
```

## Testing Strategy

- **Frontend:** Components and services are tested using **Vitest** and the **Angular Testing Library**. Mocks are utilized extensively to isolate behaviors, such as mocking API responses and browser `localStorage`.
- **Backend:** Testing is handled with **JUnit** and **Spring Boot Test**. Includes context load tests to verify beans and dependencies, and integration tests to validate JPA repositories and REST controllers.
