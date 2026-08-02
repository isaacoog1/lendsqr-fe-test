import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { usersService } from '@/services/users.service'
import type { ApiError, UserStats } from '@/types'

/**
 * Platform-wide totals: the four stat cards, the dashboard panels, and the
 * organization list the filter dropdown offers. Counted server-side over all
 * 500 records, so the figures do not change with the table's filters.
 */
export function useUserStats() {
  return useQuery<UserStats, ApiError>({
    queryKey: [QUERY_KEYS.USER_STATS],
    queryFn: usersService.getStats,
  })
}
