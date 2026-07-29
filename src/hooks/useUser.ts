import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { usersService } from '@/services/users.service'

export function useUser(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, id],
    queryFn: () => usersService.getById(id),
    enabled: !!id,
  })
}
