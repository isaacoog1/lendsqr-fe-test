import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ERROR_MESSAGES, NO_RESPONSE } from '@/api/errors'
import { STORAGE_KEYS } from '@/constants'
import { buildUser } from '@/test/factories'
import { usersService } from '@/services/users.service'
import { renderWithProviders } from '@/test/renderWithProviders'
import UserDetailsPage from './UserDetailsPage'

vi.mock('@/services/users.service')

const mockedGetById = vi.mocked(usersService.getById)

/** What the client hands up when a request never reached the API. */
const unreachable = {
  message: ERROR_MESSAGES.unreachable,
  status: NO_RESPONSE,
}

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

/** Records a selection the way the users table does before navigating. */
function selectUser(user = mockUser) {
  const { id, organization, username, email, phoneNumber, dateJoined, status } =
    user

  localStorage.setItem(
    STORAGE_KEYS.SELECTED_USER,
    JSON.stringify({
      id,
      organization,
      username,
      email,
      phoneNumber,
      dateJoined,
      status,
    }),
  )
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

  // The list endpoint carries a summary per user — no personal details, bank
  // details or tier — so the full record is always fetched.
  describe('the stored selection', () => {
    it('fetches even when the selected user matches the route', async () => {
      selectUser()
      mockedGetById.mockResolvedValue(mockUser)
      renderUserDetails()

      await waitFor(() => {
        expect(mockedGetById).toHaveBeenCalledWith('user-123')
      })
    })

    it('names the user in the loading skeleton', () => {
      selectUser()
      mockedGetById.mockReturnValue(new Promise(() => {}))
      renderUserDetails()

      expect(
        screen.getByRole('status', { name: 'Loading grace_effiom' }),
      ).toBeInTheDocument()
    })

    it('falls back to a generic label when the selection is someone else', () => {
      selectUser(buildUser({ id: 'someone-else', username: 'other' }))
      mockedGetById.mockReturnValue(new Promise(() => {}))
      renderUserDetails('user-123')

      expect(
        screen.getByRole('status', { name: 'Loading user details' }),
      ).toBeInTheDocument()
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

    it('renders the fetched record', async () => {
      mockedGetById.mockResolvedValue(mockUser)
      renderUserDetails()

      await waitFor(() => {
        expect(screen.getByText('User Details')).toBeInTheDocument()
      })
      expect(screen.getAllByText('Grace Effiom').length).toBeGreaterThan(0)
    })

    it('renders the account balance and tier from the full record', async () => {
      mockedGetById.mockResolvedValue(mockUser)
      renderUserDetails()

      await waitFor(() => {
        expect(screen.getByText('₦200,000.00')).toBeInTheDocument()
      })
      expect(screen.getByLabelText('Tier 2 of 3')).toBeInTheDocument()
    })

    it('shows an error state when the user does not exist', async () => {
      renderUserDetails('nonexistent-id')

      await waitFor(() => {
        expect(screen.getByText('User not found')).toBeInTheDocument()
      })
      expect(screen.getAllByText('Back to Users').length).toBeGreaterThan(0)
    })

    it('does not offer a retry for a record that does not exist', async () => {
      renderUserDetails('nonexistent-id')

      await waitFor(() => {
        expect(screen.getByText('User not found')).toBeInTheDocument()
      })
      expect(
        screen.queryByRole('button', { name: 'Retry' }),
      ).not.toBeInTheDocument()
    })

    it('offers a retry when the request failed rather than the user missing', async () => {
      mockedGetById.mockRejectedValue(unreachable)
      renderUserDetails()

      await waitFor(() => {
        expect(screen.getByText('Failed to load user')).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
      expect(screen.queryByText('User not found')).not.toBeInTheDocument()
    })

    // The reason the request failed is the one thing the user can act on, and
    // an unreachable API is not the same problem as a dead connection.
    it('names the failure rather than showing a fixed message', async () => {
      mockedGetById.mockRejectedValue(unreachable)
      renderUserDetails()

      expect(
        await screen.findByText(ERROR_MESSAGES.unreachable),
      ).toBeInTheDocument()
    })

    it('refetches when Retry is pressed, and recovers', async () => {
      const user = userEvent.setup()
      mockedGetById.mockRejectedValueOnce(unreachable)
      renderUserDetails()

      await waitFor(() => {
        expect(screen.getByText('Failed to load user')).toBeInTheDocument()
      })

      mockedGetById.mockResolvedValue(mockUser)
      await user.click(screen.getByRole('button', { name: 'Retry' }))

      await waitFor(() => {
        expect(screen.getByText('User Details')).toBeInTheDocument()
      })
    })
  })

  describe('tabs', () => {
    beforeEach(async () => {
      mockedGetById.mockResolvedValue(mockUser)
      renderUserDetails()
      await screen.findByText('User Details')
    })

    it('renders every section tab', () => {
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
      expect(screen.getByText('Personal Information')).toBeInTheDocument()
      expect(screen.getByText('Education and Employment')).toBeInTheDocument()
      expect(screen.getByText('Socials')).toBeInTheDocument()
      expect(screen.getByText('Guarantor')).toBeInTheDocument()
    })

    it('swaps the panel when another tab is selected', async () => {
      const user = userEvent.setup()

      await user.click(screen.getByRole('tab', { name: 'Bank Details' }))

      expect(screen.getByText('Bank Information')).toBeInTheDocument()
      expect(screen.queryByText('Personal Information')).not.toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('renders blacklist and activate buttons', async () => {
      mockedGetById.mockResolvedValue(mockUser)
      renderUserDetails()
      await screen.findByText('User Details')

      expect(
        screen.getByRole('button', { name: 'BLACKLIST USER' }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'ACTIVATE USER' }),
      ).toBeInTheDocument()
    })
  })
})
