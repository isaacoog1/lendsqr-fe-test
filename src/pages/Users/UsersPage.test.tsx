import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { STORAGE_KEYS } from '@/constants'
import { usersService } from '@/services/users.service'
import { buildUsers } from '@/test/factories'
import { renderWithProviders } from '@/test/renderWithProviders'
import UsersPage from './UsersPage'

vi.mock('@/services/users.service')

const mockedGetAll = vi.mocked(usersService.getAll)

function renderUsersPage() {
  return renderWithProviders(<UsersPage />)
}

/** Waits for the loading skeleton to be replaced by the loaded page. */
async function waitForUsers() {
  await waitFor(() => {
    expect(screen.getByLabelText('Search users')).toBeInTheDocument()
  })
}

describe('UsersPage', () => {
  beforeEach(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token')
    mockedGetAll.mockReset()
    mockedGetAll.mockResolvedValue(buildUsers(25))
  })

  describe('loading state', () => {
    it('announces the skeleton to assistive technology', () => {
      renderUsersPage()

      expect(
        screen.getByRole('status', { name: 'Loading users' }),
      ).toBeInTheDocument()
    })

    it('replaces the skeleton once the data arrives', async () => {
      renderUsersPage()

      await waitForUsers()
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('shows a retry affordance instead of an empty table', async () => {
      mockedGetAll.mockRejectedValue({ message: 'Network Error', status: 0 })
      renderUsersPage()

      await waitFor(() => {
        expect(screen.getByText('Failed to load users')).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
      expect(screen.queryByLabelText('Search users')).not.toBeInTheDocument()
    })

    it('refetches when Retry is pressed, and recovers', async () => {
      const user = userEvent.setup()
      mockedGetAll.mockRejectedValueOnce({
        message: 'Network Error',
        status: 0,
      })
      renderUsersPage()

      await waitFor(() => {
        expect(screen.getByText('Failed to load users')).toBeInTheDocument()
      })

      mockedGetAll.mockResolvedValue(buildUsers(3))
      await user.click(screen.getByRole('button', { name: 'Retry' }))

      await waitForUsers()
      expect(mockedGetAll).toHaveBeenCalledTimes(2)
    })
  })

  describe('empty state', () => {
    it('explains that there is no data when the endpoint returns none', async () => {
      mockedGetAll.mockResolvedValue([])
      renderUsersPage()

      await waitFor(() => {
        expect(screen.getByText('No users found')).toBeInTheDocument()
      })
      expect(
        screen.queryByRole('button', { name: 'Clear Filters' }),
      ).not.toBeInTheDocument()
    })

    it('offers to clear filters when a search excludes every user', async () => {
      const user = userEvent.setup()
      renderUsersPage()
      await waitForUsers()

      await user.type(screen.getByLabelText('Search users'), 'zzzznonexistent')

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument()
      })
      expect(
        screen.getByRole('button', { name: 'Clear Filters' }),
      ).toBeInTheDocument()
    })

    it('restores the table when the filters are cleared', async () => {
      const user = userEvent.setup()
      renderUsersPage()
      await waitForUsers()

      await user.type(screen.getByLabelText('Search users'), 'zzzznonexistent')
      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Clear Filters' }))

      await waitFor(() => {
        expect(screen.getByText('ORGANIZATION')).toBeInTheDocument()
      })
    })
  })

  describe('loaded state', () => {
    it('renders stat cards', async () => {
      renderUsersPage()
      await waitForUsers()

      expect(screen.getByText('USERS')).toBeInTheDocument()
      expect(screen.getByText('ACTIVE USERS')).toBeInTheDocument()
    })

    it('renders the search input and filter button', async () => {
      renderUsersPage()
      await waitForUsers()

      expect(screen.getByLabelText('Search users')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Filter' })).toBeInTheDocument()
    })

    it('opens the filter panel when the filter button is clicked', async () => {
      const user = userEvent.setup()
      renderUsersPage()
      await waitForUsers()

      await user.click(screen.getByRole('button', { name: 'Filter' }))

      expect(screen.getByLabelText('Organization')).toBeInTheDocument()
      expect(screen.getByLabelText('Username')).toBeInTheDocument()
    })

    it('persists the chosen user to localStorage on View Details', async () => {
      const user = userEvent.setup()
      const [firstUser] = buildUsers(1)
      mockedGetAll.mockResolvedValue([firstUser])
      renderUsersPage()
      await waitForUsers()

      const actionButtons = screen.getAllByRole('button', { name: '' })
      await user.click(actionButtons[0])

      await waitFor(() => {
        expect(screen.getByText('View Details')).toBeInTheDocument()
      })
      await user.click(screen.getByText('View Details'))

      const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_USER)
      expect(stored).not.toBeNull()
      expect(JSON.parse(stored!).id).toBe(firstUser.id)
    })
  })
})
