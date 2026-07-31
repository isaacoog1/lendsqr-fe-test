import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Spinner } from '@/components/ui'
import ProtectedRoute from './ProtectedRoute'
import GuestRoute from './GuestRoute'
import styles from './routes.module.scss'

// Split per route so visiting /login does not download the users table,
// TanStack Table, the filter forms and every detail section first.
const LoginPage = lazy(() => import('@/pages/Login/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/Dashboard/DashboardPage'))
const UsersPage = lazy(() => import('@/pages/Users/UsersPage'))
const UserDetailsPage = lazy(
  () => import('@/pages/UserDetails/UserDetailsPage'),
)
const ComingSoonPage = lazy(() => import('@/pages/ComingSoon/ComingSoonPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFound/NotFoundPage'))

function RouteFallback() {
  return (
    <div className={styles.fallback}>
      <Spinner size="lg" />
    </div>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:id" element={<UserDetailsPage />} />
            {/*
              Keeps the header and sidebar mounted for the nav items this
              assessment does not implement. Without it every one of them fell
              through to the bare 404 below, stripping the shell on one click.
            */}
            <Route path="*" element={<ComingSoonPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
