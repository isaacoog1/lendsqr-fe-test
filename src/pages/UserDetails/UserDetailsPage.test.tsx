import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { STORAGE_KEYS } from '@/constants'
import { buildUser } from '@/test/factories'
import { usersService } from '@/services/users.service'
import { renderWithProviders } from '@/test/renderWithProviders'
import UserDetailsPage from './UserDetailsPage'

vi.mock('@/services/users.service')

const mockedGetById = vi.mocked(usersService.getById)

const mockUser = buildUser({
  id: 'user-123',
  username: 'grace_effiom',
  email: 'grace@lendsqr.com',
  tier: 2,
})

function renderUserDetails(userId = 'user-123') {
  return renderWithProviders(
    <Routes>
      <Route path="/users/:id" element={<UserDetailsPage />} />
      <Route path="/users" element={<p>Users List</p>} />
    </Routes>,
    { route: `/users/${userId}` },
  )
}

/** Seeds the cache the users table writes to before navigating. */
function cacheSelectedUser() {
  localStorage.setItem(STORAGE_KEYS.SELECTED_USER, JSON.stringify(mockUser))
}

describe('UserDetailsPage', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token')
    mockedGetById.mockReset()
    mockedGetById.mockRejectedValue({
      message: 'User not found',
      status: 404,
    })
  })

  describe('from the local cache', () => {
    it('renders immediately without a request', () => {
      cacheSelectedUser()
      renderUserDetails()

      expect(screen.getByText('User Details')).toBeInTheDocument()
      expect(screen.getAllByText('Grace Effiom').length).toBeGreaterThan(0)
      expect(mockedGetById).not.toHaveBeenCalled()
    })

    it('renders the account balance and tier', () => {
      cacheSelectedUser()
      renderUserDetails()

      expect(screen.getByText('₦200,000.00')).toBeInTheDocument()
      expect(screen.getByLabelText('Tier 2 of 3')).toBeInTheDocument()
    })

    it('ignores a cached user whose id does not match the route', async () => {
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_USER,
        JSON.stringify(buildUser({ id: 'someone-else' })),
      )
      mockedGetById.mockResolvedValue(mockUser)
      renderUserDetails('user-123')

      await waitFor(() => {
        expect(mockedGetById).toHaveBeenCalledWith('user-123')
      })
    })
  })

  describe('from the endpoint', () => {
    it('shows the loading skeleton while fetching', () => {
      mockedGetById.mockReturnValue(new Promise(() => {}))
      renderUserDetails()

      expect(
        screen.getByRole('status', { name: 'Loading user details' }),
      ).toBeInTheDocument()
    })

    it('renders the fetched user when nothing is cached', async () => {
      mockedGetById.mockResolvedValue(mockUser)
      renderUserDetails()

      await waitFor(() => {
        expect(screen.getByText('User Details')).toBeInTheDocument()
      })
      expect(screen.getAllByText('Grace Effiom').length).toBeGreaterThan(0)
    })

    it('shows an error state when the user does not exist', async () => {
      renderUserDetails('nonexistent-id')

      await waitFor(() => {
        expect(screen.getByText('User not found')).toBeInTheDocument()
      })
      expect(screen.getAllByText('Back to Users').length).toBeGreaterThan(0)
    })
  })

  describe('tabs', () => {
    beforeEach(cacheSelectedUser)

    it('renders every section tab', () => {
      renderUserDetails()

      const labels = [
        'General Details',
        'Documents',
        'Bank Details',
        'Loans',
        'Savings',
        'App and System',
      ]
      for (const label of labels) {
        expect(screen.getByRole('tab', { name: label })).toBeInTheDocument()
      }
    })

    it('renders general details by default', () => {
      renderUserDetails()

      expect(screen.getByText('Personal Information')).toBeInTheDocument()
      expect(screen.getByText('Education and Employment')).toBeInTheDocument()
      expect(screen.getByText('Socials')).toBeInTheDocument()
      expect(screen.getByText('Guarantor')).toBeInTheDocument()
    })

    it('swaps the panel when another tab is selected', async () => {
      const user = userEvent.setup()
      renderUserDetails()

      await user.click(screen.getByRole('tab', { name: 'Bank Details' }))

      expect(screen.getByText('Bank Information')).toBeInTheDocument()
      expect(screen.queryByText('Personal Information')).not.toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('renders blacklist and activate buttons', () => {
      cacheSelectedUser()
      renderUserDetails()

      expect(
        screen.getByRole('button', { name: 'BLACKLIST USER' }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'ACTIVATE USER' }),
      ).toBeInTheDocument()
    })
  })
})
