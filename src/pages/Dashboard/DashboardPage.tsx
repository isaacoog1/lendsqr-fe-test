import { useUsers } from '@/hooks'
import { StatCard } from '@/components/features/StatCard'
import { UsersTable } from '@/components/features/UsersTable'
import { Skeleton, Spinner, ErrorState } from '@/components/ui'
import { Button } from '@/components/ui'
import { dashboardStats } from '@/config/dashboardStats'
import styles from './DashboardPage.module.scss'

function DashboardSkeleton() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Users</h1>
      <div className={styles.stats}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <Skeleton variant="circular" width="40px" height="40px" />
            <Skeleton width="80px" height="12px" />
            <Skeleton width="60px" height="24px" />
          </div>
        ))}
      </div>
      <div className={styles.skeletonTable}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} height="48px" />
        ))}
      </div>
    </div>
  )
}

function DashboardPage() {
  const { data: users, isLoading, isError, refetch } = useUsers()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Users</h1>
        <ErrorState
          title="Failed to load users"
          message="We couldn't fetch the user data. Please try again."
          action={<Button onClick={() => refetch()}>Retry</Button>}
        />
      </div>
    )
  }

  if (!users || users.length === 0) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Users</h1>
        <div className={styles.empty}>
          <Spinner size="lg" />
          <p>No users found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Users</h1>

      <div className={styles.stats}>
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            iconColor={stat.iconColor}
            iconBgColor={stat.iconBgColor}
            label={stat.label}
            value={stat.getValue(users)}
          />
        ))}
      </div>

      <UsersTable data={users} />
    </div>
  )
}

export default DashboardPage
