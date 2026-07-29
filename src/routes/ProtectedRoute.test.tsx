import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import { STORAGE_KEYS } from '@/constants'
import ProtectedRoute from './ProtectedRoute'

function renderWithRouter(initialRoute: string) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<p>Login Page</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<p>Dashboard</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects to login when no token exists', () => {
    renderWithRouter('/dashboard')
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders child route when token exists', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token')
    renderWithRouter('/dashboard')
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
