import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { STORAGE_KEYS } from '@/constants'
import { usersService } from '@/services/users.service'
import {
  buildPaginatedUsers,
  buildUserStats,
  buildUserSummary,
} from '@/test/factories'
import { renderWithProviders } from '@/test/renderWithProviders'
import DashboardPage from './DashboardPage'

vi.mock('@/services/users.service')

const mockedList = vi.mocked(usersService.list)
const mockedGetStats = vi.mocked(usersService.getStats)

function renderDashboard() {
  return renderWithProviders(<DashboardPage />, { route: '/dashboard' })
}

/** Waits for the loading skeleton to be replaced by the loaded dashboard. */
async function waitForDashboard() {
  await waitFor(() => {
    expect(
      screen.getByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
  })
}

function panel(name: string) {
  return screen.getByRole('region', { name })
}

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.clear()
    mockedList.mockReset()
    mockedGetStats.mockReset()
    mockedList.mockResolvedValue(buildPaginatedUsers())
    mockedGetStats.mockResolvedValue(buildUserStats())
  })

  describe('loading state', () => {
    it('announces the skeleton to assistive technology', () => {
      renderDashboard()

      expect(
        screen.getByRole('status', { name: 'Loading dashboard' }),
      ).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('shows a retry affordance when the stats request fails', async () => {
      mockedGetStats.mockRejectedValue({ message: 'Network Error', status: 0 })
      renderDashboard()

      await waitFor(() => {
        expect(screen.getByText('Failed to load users')).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    })

    it('shows a retry affordance when the recent-users request fails', async () => {
      mockedList.mockRejectedValue({ message: 'Network Error', status: 0 })
      renderDashboard()

      await waitFor(() => {
        expect(screen.getByText('Failed to load users')).toBeInTheDocument()
      })
    })

    it('refetches when Retry is pressed', async () => {
      const user = userEvent.setup()
      mockedGetStats.mockRejectedValueOnce({
        message: 'Network Error',
        status: 0,
      })
      renderDashboard()

      await waitFor(() => {
        expect(screen.getByText('Failed to load users')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Retry' }))

      await waitForDashboard()
      expect(mockedGetStats).toHaveBeenCalledTimes(2)
    })
  })

  describe('empty state', () => {
    it('explains the absence of data without a spinner', async () => {
      mockedGetStats.mockResolvedValue(buildUserStats({ totalUsers: 0 }))
      mockedList.mockResolvedValue(buildPaginatedUsers([], { total: 0 }))
      renderDashboard()

      await waitFor(() => {
        expect(screen.getByText('No users found')).toBeInTheDocument()
      })
      // A spinner beside "no users" claims the app is finished and still
      // working at the same time.
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  describe('stat cards', () => {
    it('renders the four headline figures', async () => {
      renderDashboard()
      await waitForDashboard()

      expect(screen.getByText('USERS')).toBeInTheDocument()
      expect(screen.getByText('ACTIVE USERS')).toBeInTheDocument()
      expect(screen.getByText('USERS WITH LOANS')).toBeInTheDocument()
      expect(screen.getByText('USERS WITH SAVINGS')).toBeInTheDocument()
    })

    it('reports the counts the stats endpoint returned', async () => {
      mockedGetStats.mockResolvedValue(
        buildUserStats({ usersWithLoans: 191, usersWithSavings: 289 }),
      )
      renderDashboard()
      await waitForDashboard()

      expect(
        screen.getByText('USERS WITH LOANS').closest('div'),
      ).toHaveTextContent('191')
      expect(
        screen.getByText('USERS WITH SAVINGS').closest('div'),
      ).toHaveTextContent('289')
    })
  })

  describe('status breakdown', () => {
    it('reports the count and share of each status', async () => {
      mockedGetStats.mockResolvedValue(
        buildUserStats({
          statusBreakdown: [
            { status: 'active', count: 2, percentage: 50 },
            { status: 'inactive', count: 0, percentage: 0 },
            { status: 'pending', count: 1, percentage: 25 },
            { status: 'blacklisted', count: 1, percentage: 25 },
          ],
        }),
      )
      renderDashboard()
      await waitForDashboard()

      const region = panel('Users by status')
      expect(within(region).getByText('50%')).toBeInTheDocument()
      expect(within(region).getAllByText('25%')).toHaveLength(2)
      expect(within(region).getByText('0%')).toBeInTheDocument()
    })

    it('lists every status the endpoint reported, including empty ones', async () => {
      renderDashboard()
      await waitForDashboard()

      const region = panel('Users by status')
      expect(within(region).getByText('Inactive')).toBeInTheDocument()
      expect(within(region).getByText('Blacklisted')).toBeInTheDocument()
    })
  })

  describe('top organizations', () => {
    it('renders them in the order the endpoint ranked them', async () => {
      mockedGetStats.mockResolvedValue(
        buildUserStats({
          topOrganizations: [
            { organization: 'Lendsqr', count: 63 },
            { organization: 'Irorun', count: 12 },
          ],
        }),
      )
      renderDashboard()
      await waitForDashboard()

      const region = panel('Top organizations')
      const names = within(region)
        .getAllByRole('listitem')
        .map((item) => item.textContent)

      expect(names[0]).toContain('Lendsqr')
      expect(names[1]).toContain('Irorun')
    })
  })

  describe('recently joined', () => {
    // Sorting and slicing are the endpoint's job now, so what matters is that
    // the page asks for the right five.
    it('asks for the five newest sign-ups', async () => {
      renderDashboard()
      await waitForDashboard()

      expect(mockedList).toHaveBeenCalledWith({
        sortBy: 'dateJoined',
        sortOrder: 'desc',
        perPage: 5,
      })
    })

    it('renders them in the order they arrived', async () => {
      mockedList.mockResolvedValue(
        buildPaginatedUsers([
          buildUserSummary({ username: 'newest_signup' }),
          buildUserSummary({ username: 'older_signup' }),
        ]),
      )
      renderDashboard()
      await waitForDashboard()

      const region = panel('Recently joined')
      const [first] = within(region).getAllByRole('listitem')
      expect(first).toHaveTextContent('newest_signup')
    })

    it('links each row to that user and records the selection', async () => {
      const user = userEvent.setup()
      mockedList.mockResolvedValue(
        buildPaginatedUsers([buildUserSummary({ id: 'user-42' })]),
      )
      renderDashboard()
      await waitForDashboard()

      const region = panel('Recently joined')
      const [firstRow] = within(region).getAllByRole('listitem')
      const link = within(firstRow).getByRole('link')
      expect(link).toHaveAttribute('href', '/users/user-42')

      await user.click(link)
      expect(
        JSON.parse(localStorage.getItem(STORAGE_KEYS.SELECTED_USER)!).id,
      ).toBe('user-42')
    })

    it('offers a route through to the full list', async () => {
      renderDashboard()
      await waitForDashboard()

      expect(
        screen.getByRole('link', { name: 'View all users' }),
      ).toHaveAttribute('href', '/users')
    })
  })

  describe('separation from the users page', () => {
    it('does not duplicate the users table', async () => {
      renderDashboard()
      await waitForDashboard()

      expect(screen.queryByRole('table')).not.toBeInTheDocument()
      expect(screen.queryByText('ORGANIZATION')).not.toBeInTheDocument()
    })
  })
})
