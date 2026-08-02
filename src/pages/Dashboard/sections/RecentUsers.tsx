import { Link } from 'react-router-dom'
import { Avatar, Badge } from '@/components/ui'
import { formatDate, saveSelectedUser } from '@/utils'
import type { UserSummary } from '@/types'
import styles from './sections.module.scss'

interface RecentUsersProps {
  /** Already sorted newest first by the API. */
  users: UserSummary[]
}

function RecentUsers({ users }: RecentUsersProps) {
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
        {users.map((user) => (
          <li key={user.id}>
            <Link
              to={`/users/${user.id}`}
              className={styles.recentRow}
              // Mirrors the users table: record the selection before leaving.
              onClick={() => saveSelectedUser(user)}
            >
              <Avatar name={user.username} size="sm" />

              <span className={styles.recentIdentity}>
                <span className={styles.recentName}>{user.username}</span>
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
