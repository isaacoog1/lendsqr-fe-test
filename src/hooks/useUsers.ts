import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { usersService, type UsersQuery } from '@/services/users.service'
import type { ApiError, PaginatedUsers } from '@/types'

/**
 * The query joins the cache key, so changing page, sort or any filter fetches
 * that combination and caches it separately.
 *
 * `keepPreviousData` keeps the current page on screen while the next one
 * loads. Without it every page change unmounts the table back to the skeleton,
 * which reads as the whole screen reloading rather than a row swap.
 */
export function useUsers(query: UsersQuery = {}) {
  return useQuery<PaginatedUsers, ApiError>({
    queryKey: [QUERY_KEYS.USERS, query],
    queryFn: () => usersService.list(query),
    placeholderData: keepPreviousData,
  })
}
