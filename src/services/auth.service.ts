import { DEMO_CREDENTIALS } from '@/constants'
import type { ApiError } from '@/types'

interface LoginPayload {
  email: string
  password: string
}

interface LoginResponse {
  token: string
}

/**
 * There is no auth backend for this assessment, so login is validated against
 * a single demo account documented in the README. Accepting any non-empty
 * input would leave the 401 path unreachable — and an error state that cannot
 * be triggered is an error state that cannot be trusted.
 */
export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const emailMatches =
      payload.email.trim().toLowerCase() === DEMO_CREDENTIALS.email
    const passwordMatches = payload.password === DEMO_CREDENTIALS.password

    if (!emailMatches || !passwordMatches) {
      const unauthorized: ApiError = {
        message: 'Incorrect email or password.',
        status: 401,
      }
      throw unauthorized
    }

    return { token: `demo-token-${Date.now()}` }
  },
}
