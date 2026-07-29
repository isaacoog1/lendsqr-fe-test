import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, beforeEach } from 'vitest'
import { queryClient } from '@/config/queryClient'
import { AuthProvider } from '@/contexts/AuthProvider'
import LoginPage from './LoginPage'

function renderLoginPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
    queryClient.clear()
  })

  it('renders the login form', () => {
    renderLoginPage()
    expect(screen.getByText('Welcome!')).toBeInTheDocument()
    expect(screen.getByText('Enter details to login.')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
  })

  it('shows validation errors for empty submission', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByPlaceholderText('Email'), 'not-an-email')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
  })

  it('renders forgot password link', () => {
    renderLoginPage()
    expect(screen.getByText('FORGOT PASSWORD?')).toBeInTheDocument()
  })

  it('shows password toggle button', () => {
    renderLoginPage()
    expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument()
  })
})
