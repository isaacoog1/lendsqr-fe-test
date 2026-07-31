import type { User, UserStatus } from '@/types'

/**
 * Derivations behind the dashboard. Every figure is counted from the dataset
 * the users table renders — nothing here is estimated or hardcoded, so the
 * dashboard and the list can never disagree.
 *
 * Kept as pure functions so they can be tested without rendering.
 */

const STATUS_ORDER: UserStatus[] = [
  'active',
  'inactive',
  'pending',
  'blacklisted',
]

export interface StatusBreakdownRow {
  status: UserStatus
  count: number
  /** Share of all users, rounded to a whole percent. */
  percentage: number
}

export function breakdownByStatus(users: User[]): StatusBreakdownRow[] {
  return STATUS_ORDER.map((status) => {
    const count = users.filter((user) => user.status === status).length

    return {
      status,
      count,
      percentage: users.length ? Math.round((count / users.length) * 100) : 0,
    }
  })
}

export interface OrganizationRow {
  organization: string
  count: number
}

/** Organizations with the most users, largest first. */
export function topOrganizations(users: User[], limit = 5): OrganizationRow[] {
  const counts = new Map<string, number>()

  for (const user of users) {
    counts.set(user.organization, (counts.get(user.organization) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([organization, count]) => ({ organization, count }))
    .sort(
      (a, b) =>
        b.count - a.count || a.organization.localeCompare(b.organization),
    )
    .slice(0, limit)
}

/** Most recent sign-ups, newest first. */
export function recentlyJoined(users: User[], limit = 5): User[] {
  return [...users]
    .sort(
      (a, b) =>
        new Date(b.dateJoined).getTime() - new Date(a.dateJoined).getTime(),
    )
    .slice(0, limit)
}
