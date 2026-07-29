import { apiClient } from '@/api/client'

export const usersService = {
  getAll: () => apiClient.get('/users'),
  getById: (id: string) => apiClient.get(`/users/${id}`),
}
