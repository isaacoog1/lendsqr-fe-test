import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { STORAGE_KEYS, QUERY_KEYS } from '@/constants'
import { renderWithProviders } from '@/test/renderWithProviders'
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

function renderAuth() {
  return renderWithProviders(<TestComponent />)
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts unauthenticated when no token is stored', () => {
    renderAuth()

    expect(screen.getByText('Not authenticated')).toBeInTheDocument()
  })

  it('restores the session from a stored token', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'existing-token')
    renderAuth()

    expect(screen.getByText('Authenticated')).toBeInTheDocument()
  })

  it('stores the token on login', async () => {
    const user = userEvent.setup()
    renderAuth()

    await user.click(screen.getByText('Login'))

    expect(screen.getByText('Authenticated')).toBeInTheDocument()
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe('test-token')
  })

  it('drops the token on logout', async () => {
    const user = userEvent.setup()
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'existing-token')
    renderAuth()

    await user.click(screen.getByText('Logout'))

    expect(screen.getByText('Not authenticated')).toBeInTheDocument()
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull()
  })

  it('clears the selected user on logout', async () => {
    const user = userEvent.setup()
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'existing-token')
    localStorage.setItem(STORAGE_KEYS.SELECTED_USER, '{"id":"user-1"}')
    renderAuth()

    await user.click(screen.getByText('Logout'))

    expect(localStorage.getItem(STORAGE_KEYS.SELECTED_USER)).toBeNull()
  })

  it('empties the query cache on logout so the next session refetches', async () => {
    const user = userEvent.setup()
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'existing-token')
    const { queryClient } = renderAuth()

    queryClient.setQueryData([QUERY_KEYS.USERS], [{ id: 'user-1' }])
    expect(queryClient.getQueryData([QUERY_KEYS.USERS])).toBeDefined()

    await user.click(screen.getByText('Logout'))

    expect(queryClient.getQueryData([QUERY_KEYS.USERS])).toBeUndefined()
  })
})
