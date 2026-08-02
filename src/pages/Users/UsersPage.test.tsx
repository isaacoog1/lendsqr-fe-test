import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ERROR_MESSAGES, NO_RESPONSE } from '@/api/errors'
import { STORAGE_KEYS } from '@/constants'
import { usersService } from '@/services/users.service'
import {
  buildPaginatedUsers,
  buildUserStats,
  buildUserSummaries,
  buildUserSummary,
} from '@/test/factories'
import { renderWithProviders } from '@/test/renderWithProviders'
import UsersPage from './UsersPage'

vi.mock('@/services/users.service')

const mockedList = vi.mocked(usersService.list)
const mockedGetStats = vi.mocked(usersService.getStats)

/** What the client hands up when a request never reached the API. */
const unreachable = {
  message: ERROR_MESSAGES.unreachable,
  status: NO_RESPONSE,
}

function renderUsersPage(route = '/users') {
  return renderWithProviders(<UsersPage />, { route })
}

/** Waits for the loading skeleton to be replaced by the loaded table. */
async function waitForUsers() {
  await waitFor(() => {
    expect(screen.getByText('ORGANIZATION')).toBeInTheDocument()
  })
}

/**
 * The server does the filtering, sorting and paging now, so what is worth
 * asserting is the query the page asked it for.
 */
function lastQuery() {
  return mockedList.mock.calls.at(-1)?.[0]
}

async function waitForQuery(expected: Record<string, unknown>) {
  await waitFor(() => {
    expect(lastQuery()).toMatchObject(expected)
  })
}

describe('UsersPage', () => {
  beforeEach(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token')
    mockedList.mockReset()
    mockedGetStats.mockReset()
    mockedList.mockResolvedValue(
      buildPaginatedUsers(buildUserSummaries(20), { total: 25, totalPages: 2 }),
    )
    mockedGetStats.mockResolvedValue(buildUserStats())
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
      mockedList.mockRejectedValue(unreachable)
      renderUsersPage()

      await waitFor(() => {
        expect(screen.getByText('Failed to load users')).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
      expect(screen.queryByText('ORGANIZATION')).not.toBeInTheDocument()
    })

    // A hardcoded "check your connection" would send a user to reboot a router
    // that is working fine while the API is the thing that is down.
    it('reports what actually failed instead of a fixed message', async () => {
      mockedList.mockRejectedValue(unreachable)
      renderUsersPage()

      expect(
        await screen.findByText(ERROR_MESSAGES.unreachable),
      ).toBeInTheDocument()
    })

    it('surfaces the message the server sent for an HTTP error', async () => {
      mockedList.mockRejectedValue({
        message:
          'status must be one of: active, inactive, pending, blacklisted',
        status: 400,
      })
      renderUsersPage()

      expect(
        await screen.findByText(
          'status must be one of: active, inactive, pending, blacklisted',
        ),
      ).toBeInTheDocument()
    })

    // The cards and the table come from different endpoints; either one
    // failing leaves the page unable to say what it claims to say.
    it('reports a failure of the stats endpoint too', async () => {
      mockedGetStats.mockRejectedValue(unreachable)
      renderUsersPage()

      await waitFor(() => {
        expect(screen.getByText('Failed to load users')).toBeInTheDocument()
      })
    })

    it('refetches when Retry is pressed, and recovers', async () => {
      const user = userEvent.setup()
      mockedList.mockRejectedValueOnce(unreachable)
      renderUsersPage()

      await waitFor(() => {
        expect(screen.getByText('Failed to load users')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Retry' }))

      await waitForUsers()
      expect(mockedList).toHaveBeenCalledTimes(2)
    })
  })

  describe('empty state', () => {
    it('explains that there is no data when the endpoint returns none', async () => {
      mockedList.mockResolvedValue(buildPaginatedUsers([], { total: 0 }))
      renderUsersPage()

      await waitFor(() => {
        expect(screen.getByText('No users found')).toBeInTheDocument()
      })
      expect(
        screen.queryByRole('button', { name: 'Clear Filters' }),
      ).not.toBeInTheDocument()
    })

    // Dropping the table would take the filter controls with it, leaving the
    // user holding a query they can no longer edit.
    it('keeps the table and its filters when nothing matched', async () => {
      mockedList.mockResolvedValue(buildPaginatedUsers([], { total: 0 }))
      renderUsersPage('/users?status=blacklisted')

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument()
      })
      expect(screen.getByText('ORGANIZATION')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /Filter by ORGANIZATION/ }),
      ).toBeInTheDocument()
    })

    it('offers to clear filters when the query excludes everyone', async () => {
      mockedList.mockResolvedValue(buildPaginatedUsers([], { total: 0 }))
      renderUsersPage('/users?q=zzzznonexistent')

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument()
      })
      expect(
        screen.getByRole('button', { name: 'Clear Filters' }),
      ).toBeInTheDocument()
    })

    it('drops both the search and the filters when they are cleared', async () => {
      const user = userEvent.setup()
      mockedList.mockResolvedValue(buildPaginatedUsers([], { total: 0 }))
      renderUsersPage('/users?q=zzzznonexistent&status=active')

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Clear Filters' }))

      await waitForQuery({ search: undefined, status: undefined })
    })
  })

  describe('search', () => {
    it('forwards the url query to the endpoint', async () => {
      renderUsersPage('/users?q=grace')

      await waitForQuery({ search: 'grace' })
    })

    it('ignores a blank query', async () => {
      renderUsersPage('/users?q=%20%20')

      await waitForUsers()
      expect(lastQuery()?.search).toBeUndefined()
    })
  })

  describe('filtering', () => {
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

    // Without the stats endpoint listing them, populating this dropdown would
    // mean loading all 500 users just to collect ten distinct names.
    it('offers the organizations the stats endpoint reported', async () => {
      const user = userEvent.setup()
      renderUsersPage()
      await waitForUsers()

      await user.click(
        screen.getByRole('button', { name: 'Filter by ORGANIZATION' }),
      )

      const select = screen.getByLabelText('Organization')
      expect(
        within(select).getByRole('option', { name: 'Lendstar' }),
      ).toBeInTheDocument()
    })

    it('asks the endpoint for the applied filter', async () => {
      const user = userEvent.setup()
      renderUsersPage()
      await waitForUsers()

      await user.click(
        screen.getByRole('button', { name: 'Filter by ORGANIZATION' }),
      )
      await user.selectOptions(screen.getByLabelText('Status'), 'active')
      await user.click(screen.getByRole('button', { name: 'Filter' }))

      await waitForQuery({ status: 'active' })
    })

    // Applying a filter while deep in the list would otherwise land on a page
    // the narrowed result set no longer has.
    it('returns to the first page when a filter is applied', async () => {
      const user = userEvent.setup()
      renderUsersPage('/users?page=2')
      await waitForUsers()

      await user.click(
        screen.getByRole('button', { name: 'Filter by ORGANIZATION' }),
      )
      await user.selectOptions(screen.getByLabelText('Status'), 'active')
      await user.click(screen.getByRole('button', { name: 'Filter' }))

      await waitForQuery({ status: 'active', page: 1 })
    })

    it('seeds the panel with what is already applied', async () => {
      const user = userEvent.setup()
      renderUsersPage('/users?username=grace')
      await waitForUsers()

      await user.click(
        screen.getByRole('button', { name: /Filter by ORGANIZATION/ }),
      )

      expect(screen.getByLabelText('Username')).toHaveValue('grace')
    })
  })

  describe('paging and sorting', () => {
    it('asks the endpoint for the chosen page', async () => {
      const user = userEvent.setup()
      renderUsersPage()
      await waitForUsers()

      await user.click(screen.getByLabelText('Page 2'))

      await waitForQuery({ page: 2 })
    })

    it('asks the endpoint to sort on the chosen column', async () => {
      const user = userEvent.setup()
      renderUsersPage()
      await waitForUsers()

      await user.click(screen.getByRole('button', { name: 'EMAIL' }))

      await waitForQuery({ sortBy: 'email', sortOrder: 'asc' })
    })

    it('returns to the first page when the sort changes', async () => {
      const user = userEvent.setup()
      renderUsersPage('/users?page=2')
      await waitForUsers()

      await user.click(screen.getByRole('button', { name: 'EMAIL' }))

      await waitForQuery({ sortBy: 'email', page: 1 })
    })
  })

  describe('stat cards', () => {
    it('reports platform totals from the stats endpoint', async () => {
      mockedGetStats.mockResolvedValue(
        buildUserStats({ totalUsers: 500, activeUsers: 122 }),
      )
      renderUsersPage()
      await waitForUsers()

      expect(screen.getByText('USERS')).toBeInTheDocument()
      expect(screen.getByText('500')).toBeInTheDocument()
      expect(screen.getByText('122')).toBeInTheDocument()
    })

    // The cards describe the platform, the table describes the query. Cards
    // that moved with the filter would be making a different claim.
    it('does not move when the table is filtered', async () => {
      renderUsersPage('/users?status=active')
      await waitForUsers()

      expect(screen.getByText('500')).toBeInTheDocument()
    })
  })

  describe('persistence', () => {
    it('records the chosen user on View Details', async () => {
      const user = userEvent.setup()
      const target = buildUserSummary({ id: 'user-42', username: 'grace' })
      mockedList.mockResolvedValue(buildPaginatedUsers([target]))
      renderUsersPage()
      await waitForUsers()

      await user.click(
        screen.getByRole('button', { name: 'Actions for grace' }),
      )

      await waitFor(() => {
        expect(screen.getByText('View Details')).toBeInTheDocument()
      })
      await user.click(screen.getByText('View Details'))

      const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_USER)
      expect(JSON.parse(stored!).id).toBe('user-42')
    })
  })
})
