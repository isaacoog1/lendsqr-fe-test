import { cn } from '@/utils'
import styles from './Skeleton.module.scss'

interface SkeletonProps {
  width?: string
  height?: string
  variant?: 'text' | 'circular' | 'rectangular'
  className?: string
}

function Skeleton({
  width,
  height,
  variant = 'text',
  className,
}: SkeletonProps) {
  return (
    <div
      className={cn(styles.skeleton, styles[variant], className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

export default Skeleton
