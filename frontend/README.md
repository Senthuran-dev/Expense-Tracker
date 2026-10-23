# Expense Tracker - Frontend

Angular SPA for the Expense Tracker application, built with Angular 21.2 (standalone components), Tailwind CSS, Angular Material, and Chart.js.

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18+ |
| npm | 9+ |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app opens at `http://localhost:4200/` and will automatically reload on source file changes.

## Project Structure

```
src/
├── main.ts                        # Bootstrap entry point
├── index.html                     # HTML shell
├── styles.scss                    # Global styles
├── environments/
│   ├── environment.ts             # Local API base URL config
│   └── environment.prod.ts        # Production Render API URL
└── app/
    ├── app.ts                     # Root component
    ├── app.routes.ts              # Route definitions
    ├── app.config.ts              # Providers (HTTP, routing, provideCharts)
    ├── core/                      # Singleton services & guards
    │   ├── services/
    │   │   ├── auth.service.ts        # JWT auth, profile, password
    │   │   ├── analytics.service.ts   # Charts & analytics data
    │   │   ├── expense.service.ts     # Expense CRUD & export
    │   │   ├── budget.service.ts      # Budget CRUD & summary
    │   │   └── category.service.ts    # Category CRUD
    │   ├── guards/
    │   │   └── auth.guard.ts          # Route protection
    │   └── interceptors/
    │       └── jwt.interceptor.ts     # Auto token injection
    ├── features/                  # Lazy-loaded feature modules
    │   ├── auth/                  # Login, Register
    │   ├── layout/                # AppShell (navbar + sidebar layout)
    │   ├── dashboard/             # Overview with budget progress
    │   ├── expenses/              # List, Form Dialog, Export Dialog
    │   ├── budgets/               # List, Budget Form Dialog
    │   ├── categories/            # List, Category Form Dialog
    │   ├── analytics/             # Charts Dashboard (pie, bar, line)
    │   └── settings/              # Profile Settings (name, password)
    └── shared/                    # Reusable components
        ├── components/
        │   ├── navbar/
        │   ├── sidebar/
        │   └── confirm-dialog/
        └── pipes/
```

## Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| Angular | 21.2 | SPA framework (standalone components) |
| TypeScript | 5.9 | Type-safe JavaScript |
| Tailwind CSS | 3.x | Utility-first CSS styling |
| Angular Material | 21.2 | Dialogs and UI components |
| Chart.js | 4.5 | Canvas-based charting |
| ng2-charts | 10.0 | Angular wrapper for Chart.js |
| RxJS | 7.8 | Reactive programming |
| Vitest | 4.0 | Unit testing |
| Prettier | 3.8 | Code formatter |

## Available Scripts

| Command | Description |
|---|---|
| `npm start` | Start development server (`ng serve`) |
| `npm run build` | Production build to `dist/` |
| `npm run watch` | Build in watch mode |
| `npm test` | Run unit tests with Vitest |

## Routing

All authenticated routes are wrapped in the `AppShell` layout component (navbar + sidebar):

| Path | Component | Auth |
|---|---|---|
| `/login` | Login | ❌ |
| `/register` | Register | ❌ |
| `/dashboard` | Overview | ✅ |
| `/expenses` | Expense List | ✅ |
| `/analytics` | Charts Dashboard | ✅ |
| `/budgets` | Budget List | ✅ |
| `/categories` | Category List | ✅ |
| `/settings` | Profile Settings | ✅ |

## Environment Configuration

The API base URL is configured per environment:

- **Development (`src/environments/environment.ts`):**
  ```typescript
  export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080/api/v1'
  };
  ```
- **Production (`src/environments/environment.prod.ts`):**
  ```typescript
  export const environment = {
    production: true,
    apiUrl: 'https://expense-tracker-api-ifp8.onrender.com/api/v1'
  };
  ```

Additionally, `.env.example` is provided as a reference template for local configuration.

### Render Backend Wake-up Ping

On application startup (`App.ngOnInit`), the frontend automatically fires a non-blocking background `fetch()` to `/health` on the Render backend to wake up the free-tier service while the user navigates the auth/landing screens.

## Building for Production & Deployment

```bash
npm run build
```

The production build is output directly to `dist/frontend/` (configured in `angular.json` via `outputPath.browser: ""`), optimised for performance. 

The frontend is deployed on **Vercel** with client-side SPA routing rewrites configured in `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Code Scaffolding

```bash
ng generate component component-name
ng generate --help
```

## Additional Resources

- [Angular CLI Reference](https://angular.dev/tools/cli)
- [Angular Material](https://material.angular.io)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Chart.js](https://www.chartjs.org/docs)
