import { Link } from 'react-router-dom'
import { Avatar, Badge } from '@/components/ui'
import { formatDate, saveSelectedUser } from '@/utils'
import type { User } from '@/types'
import { recentlyJoined } from '../dashboardInsights'
import styles from './sections.module.scss'

interface RecentUsersProps {
  users: User[]
}

function RecentUsers({ users }: RecentUsersProps) {
  const rows = recentlyJoined(users)

  return (
    <section className={styles.card} aria-labelledby="recent-users-title">
      <div className={styles.cardHeader}>
        <h2 id="recent-users-title" className={styles.cardTitle}>
          Recently joined
        </h2>
        <Link to="/users" className={styles.cardLink}>
          View all users
        </Link>
      </div>

      <ul className={styles.list}>
        {rows.map((user) => (
          <li key={user.id}>
            <Link
              to={`/users/${user.id}`}
              className={styles.recentRow}
              // Mirrors the users table: seed the cache so the details page
              // renders without waiting on a request.
              onClick={() => saveSelectedUser(user)}
            >
              <Avatar name={user.personalInfo.fullName} size="sm" />

              <span className={styles.recentIdentity}>
                <span className={styles.recentName}>
                  {user.personalInfo.fullName}
                </span>
                <span className={styles.recentMeta}>{user.organization}</span>
              </span>

              <span className={styles.recentDate}>
                {formatDate(user.dateJoined)}
              </span>
              <Badge status={user.status} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default RecentUsers
