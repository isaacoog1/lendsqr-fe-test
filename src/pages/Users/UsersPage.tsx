import { useMemo, useState } from 'react'
import { useUsers, useDebounce } from '@/hooks'
import { StatCard } from '@/components/features/StatCard'
import { UsersTable } from '@/components/features/UsersTable'
import type { FilterFormData } from '@/components/features/UserFilters'
import {
  Skeleton,
  SkeletonGroup,
  ErrorState,
  EmptyState,
  Button,
} from '@/components/ui'
import { dashboardStats } from '@/config/dashboardStats'
import type { User } from '@/types'
import styles from './UsersPage.module.scss'

/**
 * `<input type="date">` yields a calendar date in the viewer's timezone, so the
 * stored ISO timestamp has to be compared the same way. Formatting it as UTC
 * shifts the day for anyone east of Greenwich who joined late in the evening.
 */
function isSameLocalDay(isoTimestamp: string, calendarDate: string): boolean {
  const joined = new Date(isoTimestamp)
  const [year, month, day] = calendarDate.split('-').map(Number)

  return (
    joined.getFullYear() === year &&
    joined.getMonth() + 1 === month &&
    joined.getDate() === day
  )
}

function applyFilters(users: User[], filters: FilterFormData): User[] {
  return users.filter((user) => {
    if (filters.organization && user.organization !== filters.organization) {
      return false
    }
    if (
      filters.username &&
      !user.username.toLowerCase().includes(filters.username.toLowerCase())
    ) {
      return false
    }
    if (
      filters.email &&
      !user.email.toLowerCase().includes(filters.email.toLowerCase())
    ) {
      return false
    }
    if (
      filters.phoneNumber &&
      !user.phoneNumber.includes(filters.phoneNumber)
    ) {
      return false
    }
    if (
      filters.dateJoined &&
      !isSameLocalDay(user.dateJoined, filters.dateJoined)
    ) {
      return false
    }
    if (filters.status && user.status !== filters.status) {
      return false
    }
    return true
  })
}

function applySearch(users: User[], query: string): User[] {
  if (!query) return users
  const lower = query.toLowerCase()
  return users.filter(
    (user) =>
      user.personalInfo.fullName.toLowerCase().includes(lower) ||
      user.username.toLowerCase().includes(lower) ||
      user.email.toLowerCase().includes(lower) ||
      user.phoneNumber.includes(query),
  )
}

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
  const { data: users, isLoading, isError, refetch } = useUsers()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterFormData>({})

  const debouncedSearch = useDebounce(searchQuery)

  const organizations = useMemo(() => {
    if (!users) return []
    return [...new Set(users.map((u) => u.organization))].sort()
  }, [users])

  const filteredUsers = useMemo(() => {
    if (!users) return []
    const afterFilters = applyFilters(users, filters)
    return applySearch(afterFilters, debouncedSearch)
  }, [users, filters, debouncedSearch])

  const stats = useMemo(() => {
    if (!users) return []
    return dashboardStats.map((stat) => ({
      ...stat,
      computedValue: stat.getValue(users),
    }))
  }, [users])

  if (isLoading) {
    return <UsersPageSkeleton />
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
        <EmptyState
          title="No users found"
          description="There are no users to display at this time."
        />
      </div>
    )
  }

  const hasActiveFilters = Object.values(filters).some((v) => !!v)
  const noResults = filteredUsers.length === 0

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Users</h1>

      <div className={styles.stats}>
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            iconColor={stat.iconColor}
            iconBgColor={stat.iconBgColor}
            label={stat.label}
            value={stat.computedValue}
          />
        ))}
      </div>

      <div className={styles.tableSection}>
        <div className={styles.toolbar}>
          <input
            type="search"
            placeholder="Search by name, email, or phone"
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search users"
          />
        </div>

        {noResults ? (
          <EmptyState
            title="No results found"
            description={
              hasActiveFilters || debouncedSearch
                ? 'Try adjusting your search or filter criteria.'
                : 'There are no users to display.'
            }
            action={
              (hasActiveFilters || debouncedSearch) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({})
                    setSearchQuery('')
                  }}
                >
                  Clear Filters
                </Button>
              )
            }
          />
        ) : (
          <UsersTable
            data={filteredUsers}
            filters={{
              organizations,
              isActive: hasActiveFilters,
              onApply: setFilters,
              onReset: () => setFilters({}),
            }}
          />
        )}
      </div>
    </div>
  )
}

export default UsersPage
