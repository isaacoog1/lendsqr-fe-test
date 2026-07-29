import { apiClient } from '@/api/client'

interface LoginPayload {
  email: string
  password: string
}

export const authService = {
  login: (payload: LoginPayload) => apiClient.post('/auth/login', payload),
}
