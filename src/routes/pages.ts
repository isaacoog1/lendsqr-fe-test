import { lazy } from 'react'

// Split per route so visiting /login does not download the users table,
// TanStack Table, the filter forms and every detail section first.
export const LoginPage = lazy(() => import('@/pages/Login/LoginPage'))
export const DashboardPage = lazy(
  () => import('@/pages/Dashboard/DashboardPage'),
)
export const UsersPage = lazy(() => import('@/pages/Users/UsersPage'))
export const UserDetailsPage = lazy(
  () => import('@/pages/UserDetails/UserDetailsPage'),
)
export const ComingSoonPage = lazy(
  () => import('@/pages/ComingSoon/ComingSoonPage'),
)
export const NotFoundPage = lazy(() => import('@/pages/NotFound/NotFoundPage'))
