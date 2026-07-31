# Lendsqr Frontend Assessment

An admin console for browsing 500 user records, built for the Lendsqr Frontend
Engineer assessment. Four screens: Login, Dashboard, Users, and User details.

## Running it

```bash
npm install
npm run dev
```

Sign in with the demo account. It is also printed under the login button, so
you do not have to come back here for it:

```
admin@lendsqr.com
Password123!
```

There is no auth backend. The service accepts that one pair and rejects
everything else, which is what makes the 401 branch reachable — an error state
you cannot trigger is an error state nobody has tested.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check then build |
| `npm run test` | Run the suite once |
| `npm run test:watch` | Watch mode |
| `npm run test:coverage` | Suite plus a coverage report |
| `npm run lint` | ESLint |
| `npm run format` / `format:check` | Prettier |
| `npm run generate:users` | Regenerate the mock dataset |

The four commands that gate a commit are `lint`, `format:check`, `test` and
`build`. All four pass with zero warnings.

## Stack

React 19 with TypeScript and SCSS were required. The rest:

| Choice | Why |
|---|---|
| Vite | Fast dev server, and the build output is easy to inspect |
| React Router | Standard for an SPA with protected routes |
| TanStack Query | Owns server state so no global store is needed |
| TanStack Table | Sorting and pagination without hand-rolling a table |
| React Hook Form + Zod | Schema-driven validation, one source of truth per form |
| Axios | Interceptors for the auth header and error normalization |
| Lucide | One icon set, tree-shakes cleanly |
| Vitest + Testing Library | Shares Vite's config; queries by role rather than class |

No Redux, no Zustand, no component library. Server state lives in React Query
and UI state lives in the component that owns it, which between them covered
everything here.

Dates are formatted with `Intl.DateTimeFormat` rather than a date library. A
library would cost roughly 70 kB for a single `formatDate` call, and `Intl`
produces identical output for the format the design uses.

## Layout of the code

```
scripts/           Build-time dataset generator (Node, not shipped)
public/api/        The generated dataset, served as a static endpoint
src/
  api/             Axios instance, auth header, error normalization
  components/
    ui/            Presentational primitives — Button, Input, Table bits
    features/      Tied to the domain — UsersTable, UserFilters, StatCard
    layout/        Header and Sidebar
  config/          Env, query client, sidebar and stat-card config
  constants/       Query keys, storage keys, demo credentials
  contexts/        Auth provider and hook
  hooks/           React Query wrappers
  layouts/         AuthLayout and AppLayout
  pages/           One folder per route
  routes/          Route table and the two guards
  services/        Typed endpoint functions
  styles/          Reset, typography, variables, mixins, colours
  test/            Factories and the shared render helper
  types/           Shared interfaces
  utils/           Pure helpers
```

## Data flow

```
Component → useUsers() → usersService.getAll() → apiClient → GET /api/users.json
```

Each layer does one thing. The client owns transport concerns, services own
endpoints and their types, hooks own caching and request state, and components
render. No component imports Axios and no component touches `localStorage`
directly.

### Why typed services instead of one generic request helper

A common alternative is a single `call(path, method, body)` used everywhere.
Typed service functions won here for a few reasons. Return types are inferred
per endpoint instead of cast at every call site. Every endpoint the app uses is
visible in one file rather than scattered through components. Mocking one
service function in a test is easier than mocking a wrapper that everything
depends on. And renaming a method makes TypeScript point at every caller, where
renaming a path string means grepping and hoping.

The cost is a few more lines per endpoint. At this size that is not a real
cost.

## The mock API

`npm run generate:users` runs a seeded Faker script that writes 500 records to
`public/api/users.json`, and the app fetches that over HTTP through the Axios
client. The seed is fixed, so regenerating produces an identical file and the
dataset only shows up in a diff when the shape or the seed changes.

Generating at build time rather than in the browser matters for two reasons.
Faker is a data-generation library and has no business in a client bundle, so
it stays a devDependency and never ships. And generating in-process means there
is no request at all — the interceptors never run and the failure states have
nothing to respond to.

Two environment variables point the app at whichever host is serving the file:

```
VITE_API_BASE_URL=/api          # combined as ${BASE}${PATH}
VITE_USERS_PATH=/users.json
```

The defaults hit the committed dataset on the app's own origin, so a fresh
clone runs with no `.env` and no network. Set them in `.env.production` to move
to an external mock host — a config change, not a code change.

`getById` resolves against the collection rather than issuing
`GET /users/:id`, because a static file host serves one URL. React Query dedupes
it against the list query, so opening a user from the table costs no extra
request. Against a backend with per-resource routes it is a one-line change.

## Handling 500 records

Pagination, 20 rows per page, with a page-size selector. No virtualization.

At 500 records pagination already caps the DOM at 20 rows, and everything —
sorting, filtering, search — stays instant. Virtualization would buy nothing
measurable and cost a fair amount: measured row heights, scroll restoration,
and a table that no longer works with browser find-in-page or keyboard tabbing.
The point where it starts paying for itself is thousands of rows rendered at
once, which is not this.

Filtering and search run over the full array before the table paginates, so
they apply across all 500 rows and not just the visible page. The derived
lists are memoized on the inputs that produce them.

## States

The design shows the happy path. The other three were designed here.

**Loading.** Skeletons shaped like the content they replace, not a centred
spinner. Skeletons are `aria-hidden`, so each group sits inside a labelled live
region — otherwise the page announces nothing at all and simply appears empty
until data lands.

**Empty.** Three different situations get three different messages. The
endpoint returning nothing is not the same as a filter excluding everyone,
which is not the same as a request failing. Only the middle one offers to clear
filters, because that is the only one where clearing them helps.

**Error.** A failed list offers Retry, which refetches. On the details page a
404 and a network failure are told apart: a missing record offers a way back to
the list, an unreachable server offers Retry. Reporting both as "user not
found" tells people not to retry at the exact moment retrying would work.

An error boundary wraps the router as a last line of defence. Without one, any
render-time throw unmounts the whole tree and leaves a blank page — not
theoretical here, since the details page reads a user object straight out of
`localStorage` and a stale record is valid JSON of the wrong shape.

## Routing

| Path | Screen | Auth |
|---|---|---|
| `/login` | Login | Guests only |
| `/dashboard` | Dashboard | Required |
| `/users` | Users list | Required |
| `/users/:id` | User details | Required |
| anything else, signed in | Coming soon, inside the shell | Required |
| anything else, signed out | 404 | — |

The sidebar renders 22 navigation links and exactly two resolve to a real route.
The other 20 render a placeholder **inside** the app layout, so the header and
sidebar survive. Registered outside it, one click on the most prominent
component in the app would strip the shell and leave no navigation to get back
with.

Routes are lazy-loaded, so landing on `/login` does not pull down the users
table, TanStack Table, the filter forms and all six detail sections first.

`vercel.json` rewrites everything to `index.html`. Without it a refresh on
`/users/:id` returns a host 404 before React Router ever boots.

## Search and filtering

Search lives in the header, where the design puts it, and submits to
`/users?q=…`. Putting it in the URL means a filtered list can be linked to and
survives a refresh, which local component state could not do.

The column filter panel opens from the funnel icon in a column header, matching
the design. It is rendered as a sibling of the table's scroll container rather
than inside the `<th>`, because the table scrolls horizontally and an
absolutely positioned panel inside `overflow-x: auto` gets clipped.

The date filter compares calendar days in local time. Formatting the stored
timestamp as UTC shifted the day for anyone east of Greenwich who signed up
late in the evening.

## Dashboard

The Figma frame labelled "Dashboard" is the Users screen, so the brief leaves
the actual overview undefined — one of the gaps it says it is watching for.
Rather than ship two near-identical pages, `/dashboard` shows a status
breakdown, the top organizations by user count, and the five most recent
sign-ups.

Every figure is counted from the same 500 records the table renders, so the two
views cannot disagree. The bars are CSS widths; a charting library is not worth
it for two lists of five rows.

## Persistence

Opening a user from the table or the dashboard writes that record to
`localStorage` first. The details page reads it and renders immediately, and
only fetches when the cached id does not match the URL. That is what makes a
refresh on `/users/:id` instant.

All of it goes through helpers in `src/utils/storage.ts`, which swallow both
malformed JSON and a full quota. Logging out clears the token, the cached user,
and the React Query cache — without the last one, signing in again inside the
10-minute `gcTime` was served the previous session's data.

## Accessibility

Semantic elements first, ARIA only where the platform has no equivalent.

Every row in the users table is reachable by keyboard, because the username
cell is a real link rather than a click handler on a `<tr>`. Row action buttons
are named after their user instead of announcing "button, collapsed" twenty
times a page. Column headers carry `scope` and `aria-sort`.

The tabs implement the full ARIA pattern — a single tab stop, arrow keys, Home
and End, and a panel that references its tab. Declaring `role="tab"` without
that is worse than plain buttons, because a screen reader promises "tab, 1 of
6" and then the arrow keys do nothing. The row menu moves focus into itself on
open and returns focus to its trigger on close.

The login fields keep their labels for assistive technology while hiding them
visually, since the design is placeholder-only and placeholders disappear the
moment someone types.

`prefers-reduced-motion` disables animation globally.

## Responsive

| Width | Behaviour |
|---|---|
| ≤ 480px | Single column, search moves to its own row under the logo |
| ≤ 768px | Sidebar becomes a drawer, panels stack |
| ≤ 1024px | Stat cards drop to two columns |
| above | Full layout, sidebar fixed |

All three are `max-width` queries through one `respond-to` mixin, so the
breakpoints live in one place. Tables scroll horizontally inside their card
rather than squeezing columns to nothing.

## Testing

175 tests across 24 files. Roughly 91% of statements and 87% of branches.

The suite mocks the service layer, which is the seam that makes failure paths
testable at all. Without it there is no way to make a request fail, so there is
no test that the error state renders or that Retry actually refetches — and
those are exactly the cases the brief asks for.

Tests query by role and accessible name. That keeps them readable and means
they fail when the accessibility of a component regresses, not just when its
markup changes.

A shared factory builds `User` fixtures so a change to the type touches one
file instead of three.

## Bundle

Initial JavaScript is **209 kB**, or **66 kB gzipped**, with each route loading
its own chunk on demand.

Three choices keep it there: data generation happens at build time so Faker
never reaches the browser, routes are code-split, and dates are formatted with
`Intl` rather than a date library.

## Things left undone

The row actions — blacklist, activate, deactivate — do not mutate anything.
There is no backend to mutate against, and faking it with optimistic updates
would have been theatre.

Two of the six detail tabs, Documents and App and System, are permanently
empty. That is deliberate: they demonstrate the empty state on a screen where
it would otherwise never appear.

The header's notification bell and the "Docs" link are decorative, as they are
in the design.
