import { useUsers, useUserStats } from '@/hooks'
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

const RECENT_USER_COUNT = 5

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
  const statsQuery = useUserStats()

  // The API sorts and slices, so "five most recent" is a query rather than a
  // derivation over every record.
  const recentQuery = useUsers({
    sortBy: 'dateJoined',
    sortOrder: 'desc',
    perPage: RECENT_USER_COUNT,
  })

  if (statsQuery.isLoading || recentQuery.isLoading) {
    return <DashboardSkeleton />
  }

  if (
    statsQuery.isError ||
    recentQuery.isError ||
    !statsQuery.data ||
    !recentQuery.data
  ) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Dashboard</h1>
        <ErrorState
          title="Failed to load users"
          message="We couldn't fetch the user data. Please try again."
          action={
            <Button
              onClick={() => {
                statsQuery.refetch()
                recentQuery.refetch()
              }}
            >
              Retry
            </Button>
          }
        />
      </div>
    )
  }

  const stats = statsQuery.data

  if (stats.totalUsers === 0) {
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
          An overview of {stats.totalUsers.toLocaleString()} users across the
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
            value={stat.getValue(stats)}
          />
        ))}
      </div>

      <div className={styles.panels}>
        <StatusBreakdown rows={stats.statusBreakdown} />
        <TopOrganizations rows={stats.topOrganizations} />
      </div>

      <RecentUsers users={recentQuery.data.users} />
    </div>
  )
}

export default DashboardPage
