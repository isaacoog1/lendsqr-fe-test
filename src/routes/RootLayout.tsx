import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthProvider'
import { Spinner } from '@/components/ui'
import styles from './RootLayout.module.scss'

function RouteFallback() {
  return (
    <div className={styles.fallback}>
      <Spinner size="lg" />
    </div>
  )
}

/**
 * The route every screen renders under. It owns what used to sit between
 * `BrowserRouter` and the route table — the auth provider and the Suspense
 * boundary the lazy pages resolve into. A data router has no room for
 * providers around its routes, so they live in a route of their own.
 */
function RootLayout() {
  return (
    <AuthProvider>
      <Suspense fallback={<RouteFallback />}>
        <Outlet />
      </Suspense>
    </AuthProvider>
  )
}

export default RootLayout
