import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { usersService } from '@/services/users.service'
import type { ApiError, User } from '@/types'

/** The full record. Lists only carry summaries, so the details page fetches. */
export function useUser(id: string | undefined) {
  return useQuery<User, ApiError>({
    queryKey: [QUERY_KEYS.USER, id],
    // Only reachable when `enabled` is true, which requires a defined id.
    queryFn: () => usersService.getById(id!),
    enabled: !!id,
  })
}
