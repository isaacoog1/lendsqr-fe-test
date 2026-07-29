# Lendsqr Frontend Assessment

A production-quality frontend application built as part of the Lendsqr Frontend Engineer Assessment. The application demonstrates sound software engineering principles including maintainability, scalability, accessibility, and performance.

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | SCSS Modules |
| Routing | React Router |
| Server State | TanStack Query |
| Tables | TanStack Table |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| Icons | Lucide React |
| Testing | Vitest + React Testing Library |

## Project Structure

```
src/
  api/            # Axios instance and HTTP client configuration
  assets/         # Static assets (icons, images, fonts)
  components/     # Reusable UI components
  config/         # App configuration (env, query client)
  constants/      # Query keys, storage keys, app constants
  hooks/          # Custom React hooks
  layouts/        # Page layout components (Auth, App)
  pages/          # Route-level page components
  routes/         # Centralized route definitions
  services/       # API service functions
  styles/         # Global SCSS (reset, variables, mixins, colors)
  test/           # Test setup and utilities
  types/          # Shared TypeScript interfaces
  utils/          # Pure utility functions
```

## Architecture

- **SCSS Modules** for component-scoped styling with shared abstracts (variables, mixins, functions)
- **CSS Custom Properties** for theming (colors defined as CSS variables)
- **TanStack Query** for all server state — no Redux or Zustand
- **Feature isolation** — business logic stays in hooks/services, components stay presentational
- **Centralized API client** with response normalization and error handling

### Data Flow

```
Component → Hook (useUsers) → Service (usersService) → API Client (apiClient)
```

Each layer has one job:

| Layer | Responsibility |
|-------|---------------|
| `api/client.ts` | Axios instance, auth header injection, error normalization |
| `services/*.service.ts` | Typed endpoint functions — one per resource |
| `hooks/use*.ts` | TanStack Query wrappers — caching, loading/error states |
| Components | Render data, delegate mutations to hooks |

### Why This Over a Generic Request Helper

A common alternative is a single `call(body, path, method)` function that handles dispatch, response parsing, and UI feedback in one place. We chose typed service files instead because:

| Concern | Generic helper | Typed services |
|---------|---------------|----------------|
| Type safety | Requires manual casting at every call site | Return types inferred per endpoint |
| Discoverability | Endpoint paths scattered across components | All endpoints visible in one service file |
| UI feedback | Coupled to the data layer (toasts inside HTTP calls) | Separated — React Query lifecycle handles UI |
| Testability | Must mock the generic wrapper everywhere | Mock individual service functions |
| Refactoring | Rename a path → grep the entire codebase | Rename a method → TypeScript catches all callers |

The tradeoff is slightly more boilerplate per endpoint, but in a codebase of this size that cost is negligible compared to the safety and clarity gained.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linter
npm run lint

# Run tests
npm run test

# Build for production
npm run build
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
VITE_API_BASE_URL=https://run.mocky.io/v3
```
