import { useEffect } from 'react'
import { useRouteError } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import ErrorState from '@/components/ui/ErrorState/ErrorState'
import styles from './RouteErrorBoundary.module.scss'

interface RouteErrorBoundaryProps {
  /** Called with the captured error — a hook for a reporting service. */
  onError?: (error: unknown) => void
}

/**
 * Last line of defence for render-time errors. Without it any throw below the
 * router unmounts the whole tree and leaves a blank page with no way back —
 * the most common failure a real app has, and one the happy path never shows.
 *
 * Registered as the root route's `errorElement`, so it covers every screen.
 * The data router supplies the boundary itself, which is why this can be a
 * function component: `useRouteError` reads what it caught.
 */
function RouteErrorBoundary({ onError }: RouteErrorBoundaryProps) {
  const error = useRouteError()

  useEffect(() => {
    onError?.(error)
  }, [error, onError])

  return (
    <div className={styles.container}>
      <ErrorState
        title="Something went wrong"
        message="The page could not be displayed. Reloading usually fixes it."
        action={
          <Button onClick={() => window.location.reload()}>Reload page</Button>
        }
      />
    </div>
  )
}

export default RouteErrorBoundary
