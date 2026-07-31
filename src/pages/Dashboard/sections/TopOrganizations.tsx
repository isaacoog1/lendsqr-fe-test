import type { User } from '@/types'
import { topOrganizations } from '../dashboardInsights'
import styles from './sections.module.scss'

interface TopOrganizationsProps {
  users: User[]
}

function TopOrganizations({ users }: TopOrganizationsProps) {
  const rows = topOrganizations(users)
  // Bars are scaled against the leader rather than the total: with ten
  // organizations, share-of-total would render every bar as a sliver.
  const largest = rows[0]?.count ?? 0

  return (
    <section className={styles.card} aria-labelledby="top-organizations-title">
      <h2 id="top-organizations-title" className={styles.cardTitle}>
        Top organizations
      </h2>

      <ul className={styles.list}>
        {rows.map((row) => (
          <li key={row.organization} className={styles.organizationRow}>
            <span className={styles.organizationName}>{row.organization}</span>

            <span className={styles.bar} aria-hidden="true">
              <span
                className={styles.barFill}
                data-tone="primary"
                style={{
                  width: largest ? `${(row.count / largest) * 100}%` : '0%',
                }}
              />
            </span>

            <span className={styles.statusCount}>
              {row.count.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default TopOrganizations
