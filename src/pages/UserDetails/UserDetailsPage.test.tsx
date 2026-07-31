import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthProvider } from '@/contexts/AuthProvider'
import { STORAGE_KEYS } from '@/constants'
import { buildUser } from '@/test/factories'
import { usersService } from '@/services/users.service'
import UserDetailsPage from './UserDetailsPage'

vi.mock('@/services/users.service')

const mockUser = buildUser({
  id: 'user-123',
  username: 'grace_effiom',
  email: 'grace@lendsqr.com',
  tier: 2,
})

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })
}

function renderUserDetails(userId = 'user-123') {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/users/${userId}`]}>
        <AuthProvider>
          <Routes>
            <Route path="/users/:id" element={<UserDetailsPage />} />
            <Route path="/users" element={<p>Users List</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('UserDetailsPage', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token')
    vi.mocked(usersService.getById).mockRejectedValue({
      message: 'User not found',
      status: 404,
    })
  })

  it('renders user details from localStorage', () => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_USER, JSON.stringify(mockUser))
    renderUserDetails()

    expect(screen.getByText('User Details')).toBeInTheDocument()
    expect(screen.getAllByText('Grace Effiom').length).toBeGreaterThan(0)
    expect(screen.getByText('₦200,000.00')).toBeInTheDocument()
  })

  it('renders back to users link', () => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_USER, JSON.stringify(mockUser))
    renderUserDetails()

    expect(screen.getByText('Back to Users')).toBeInTheDocument()
  })

  it('renders profile tabs', () => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_USER, JSON.stringify(mockUser))
    renderUserDetails()

    expect(
      screen.getByRole('tab', { name: 'General Details' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Documents' })).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: 'Bank Details' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Loans' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Savings' })).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: 'App and System' }),
    ).toBeInTheDocument()
  })

  it('renders general details by default', () => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_USER, JSON.stringify(mockUser))
    renderUserDetails()

    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText('Education and Employment')).toBeInTheDocument()
    expect(screen.getByText('Socials')).toBeInTheDocument()
    expect(screen.getByText('Guarantor')).toBeInTheDocument()
  })

  it('switches tabs correctly', async () => {
    const user = userEvent.setup()
    localStorage.setItem(STORAGE_KEYS.SELECTED_USER, JSON.stringify(mockUser))
    renderUserDetails()

    await user.click(screen.getByRole('tab', { name: 'Bank Details' }))
    expect(screen.getByText('Bank Information')).toBeInTheDocument()
  })

  it('renders tier stars', () => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_USER, JSON.stringify(mockUser))
    renderUserDetails()

    expect(screen.getByLabelText('Tier 2 of 3')).toBeInTheDocument()
  })

  it('shows error state when user not found', async () => {
    renderUserDetails('nonexistent-id')

    await waitFor(
      () => {
        expect(screen.getByText('User not found')).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  })

  it('renders blacklist and activate buttons', () => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_USER, JSON.stringify(mockUser))
    renderUserDetails()

    expect(
      screen.getByRole('button', { name: 'BLACKLIST USER' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'ACTIVATE USER' }),
    ).toBeInTheDocument()
  })
})
