import { cn } from '@/utils'
import styles from './Spinner.module.scss'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(styles.spinner, styles[size], className)}
      role="status"
      aria-label="Loading"
    >
      <span className={styles.srOnly}>Loading...</span>
    </div>
  )
}

export default Spinner
