import { useSearchParams } from 'react-router-dom'
import { useUsers, useUserStats } from '@/hooks'
import { StatCard } from '@/components/features/StatCard'
import { UsersTable, type SortState } from '@/components/features/UsersTable'
import type { FilterFormData } from '@/components/features/UserFilters'
import {
  Skeleton,
  SkeletonGroup,
  ErrorState,
  EmptyState,
  Button,
} from '@/components/ui'
import { dashboardStats } from '@/config/dashboardStats'
import {
  FILTER_KEYS,
  hasActiveFilters,
  parseUsersQuery,
  toFilterValues,
} from './usersQuery'
import styles from './UsersPage.module.scss'

/** Values written into the URL. `undefined` and `''` remove the parameter. */
type QueryPatch = Record<string, string | number | undefined>

function UsersPageSkeleton() {
  return (
    <SkeletonGroup label="Loading users" className={styles.page}>
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
    </SkeletonGroup>
  )
}

function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // The URL is the single source of truth for what the table shows, so a
  // filtered, sorted, paged view can be linked to and survives a refresh.
  const query = parseUsersQuery(searchParams)

  const usersQuery = useUsers(query)
  const statsQuery = useUserStats()

  /**
   * Every change except paging resets to page one — applying a filter while on
   * page twelve otherwise lands on a page the narrowed result set no longer
   * has. Replaces rather than pushes so paging does not fill the back button
   * with twenty near-identical entries.
   */
  const updateQuery = (patch: QueryPatch, { resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams)

    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === '') {
        next.delete(key)
      } else {
        next.set(key, String(value))
      }
    }

    if (resetPage) {
      next.delete('page')
    }

    setSearchParams(next, { replace: true })
  }

  const applyFilters = (filters: FilterFormData) => updateQuery({ ...filters })

  const clearFilters = () => {
    updateQuery({
      q: undefined,
      ...Object.fromEntries(FILTER_KEYS.map((key) => [key, undefined])),
    })
  }

  const applySort = ({ sortBy, sortOrder }: SortState) =>
    updateQuery({ sortBy, sortOrder })

  // Both requests describe this page, so one skeleton and one error state
  // cover them. They run in parallel and the stats response is cached across
  // the dashboard, so in practice they resolve together.
  if (usersQuery.isLoading || statsQuery.isLoading) {
    return <UsersPageSkeleton />
  }

  if (
    usersQuery.isError ||
    statsQuery.isError ||
    !usersQuery.data ||
    !statsQuery.data
  ) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Users</h1>
        <ErrorState
          title="Failed to load users"
          message="We couldn't fetch the user data. Please try again."
          action={
            <Button
              onClick={() => {
                usersQuery.refetch()
                statsQuery.refetch()
              }}
            >
              Retry
            </Button>
          }
        />
      </div>
    )
  }

  const { users, pagination } = usersQuery.data
  const stats = statsQuery.data
  const isNarrowed = hasActiveFilters(query) || !!query.search

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
            value={stat.getValue(stats)}
          />
        ))}
      </div>

      <div className={styles.tableSection}>
        {pagination.total === 0 ? (
          <EmptyState
            title={isNarrowed ? 'No results found' : 'No users found'}
            description={
              isNarrowed
                ? 'Try adjusting your search or filter criteria.'
                : 'There are no users to display at this time.'
            }
            action={
              isNarrowed && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )
            }
          />
        ) : (
          <UsersTable
            data={users}
            pagination={pagination}
            sort={{ sortBy: query.sortBy, sortOrder: query.sortOrder }}
            onSortChange={applySort}
            onPageChange={(page) => updateQuery({ page }, { resetPage: false })}
            onPageSizeChange={(perPage) => updateQuery({ perPage })}
            filters={{
              organizations: stats.organizations,
              values: toFilterValues(query),
              isActive: hasActiveFilters(query),
              onApply: applyFilters,
              onReset: clearFilters,
            }}
          />
        )}
      </div>
    </div>
  )
}

export default UsersPage
