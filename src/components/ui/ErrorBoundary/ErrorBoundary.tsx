import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import ErrorState from '@/components/ui/ErrorState/ErrorState'
import styles from './ErrorBoundary.module.scss'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Called on capture — a hook for a reporting service in a real deployment. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Last line of defence for render-time errors. Without it any throw below the
 * router unmounts the whole tree and leaves a blank page with no way back —
 * the most common failure a real app has, and one the happy path never shows.
 *
 * A class is required here: there is still no hook equivalent of
 * `getDerivedStateFromError`.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <ErrorState
            title="Something went wrong"
            message="The page could not be displayed. Reloading usually fixes it."
            action={<Button onClick={this.handleReload}>Reload page</Button>}
          />
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
