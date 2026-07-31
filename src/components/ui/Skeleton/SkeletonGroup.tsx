import type { ReactNode } from 'react'
import styles from './SkeletonGroup.module.scss'

interface SkeletonGroupProps {
  /** Announced to assistive technology while the content loads. */
  label: string
  children: ReactNode
  className?: string
}

/**
 * Wraps a set of `Skeleton` placeholders. The skeletons themselves are
 * `aria-hidden`, so without this the loading state is silent for screen
 * readers — the page simply appears empty until the data arrives.
 */
function SkeletonGroup({ label, children, className }: SkeletonGroupProps) {
  return (
    <div
      className={className}
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <span className={styles.srOnly}>{label}</span>
      {children}
    </div>
  )
}

export default SkeletonGroup
