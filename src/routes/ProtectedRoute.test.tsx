import { screen } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import { STORAGE_KEYS } from '@/constants'
import { renderWithProviders } from '@/test/renderWithProviders'
import ProtectedRoute from './ProtectedRoute'
import GuestRoute from './GuestRoute'

function renderProtectedRoute(initialRoute: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<p>Login Page</p>} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<p>Dashboard</p>} />
      </Route>
    </Routes>,
    { route: initialRoute },
  )
}

function renderGuestRoute(initialRoute: string) {
  return renderWithProviders(
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<p>Login Page</p>} />
      </Route>
      <Route path="/dashboard" element={<p>Dashboard</p>} />
    </Routes>,
    { route: initialRoute },
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects to login when no token exists', () => {
    renderProtectedRoute('/dashboard')
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders child route when token exists', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token')
    renderProtectedRoute('/dashboard')
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})

describe('GuestRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders login page when not authenticated', () => {
    renderGuestRoute('/login')
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('redirects to dashboard when already authenticated', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token')
    renderGuestRoute('/login')
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
