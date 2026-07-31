import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { STORAGE_KEYS } from '@/constants'
import { usersService } from '@/services/users.service'
import { buildUser, buildUsers } from '@/test/factories'
import { renderWithProviders } from '@/test/renderWithProviders'
import UsersPage from './UsersPage'

vi.mock('@/services/users.service')

const mockedGetAll = vi.mocked(usersService.getAll)

function renderUsersPage(route = '/users') {
  return renderWithProviders(<UsersPage />, { route })
}

/** Search matches on full name too, so distinct names keep tests unambiguous. */
function namedUser(username: string, fullName: string) {
  const user = buildUser({ username })
  return { ...user, personalInfo: { ...user.personalInfo, fullName } }
}

/** Waits for the loading skeleton to be replaced by the loaded table. */
async function waitForUsers() {
  await waitFor(() => {
    expect(screen.getByText('ORGANIZATION')).toBeInTheDocument()
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
      expect(screen.queryByText('ORGANIZATION')).not.toBeInTheDocument()
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

    it('offers to clear filters when the query in the url excludes everyone', async () => {
      renderUsersPage('/users?q=zzzznonexistent')

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument()
      })
      expect(
        screen.getByRole('button', { name: 'Clear Filters' }),
      ).toBeInTheDocument()
    })

    it('restores the table when the query is cleared', async () => {
      const user = userEvent.setup()
      renderUsersPage('/users?q=zzzznonexistent')

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Clear Filters' }))

      await waitForUsers()
    })
  })

  describe('search from the url', () => {
    it('narrows the table to users matching the query', async () => {
      mockedGetAll.mockResolvedValue([
        namedUser('grace_effiom', 'Grace Effiom'),
        namedUser('tosin_dokunmu', 'Tosin Dokunmu'),
      ])
      renderUsersPage('/users?q=grace')

      await waitForUsers()
      expect(screen.getByText('grace_effiom')).toBeInTheDocument()
      expect(screen.queryByText('tosin_dokunmu')).not.toBeInTheDocument()
    })

    it('matches on email as well as username', async () => {
      mockedGetAll.mockResolvedValue([
        buildUser({ username: 'first', email: 'findme@lendsqr.com' }),
        buildUser({ username: 'second', email: 'other@lendsqr.com' }),
      ])
      renderUsersPage('/users?q=findme')

      await waitForUsers()
      expect(screen.getByText('first')).toBeInTheDocument()
      expect(screen.queryByText('second')).not.toBeInTheDocument()
    })

    it('ignores a blank query', async () => {
      renderUsersPage('/users?q=%20%20')

      await waitForUsers()
      expect(screen.queryByText('No results found')).not.toBeInTheDocument()
    })
  })

  describe('loaded state', () => {
    it('renders stat cards', async () => {
      renderUsersPage()
      await waitForUsers()

      expect(screen.getByText('USERS')).toBeInTheDocument()
      expect(screen.getByText('ACTIVE USERS')).toBeInTheDocument()
    })

    it('renders the column filter triggers', async () => {
      renderUsersPage()
      await waitForUsers()

      expect(
        screen.getByRole('button', { name: 'Filter by ORGANIZATION' }),
      ).toBeInTheDocument()
    })

    it('opens the filter panel from a column header', async () => {
      const user = userEvent.setup()
      renderUsersPage()
      await waitForUsers()

      await user.click(
        screen.getByRole('button', { name: 'Filter by ORGANIZATION' }),
      )

      expect(screen.getByLabelText('Organization')).toBeInTheDocument()
      expect(screen.getByLabelText('Username')).toBeInTheDocument()
    })

    it('narrows the table to users matching an applied filter', async () => {
      const user = userEvent.setup()
      mockedGetAll.mockResolvedValue([
        buildUser({ username: 'keeper', status: 'active' }),
        buildUser({ username: 'dropped', status: 'blacklisted' }),
      ])
      renderUsersPage()
      await waitForUsers()

      await user.click(
        screen.getByRole('button', { name: 'Filter by ORGANIZATION' }),
      )
      await user.selectOptions(screen.getByLabelText('Status'), 'active')
      await user.click(screen.getByRole('button', { name: 'Filter' }))

      await waitFor(() => {
        expect(screen.getByText('keeper')).toBeInTheDocument()
      })
      expect(screen.queryByText('dropped')).not.toBeInTheDocument()
    })

    it('persists the chosen user to localStorage on View Details', async () => {
      const user = userEvent.setup()
      const [firstUser] = buildUsers(1)
      mockedGetAll.mockResolvedValue([firstUser])
      renderUsersPage()
      await waitForUsers()

      await user.click(
        screen.getByRole('button', {
          name: `Actions for ${firstUser.username}`,
        }),
      )

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
