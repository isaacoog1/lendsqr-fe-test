import { Badge } from '@/components/ui'
import type { User } from '@/types'
import { breakdownByStatus } from '../dashboardInsights'
import styles from './sections.module.scss'

interface StatusBreakdownProps {
  users: User[]
}

function StatusBreakdown({ users }: StatusBreakdownProps) {
  const rows = breakdownByStatus(users)

  return (
    <section className={styles.card} aria-labelledby="status-breakdown-title">
      <h2 id="status-breakdown-title" className={styles.cardTitle}>
        Users by status
      </h2>

      <ul className={styles.list}>
        {rows.map((row) => (
          <li key={row.status} className={styles.statusRow}>
            <Badge status={row.status} />

            {/* Decorative: the count and share beside it carry the meaning. */}
            <span className={styles.bar} aria-hidden="true">
              <span
                className={styles.barFill}
                data-status={row.status}
                style={{ width: `${row.percentage}%` }}
              />
            </span>

            <span className={styles.statusCount}>
              {row.count.toLocaleString()}
            </span>
            <span className={styles.statusShare}>{row.percentage}%</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default StatusBreakdown
