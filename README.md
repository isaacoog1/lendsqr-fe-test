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

## Design System

Reusable UI components live in `src/components/ui/`. Each component is self-contained with its own SCSS module and barrel export.

| Component | Purpose |
|-----------|---------|
| Button | Primary, secondary, outline, danger variants with loading state |
| Input | Text/password with label, error, and password toggle |
| Select | Native select with custom styling and error state |
| Card | Content container with padding variants |
| Badge | Status indicators (active, inactive, pending, blacklisted) |
| Avatar | User image with initials fallback |
| Spinner | Loading indicator in three sizes |
| Skeleton | Content placeholder with shimmer animation |
| EmptyState | Zero-data messaging with optional action |
| ErrorState | Error messaging with retry action slot |
| Pagination | Page navigation with size selector |
| Dropdown | Context menu triggered by any element |
| Tabs | Horizontal tab bar with underline indicator |

### SCSS Strategy

- **Global**: Reset, typography, CSS custom properties (colors), variables, mixins
- **Component**: SCSS Modules colocated with each component
- **Theming**: Colors defined as CSS custom properties for easy overriding
- **Abstracts**: Shared `$variables` and `@mixins` imported per module via `@use`

## Application Shell

### Layouts

| Layout | Used For |
|--------|----------|
| `AuthLayout` | Login page — split-screen with illustration left, form right |
| `AppLayout` | All authenticated pages — header + sidebar + main content |

### Routing

Routes are centralized in `src/routes/index.tsx`.

| Path | Page | Protected |
|------|------|-----------|
| `/login` | Login | No |
| `/dashboard` | Dashboard | Yes |
| `/users` | Users list | Yes |
| `/users/:id` | User details | Yes |
| `*` | 404 | No |

`/` redirects to `/dashboard`. Unauthenticated users accessing protected routes are redirected to `/login`.

### Sidebar

Sidebar navigation is config-driven (`src/config/sidebar.ts`). Groups: Customers, Businesses, Settings. Items rendered dynamically with Lucide icons. Active route indicated via left border highlight. Collapses to a drawer on tablet/mobile with overlay.

## API & Data Layer

### Request Flow

```
Component → useUsers() hook → usersService.getAll() → Mock DB (500 Faker-generated users)
```

### Mock API

Instead of an external mock API, the data layer uses a seeded Faker.js generator (`src/mocks/generateUsers.ts`) that produces 500 deterministic user records. Services simulate network latency with configurable delays. This approach is self-contained (no external dependencies), reproducible (seeded), and easily swappable for a real API later.

### Services

| Service | Methods |
|---------|---------|
| `users.service.ts` | `getAll()`, `getById(id)` |
| `auth.service.ts` | `login({ email, password })` |

### React Query Hooks

| Hook | Purpose |
|------|---------|
| `useUsers()` | Fetches all users with caching |
| `useUser(id)` | Fetches single user by ID |
| `useLogin()` | Mutation for authentication |

### Local Storage

Helpers in `src/utils/storage.ts`:

- `saveSelectedUser(user)` — persists selected user for detail view
- `getSelectedUser()` — retrieves persisted user
- `clearSelectedUser()` — removes on logout/navigation

No component calls `localStorage` directly.

## Authentication

### Flow

1. User submits email/password on login form
2. `useLogin()` mutation calls `authService.login()` (simulates 1s delay)
3. On success, `AuthContext.login(token)` stores token and sets `isAuthenticated = true`
4. User is redirected to `/dashboard`

### Route Protection

- `ProtectedRoute` — reads `isAuthenticated` from AuthContext; redirects to `/login` if false
- `GuestRoute` — prevents authenticated users from accessing `/login`; redirects to `/dashboard`

### Session Persistence

Token stored in localStorage survives page refresh. `AuthProvider` initializes state by checking for existing token.

### Logout

Removes auth token and selected user from localStorage, resets `isAuthenticated` to false, redirects to login.

### Validation

Login form uses React Hook Form + Zod:
- Email: must be valid email format
- Password: required (non-empty)
- Submit disabled while loading
- Inline error messages per field
- Server error displayed above form

## Dashboard

### Statistics Cards

Four stat cards rendered from a config array (`dashboardStats.ts`). Each card computes its value from the users array — no hardcoded numbers. Cards are responsive (4-column grid → 2-column on tablet → 1-column on mobile).

### Users Table

Built with TanStack Table. Features:

- **Columns**: Organization, Username, Email, Phone, Date Joined, Status, Actions
- **Pagination**: 20 rows per page, page size selector (10/20/50/100)
- **Sorting**: Click any column header to sort
- **Status badges**: Color-coded (Active, Inactive, Pending, Blacklisted)
- **Actions menu**: Dropdown with View Details, Blacklist User, Activate User
- **Responsive**: Horizontal scroll on narrow viewports

### Loading State

Skeleton cards and skeleton rows (not plain text spinners).

### Error State

Full-page error with retry button that calls `refetch()`.

### Pagination Decision

20 items per page. No virtualization — with 500 records, pagination already limits rendered DOM to a manageable size. If asked: virtualization adds complexity (intersection observers, dynamic row heights) that isn't justified at this scale.

## Users Module

### Search

Client-side search against name, username, email, and phone number. Input is debounced by 300ms (`useDebounce` hook) to avoid re-filtering on every keystroke.

### Filtering

Filter panel with fields matching Figma: Organization, Username, Email, Phone, Date Joined, Status. Managed by React Hook Form + Zod. Filters are composable — multiple active filters narrow results together. Reset clears all fields and restores the full dataset.

### Performance

- `organizations` list — memoized (`useMemo`) since it's derived from all 500 users
- `filteredUsers` — memoized, recomputes only when users/filters/search change
- `stats` — memoized, avoids recalculating totals on every render

### Empty States

Three distinct scenarios handled:
1. API returns zero users — "No users to display"
2. Search/filter yields zero results — "No results found" + "Clear Filters" action
3. API error — Error message + Retry button

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
