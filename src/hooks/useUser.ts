import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { usersService } from '@/services/users.service'
import type { ApiError, User } from '@/types'

interface UseUserOptions {
  /** Skip the request when the caller already holds the user. */
  enabled?: boolean
}

export function useUser(id: string | undefined, options: UseUserOptions = {}) {
  const enabled = !!id && (options.enabled ?? true)

  return useQuery<User, ApiError>({
    queryKey: [QUERY_KEYS.USER, id],
    // Only reachable when `enabled` is true, which requires a defined id.
    queryFn: () => usersService.getById(id!),
    enabled,
  })
}
