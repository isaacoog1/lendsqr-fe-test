import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import { DEMO_CREDENTIALS, STORAGE_KEYS } from '@/constants'
import { renderWithProviders } from '@/test/renderWithProviders'
import LoginPage from './LoginPage'

function renderLoginPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<h1>Dashboard</h1>} />
    </Routes>,
  )
}

async function submitCredentials(email: string, password: string) {
  const user = userEvent.setup()
  await user.type(screen.getByPlaceholderText('Email'), email)
  await user.type(screen.getByPlaceholderText('Password'), password)
  await user.click(screen.getByRole('button', { name: /log in/i }))
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('rendering', () => {
    it('renders the login form', () => {
      renderLoginPage()
      expect(screen.getByText('Welcome!')).toBeInTheDocument()
      expect(screen.getByText('Enter details to login.')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    })

    it('renders forgot password link', () => {
      renderLoginPage()
      expect(screen.getByText('FORGOT PASSWORD?')).toBeInTheDocument()
    })

    it('shows password toggle button', () => {
      renderLoginPage()
      expect(
        screen.getByRole('button', { name: 'Show password' }),
      ).toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('shows validation errors for empty submission', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      await user.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid email address'),
        ).toBeInTheDocument()
      })
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })

    it('shows validation error for invalid email', async () => {
      renderLoginPage()

      await submitCredentials('not-an-email', 'password123')

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid email address'),
        ).toBeInTheDocument()
      })
    })

    it('does not attempt a login when validation fails', async () => {
      renderLoginPage()

      await submitCredentials('not-an-email', 'password123')

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid email address'),
        ).toBeInTheDocument()
      })
      expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull()
    })
  })

  describe('submission', () => {
    it('stores a token and navigates to the dashboard on success', async () => {
      renderLoginPage()

      await submitCredentials(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password)

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Dashboard' }),
        ).toBeInTheDocument()
      })
      expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).not.toBeNull()
    })

    it('shows an error and stays on the form when credentials are rejected', async () => {
      renderLoginPage()

      await submitCredentials(DEMO_CREDENTIALS.email, 'wrong-password')

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Incorrect email or password.',
        )
      })
      expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull()
      expect(
        screen.queryByRole('heading', { name: 'Dashboard' }),
      ).not.toBeInTheDocument()
    })

    it('accepts the demo email regardless of casing or padding', async () => {
      renderLoginPage()

      await submitCredentials(
        `  ${DEMO_CREDENTIALS.email.toUpperCase()}  `,
        DEMO_CREDENTIALS.password,
      )

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Dashboard' }),
        ).toBeInTheDocument()
      })
    })
  })
})
