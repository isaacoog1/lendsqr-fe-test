import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { STORAGE_KEYS } from '@/constants'
import { usersService } from '@/services/users.service'
import { buildUser, buildUsers } from '@/test/factories'
import { renderWithProviders } from '@/test/renderWithProviders'
import DashboardPage from './DashboardPage'

vi.mock('@/services/users.service')

const mockedGetAll = vi.mocked(usersService.getAll)

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
    mockedGetAll.mockReset()
    mockedGetAll.mockResolvedValue(buildUsers(25))
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
    it('shows a retry affordance when the request fails', async () => {
      mockedGetAll.mockRejectedValue({ message: 'Network Error', status: 0 })
      renderDashboard()

      await waitFor(() => {
        expect(screen.getByText('Failed to load users')).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    })

    it('refetches when Retry is pressed', async () => {
      const user = userEvent.setup()
      mockedGetAll.mockRejectedValueOnce({
        message: 'Network Error',
        status: 0,
      })
      renderDashboard()

      await waitFor(() => {
        expect(screen.getByText('Failed to load users')).toBeInTheDocument()
      })

      mockedGetAll.mockResolvedValue(buildUsers(3))
      await user.click(screen.getByRole('button', { name: 'Retry' }))

      await waitForDashboard()
      expect(mockedGetAll).toHaveBeenCalledTimes(2)
    })
  })

  describe('empty state', () => {
    it('explains the absence of data without a spinner', async () => {
      mockedGetAll.mockResolvedValue([])
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

    it('counts loans and savings from the data rather than a fixed ratio', async () => {
      mockedGetAll.mockResolvedValue([
        buildUser({ hasLoan: true, hasSavings: true }),
        buildUser({ hasLoan: true, hasSavings: false }),
        buildUser({ hasLoan: false, hasSavings: false }),
        buildUser({ hasLoan: false, hasSavings: false }),
      ])
      renderDashboard()
      await waitForDashboard()

      expect(
        screen.getByText('USERS WITH LOANS').closest('div'),
      ).toHaveTextContent('2')
      expect(
        screen.getByText('USERS WITH SAVINGS').closest('div'),
      ).toHaveTextContent('1')
    })
  })

  describe('status breakdown', () => {
    it('reports the count and share of each status', async () => {
      mockedGetAll.mockResolvedValue([
        buildUser({ status: 'active' }),
        buildUser({ status: 'active' }),
        buildUser({ status: 'pending' }),
        buildUser({ status: 'blacklisted' }),
      ])
      renderDashboard()
      await waitForDashboard()

      const region = panel('Users by status')
      expect(within(region).getByText('50%')).toBeInTheDocument()
      expect(within(region).getAllByText('25%')).toHaveLength(2)
      expect(within(region).getByText('0%')).toBeInTheDocument()
    })

    it('lists every status even when none match', async () => {
      mockedGetAll.mockResolvedValue([buildUser({ status: 'active' })])
      renderDashboard()
      await waitForDashboard()

      const region = panel('Users by status')
      expect(within(region).getByText('Inactive')).toBeInTheDocument()
      expect(within(region).getByText('Blacklisted')).toBeInTheDocument()
    })
  })

  describe('top organizations', () => {
    it('ranks organizations by user count', async () => {
      mockedGetAll.mockResolvedValue([
        buildUser({ organization: 'Lendsqr' }),
        buildUser({ organization: 'Lendsqr' }),
        buildUser({ organization: 'Irorun' }),
      ])
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
    it('lists the newest users first', async () => {
      mockedGetAll.mockResolvedValue([
        buildUser({
          dateJoined: '2020-01-01T00:00:00.000Z',
          personalInfo: {
            ...buildUser().personalInfo,
            fullName: 'Older Signup',
          },
        }),
        buildUser({
          dateJoined: '2024-01-01T00:00:00.000Z',
          personalInfo: {
            ...buildUser().personalInfo,
            fullName: 'Newer Signup',
          },
        }),
      ])
      renderDashboard()
      await waitForDashboard()

      const region = panel('Recently joined')
      const [first] = within(region).getAllByRole('listitem')
      expect(first).toHaveTextContent('Newer Signup')
    })

    it('links each row to that user and caches them on the way', async () => {
      const user = userEvent.setup()
      const target = buildUser({ id: 'user-42' })
      mockedGetAll.mockResolvedValue([target])
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
