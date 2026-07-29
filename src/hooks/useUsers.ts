import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { usersService } from '@/services/users.service'

export function useUsers() {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS],
    queryFn: usersService.getAll,
  })
}
