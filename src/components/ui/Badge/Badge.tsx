import { cn } from '@/utils'
import styles from './Badge.module.scss'

type BadgeStatus = 'active' | 'inactive' | 'pending' | 'blacklisted'

interface BadgeProps {
  status: BadgeStatus
  className?: string
}

const statusLabels: Record<BadgeStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  blacklisted: 'Blacklisted',
}

function Badge({ status, className }: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[status], className)}>
      {statusLabels[status]}
    </span>
  )
}

export default Badge
