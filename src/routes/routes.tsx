import { Navigate, type RouteObject } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { sidebarConfig } from '@/config/sidebar'
import RootLayout from './RootLayout'
import RouteErrorBoundary from './RouteErrorBoundary'
import ProtectedRoute from './ProtectedRoute'
import GuestRoute from './GuestRoute'
import {
  LoginPage,
  DashboardPage,
  UsersPage,
  UserDetailsPage,
  ComingSoonPage,
  NotFoundPage,
} from './pages'

/** The sidebar destinations that resolve to a screen. */
const IMPLEMENTED_PATHS = ['/dashboard', '/users']

/**
 * The other 20 sidebar destinations get a real route inside the app layout, so
 * the header and sidebar survive the click. A splat would be shorter, but it
 * would also match every unknown URL and leave the 404 unreachable — naming
 * them keeps "not built yet" and "no such page" as different answers.
 */
const comingSoonRoutes: RouteObject[] = sidebarConfig
  .flatMap((group) => group.items)
  .filter((item) => !IMPLEMENTED_PATHS.includes(item.path))
  .map((item) => ({
    path: item.path,
    element: <ComingSoonPage title={item.label} />,
  }))

/**
 * The route table as plain data, so the app can hand it to
 * `createBrowserRouter` and tests to `createMemoryRouter` — the same tree
 * either way.
 */
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        element: <GuestRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [{ path: 'login', element: <LoginPage /> }],
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: 'dashboard', element: <DashboardPage /> },
              { path: 'users', element: <UsersPage /> },
              { path: 'users/:id', element: <UserDetailsPage /> },
              ...comingSoonRoutes,
            ],
          },
        ],
      },
      // Everything the sidebar never advertised, signed in or out.
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
