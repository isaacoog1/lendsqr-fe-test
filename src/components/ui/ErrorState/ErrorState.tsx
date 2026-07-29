import type { ReactNode } from 'react'
import styles from './ErrorState.module.scss'

interface ErrorStateProps {
  title?: string
  message?: string
  action?: ReactNode
}

function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  action,
}: ErrorStateProps) {
  return (
    <div className={styles.container} role="alert">
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}

export default ErrorState
