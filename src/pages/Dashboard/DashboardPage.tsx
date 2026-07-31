import { useUsers } from '@/hooks'
import { StatCard } from '@/components/features/StatCard'
import {
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
  SkeletonGroup,
} from '@/components/ui'
import { dashboardStats } from '@/config/dashboardStats'
import { StatusBreakdown, TopOrganizations, RecentUsers } from './sections'
import styles from './DashboardPage.module.scss'

function DashboardSkeleton() {
  return (
    <SkeletonGroup label="Loading dashboard" className={styles.page}>
      <Skeleton width="180px" height="28px" />
      <div className={styles.stats}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={styles.skeletonCard}>
            <Skeleton variant="circular" width="40px" height="40px" />
            <Skeleton width="80px" height="12px" />
            <Skeleton width="60px" height="24px" />
          </div>
        ))}
      </div>
      <div className={styles.panels}>
        <Skeleton height="260px" />
        <Skeleton height="260px" />
      </div>
      <Skeleton height="280px" />
    </SkeletonGroup>
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
        <h1 className={styles.title}>Dashboard</h1>
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
        <h1 className={styles.title}>Dashboard</h1>
        <EmptyState
          title="No users found"
          description="Once users are onboarded their activity will appear here."
        />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>
          An overview of {users.length.toLocaleString()} users across the
          platform.
        </p>
      </header>

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

      <div className={styles.panels}>
        <StatusBreakdown users={users} />
        <TopOrganizations users={users} />
      </div>

      <RecentUsers users={users} />
    </div>
  )
}

export default DashboardPage
