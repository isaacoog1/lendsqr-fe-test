interface LoginPayload {
  email: string
  password: string
}

interface LoginResponse {
  token: string
}

function delay(ms = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    await delay()

    if (payload.email && payload.password) {
      return { token: 'mock-jwt-token-' + Date.now() }
    }

    throw { message: 'Invalid credentials', status: 401 }
  },
}
