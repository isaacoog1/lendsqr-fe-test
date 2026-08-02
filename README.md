# Lendsqr Frontend Assessment

An admin console for browsing 500 user records, built for the Lendsqr Frontend
Engineer assessment. Four screens: Login, Dashboard, Users, and User details.

**Live:** <https://oguntuyo-oluwakorede-isaac-lendsqr-fe-test.vercel.app> — sign
in with `admin@lendsqr.com` / `Password123!`, also printed under the login
button.

## Running it

```bash
npm install
npm run dev
```

No `.env` file is needed. The app points at a deployed API by default — see
[The API](#the-api) to serve it from somewhere else.

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

The four commands that gate a commit are `lint`, `format:check`, `test` and
`build`. All four pass with zero warnings.

## Stack

React 19 with TypeScript and SCSS were required. The rest:

| Choice | Why |
|---|---|
| Vite | Fast dev server, and the build output is easy to inspect |
| React Router | Standard for an SPA with protected routes |
| TanStack Query | Owns server state so no global store is needed |
| TanStack Table | Column model, sort state and header rendering without hand-rolling a table |
| React Hook Form + Zod | Schema-driven validation, one source of truth per form |
| Axios | One configured instance; an interceptor normalizes every error |
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
src/
  api/             Axios instance and error normalization
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
  routes/          Router, route table, the two guards, the error boundary
  services/        Typed endpoint functions
  styles/          Reset, typography, variables, mixins, colours
  test/            Factories and the shared render helper
  types/           Shared interfaces
  utils/           Pure helpers
```

## Data flow

```
Component → useUsers(query) → usersService.list(query) → apiClient → GET /users?…
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

## The API

500 user records live behind three endpoints, deployed separately and served
over CORS:

| Endpoint | Returns |
|---|---|
| `GET /users` | One page of summaries plus `pagination` metadata |
| `GET /users/:id` | The full record — personal details, guarantor, bank, tier |
| `GET /users/stats` | Platform totals, status and organization breakdowns, the list of organizations |

Every response arrives in the same envelope, which the service layer unwraps:

```json
{ "data": …, "message": "Users retrieved successfully", "status": 200 }
```

The list endpoint accepts `page`, `perPage`, `sortBy`, `sortOrder`, a `search`
term spanning four fields, and the six column filters. Sorting, filtering and
paging therefore all happen server-side.

**Two contracts, not one.** The list returns a `UserSummary` — the id and the
six visible columns — and only `GET /users/:id` returns the whole record.
`UserSummary` is declared as `Pick<User, …>` so the two cannot drift.

Two environment variables locate the API, and neither is required — the
defaults in `src/config/env.ts` point at the deployment, so a fresh clone runs
with no `.env` file:

```
VITE_API_BASE_URL=https://www.checkmeout.me/api/lendsqr
VITE_USERS_PATH=/users
```

The `www` is deliberate. The apex domain answers with a 307 redirect, and a
browser treats a redirected CORS preflight as a network error instead of
following it — one of several failures that look identical to a lost
connection and are not one, which is why the client
[sorts them apart](#network-error-is-not-no-internet).

**No `Authorization` header.** There is no auth backend, so the stored token is
a local marker that authenticates nothing, and these endpoints are public and
read-only. Sending it would also break every request: `Authorization` is not
CORS-safelisted, so it forces a preflight, and the API replies
`Access-Control-Allow-Headers: Content-Type`. A credential that proves nothing
is not worth failing every request for.

Bad input gets a 400 naming the parameter — *"status must be one of: active,
inactive, pending, blacklisted"* — and the response interceptor already reads
`error.response.data.message`, so those reach the error state verbatim.

## Handling 500 records

Pagination, 20 rows per page, with a page-size selector. No virtualization.

The server sends one page at a time, so the browser never holds more than 20
records and the DOM never holds more than 20 rows. Virtualization solves a
problem that only appears when thousands of rows are rendered at once; here it
would cost measured row heights, scroll restoration, and a table that no longer
works with find-in-page or keyboard tabbing, in exchange for nothing.

Because filtering and sorting run in the database rather than over a loaded
array, they apply across all 500 records rather than the visible page — and the
payload stays the same size no matter how many records exist.

`placeholderData: keepPreviousData` keeps the current page on screen while the
next one loads. Without it every page change unmounts the table back to the
skeleton, which reads as the whole screen reloading rather than a row swap.

## States

The design shows the happy path. The other three were designed here.

**Loading.** Skeletons shaped like the content they replace, not a centred
spinner. Skeletons are `aria-hidden`, so each group sits inside a labelled live
region, otherwise the page announces nothing at all and simply appears empty
until data lands.

**Empty.** Three different situations get three different messages. The
endpoint returning nothing is not the same as a filter excluding everyone,
which is not the same as a request failing. Only the middle one offers to clear
filters, because that is the only one where clearing them helps. The three are
told apart by `pagination.total` and whether any filter is applied, not by
counting rendered rows.

**Error.** A failed list offers Retry, which refetches. On the details page a
404 and a network failure are told apart: a missing record offers a way back to
the list, an unreachable server offers Retry. Reporting both as "user not
found" tells people not to retry at the exact moment retrying would work.

The Users and Dashboard pages each depend on two endpoints. Both are covered by
one loading state and one error state rather than four combinations of partial
UI — a page that renders its stat cards beside an error where the table should
be is claiming more than it knows. Retry refetches both.

### "Network Error" is not "no internet"

Axios raises the same `Network Error` for every failure that stopped a request
before a response came back: the machine being offline, DNS not resolving, the
API being down, a TLS or CORS rejection, an extension or corporate proxy
blocking the call. Only the first of those is the user's connection, so
_"please check your internet connection"_ is wrong most of the time — and it
sends someone to reboot a router that was working fine. The 307 on the apex
domain [described above](#the-api) is exactly this: a server-side redirect the
browser reports as a network failure.

`src/api/errors.ts` therefore sorts a rejection into four outcomes before the
UI sees it:

| Failure | Message says |
| --- | --- |
| `navigator.onLine === false` | you're offline, check your connection |
| No response, but the browser has a network | we couldn't reach the server, it may be temporarily unavailable |
| `ECONNABORTED` / `ETIMEDOUT` | the server took too long to respond |
| The server answered | whatever the API said, carrying its status |

`navigator.onLine` is read in one direction only. False is trustworthy — the
browser knows it has no usable interface, so nothing could have left the
machine. True is not: a captive portal, a dead API and a rejected preflight all
report true. It can confirm the connection is at fault; it can never confirm
that it isn't.

Pages render the message the normalizer produced rather than a fixed sentence
of their own, so a 400 naming a bad parameter, a dead API and an unplugged
cable each read as themselves.

React Query is set to `networkMode: 'always'` for the same reason. Its default
pauses queries whenever the browser reports being offline, which leaves a page
with no data, no error, and a Retry button that silently does nothing. Letting
the request run always produces a failure the UI can name — and the attempt is
a better test of connectivity than the flag. `refetchOnReconnect` is kept on,
which that mode otherwise disables, so a page that failed while offline
recovers on its own once the network returns.

**Crash.** The root route carries an `errorElement` as a last line of defence.
Without one, any render-time throw unmounts the whole tree and leaves a blank
page, not theoretical here, since the details page reads a record straight out
of `localStorage` and a stale entry is valid JSON of the wrong shape. The data
router owns the boundary itself, so the recovery screen is an ordinary function
component that reads what was caught with `useRouteError` — no class component
anywhere in the codebase.

## Routing

| Path | Screen | Auth |
|---|---|---|
| `/login` | Login | Guests only |
| `/dashboard` | Dashboard | Required |
| `/users` | Users list | Required |
| `/users/:id` | User details | Required |
| the other 20 sidebar links | Coming soon, inside the shell | Required |
| anything else | 404 | — |

The route table is plain data rather than JSX nested in a component, and three
things fall out of that. The app hands the exported array to
`createBrowserRouter` and the tests hand the same array to
`createMemoryRouter`, so what the tests exercise is the tree that ships. Render
errors get an `errorElement`, which is a route-level concern, rather than a
class boundary bolted on above the router. And loaders, actions and deferred
data are available whenever a real backend makes them worth having.

A data router leaves no room for providers between the router and the routes,
so the auth provider and the Suspense boundary live in a root route
(`RootLayout`) that every screen renders under. That also puts them inside the
error boundary, so a throw while reading the stored token is caught rather than
blanking the page.

The sidebar renders 22 navigation links and exactly two resolve to a real
screen. The other 20 get a route each, generated from the same sidebar config,
rendering a placeholder **inside** the app layout so the header and sidebar
survive. Registered outside it, one click would strip the shell and leave no
navigation to get back with.

Naming those 20 rather than catching them with one splat is what keeps the 404
reachable. A splat under the protected layout would match every unknown URL,
leaving the 404 route below it as dead config and answering a mistyped address
with a placeholder that promises a feature nobody is building. "Not built yet"
and "no such page" are different answers, so they get different routes.

Routes are lazy-loaded, so landing on `/login` does not pull down the users
table, TanStack Table, the filter forms and all six detail sections first.

`vercel.json` rewrites everything to `index.html`. Without it a refresh on
`/users/:id` returns a host 404 before React Router ever boots.

## Search and filtering

The URL is the single source of truth for what the table shows — page, size,
sort column, direction, the search term and all six filters. A narrowed view
can be linked to and survives a refresh, and the table stays a controlled
presentation component with no query state of its own.

Search lives in the header, where the design puts it, and submits to
`/users?q=…`; the API calls the same thing `search`, and the two are mapped in
one place.

`src/pages/Users/usersQuery.ts` parses the URL with a Zod schema before any of
it reaches the API. That is not ceremony: the URL is user input, and the API
answers anything it does not recognise with a 400. Every field carries a
`.catch()`, so a hand-typed `?sortBy=nonsense` falls back to the default order
instead of rendering an error screen.

Anything except a page change resets to page one. Applying a filter while on
page twelve would otherwise land on a page the narrowed result set no longer
has. Query changes replace rather than push, so paging does not fill the back
button with twenty near-identical entries.

The column filter panel opens from the funnel icon in a column header, matching
the design. It is rendered as a sibling of the table's scroll container rather
than inside the `<th>`, because the table scrolls horizontally and an
absolutely positioned panel inside `overflow-x: auto` gets clipped. It is
seeded from the URL, so reopening it shows what is applied rather than an empty
form over a filtered table.

A click anywhere outside the panel dismisses it, as does Escape. The column
funnel icons are exempt from that handler: they toggle, so closing on their
`mousedown` would leave the click that follows reopening what it just closed.

The organization dropdown is populated from `GET /users/stats`, which returns
the distinct list. Deriving it client-side would mean loading all 500 users to
collect ten names.

The date filter passes a calendar day, `YYYY-MM-DD`, and the comparison happens
server-side. `<input type="date">` yields that day in the viewer's timezone, so
a sign-up recorded late in the evening can fall under the neighbouring day for
anyone far enough from the server's.

## Dashboard

The Figma frame labelled "Dashboard" is the Users screen, so the brief leaves
the actual overview undefined.
Rather than ship two near-identical pages, `/dashboard` shows a status
breakdown, the top organizations by user count, and the five most recent
sign-ups.

The first two come from `GET /users/stats`, counted over all 500 records rather
than recomputed in every browser. "Recently joined" is
`?sortBy=dateJoined&sortOrder=desc&perPage=5` — sorting and slicing are the
endpoint's job, so the page ships five rows rather than 500 to find five. The
bars are CSS widths; a charting library is not worth it for two lists of five
rows.

The stat cards report platform totals and do not move when the table below them
is filtered. That is deliberate: the cards describe the platform, the table
describes the query, and cards that moved with the filter would be making a
different claim.

## Persistence

Opening a user from the table or the dashboard records that selection in
`localStorage`, and the details page reads it back to name whose record is
loading rather than announcing an anonymous wait.

It records the selection rather than caching a user, because the list only
carries a summary — no personal details, bank details or tier — so the full
record is always fetched. React Query covers the repeat visit: navigating back
into a user already seen serves them from memory within `staleTime`.

All of it goes through helpers in `src/utils/storage.ts`, which swallow both
malformed JSON and a full quota. Logging out clears the token, the stored
selection, and the React Query cache. Without the last one, signing in again
inside the 10-minute `gcTime` was served the previous session's data.

## Accessibility

Semantic elements first, ARIA only where the platform has no equivalent.

Every row in the users table is reachable by keyboard, because the username
cell is a real link rather than a click handler on a `<tr>`. Row action buttons
are named after their user instead of announcing "button, collapsed" twenty
times a page. Column headers carry `scope` and `aria-sort`.

The tabs implement the full ARIA pattern, a single tab stop, arrow keys, Home
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
| ≤ 480px | Stat cards drop to a single column |
| ≤ 768px | Sidebar becomes a drawer, search moves to its own row under the logo |
| ≤ 1024px | Stat cards drop to two columns, dashboard panels stack |
| above | Full layout, sidebar fixed |

All three are `max-width` queries through one `respond-to` mixin, so the
breakpoints live in one place. Tables scroll horizontally inside their card
rather than squeezing columns to nothing.

## Testing

214 tests across 25 files. Roughly 94% of statements and 90% of branches.

The suite mocks the service layer, which is the seam that makes failure paths
testable at all. Without it there is no way to make a request fail, so there is
no test that the error state renders or that Retry actually refetches.

Error normalization is tested a layer lower, against real `AxiosError`s, since
that is the only place the difference between an offline machine and an
unreachable server exists. `navigator.onLine` is stubbed both ways, and one
test asserts the negative directly: when the browser has a network, the message
must not mention the internet connection.

Because the server does the filtering, the page's job is to ask the right
question, not to narrow an array — so that is what the assertions check.
Applying a status filter sends `status`, sorting a column sends `sortBy` and
`sortOrder`, and either one resets `page` to 1. Rendering three users and
expecting one back after a filter would prove nothing about code that ships;
what the server does with those parameters is the API's test suite, not this
one.

`usersQuery.ts` is unit-tested directly, including every malformed URL the API
would reject.

Tests query by role and accessible name. That keeps them readable and means
they fail when the accessibility of a component regresses, not just when its
markup changes.

Shared factories build `User`, `UserSummary`, a paginated response and a stats
response, so a change to a contract touches one file instead of six.

## Bundle

Initial JavaScript is **209 kB**, or **66 kB gzipped**, with each route loading
its own chunk on demand.

Three choices keep it there: routes are code-split, dates are formatted with
`Intl` rather than a date library, and the dataset lives behind the API rather
than being shipped or generated in the browser.

## Things left undone

The row actions — blacklist, activate, deactivate — do not mutate anything.
There is no backend to mutate against, and faking it with optimistic updates
would have been theatre.

Two of the six detail tabs, Documents and App and System, are permanently
empty. That is deliberate: they demonstrate the empty state on a screen where
it would otherwise never appear.

The header's notification bell and the "Docs" link are decorative, as they are
in the design.

The users table does not show a full name, so there is no way to search by one:
the API's `search` spans organization, username, email and phone number, which
is exactly what the columns show. Searching on a field nobody can see would
return rows with no visible reason for matching.
