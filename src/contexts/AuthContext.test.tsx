import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { STORAGE_KEYS } from '@/constants'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './useAuth'

function TestComponent() {
  const { isAuthenticated, login, logout } = useAuth()

  return (
    <div>
      <p>{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>
      <button onClick={() => login('test-token')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts unauthenticated when no token in storage', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )
    expect(screen.getByText('Not authenticated')).toBeInTheDocument()
  })

  it('starts authenticated when token exists in storage', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'existing-token')
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )
    expect(screen.getByText('Authenticated')).toBeInTheDocument()
  })

  it('login sets token and updates state', async () => {
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await user.click(screen.getByText('Login'))
    expect(screen.getByText('Authenticated')).toBeInTheDocument()
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe('test-token')
  })

  it('logout removes token and updates state', async () => {
    const user = userEvent.setup()
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'existing-token')
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await user.click(screen.getByText('Logout'))
    expect(screen.getByText('Not authenticated')).toBeInTheDocument()
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull()
  })
})
