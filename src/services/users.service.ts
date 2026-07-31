import { apiClient } from '@/api/client'
import { config } from '@/config/env'
import type { ApiError, User } from '@/types'

/**
 * The mock endpoint serves the users collection at a single path, so `getById`
 * resolves against it rather than issuing `GET /users/:id`. React Query dedupes
 * the request against the list query, so the details page costs no extra round
 * trip. Against a backend with a per-resource route this becomes a one-line
 * change to `apiClient.get<User>(`${config.usersPath}/${id}`)`.
 */
export const usersService = {
  async getAll(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>(config.usersPath)
    return data
  },

  async getById(id: string): Promise<User> {
    const users = await usersService.getAll()
    const user = users.find((candidate) => candidate.id === id)

    if (!user) {
      const notFound: ApiError = { message: 'User not found', status: 404 }
      throw notFound
    }

    return user
  },
}
