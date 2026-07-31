import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usersService } from '@/services/users.service'
import { buildUser, buildUsers } from '@/test/factories'
import { renderWithProviders } from '@/test/renderWithProviders'
import DashboardPage from './DashboardPage'

vi.mock('@/services/users.service')

const mockedGetAll = vi.mocked(usersService.getAll)

function renderDashboard() {
  return renderWithProviders(<DashboardPage />)
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
        screen.getByRole('status', { name: 'Loading users' }),
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

      await waitFor(() => {
        expect(screen.getByText('ORGANIZATION')).toBeInTheDocument()
      })
      expect(mockedGetAll).toHaveBeenCalledTimes(2)
    })
  })

  describe('empty state', () => {
    it('explains the absence of data instead of rendering an empty table', async () => {
      mockedGetAll.mockResolvedValue([])
      renderDashboard()

      await waitFor(() => {
        expect(screen.getByText(/no users found/i)).toBeInTheDocument()
      })
      expect(screen.queryByText('ORGANIZATION')).not.toBeInTheDocument()
    })
  })

  describe('loaded state', () => {
    it('renders the four stat cards', async () => {
      renderDashboard()

      await waitFor(() => {
        expect(screen.getByText('USERS')).toBeInTheDocument()
      })
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

      await waitFor(() => {
        expect(screen.getByText('USERS WITH LOANS')).toBeInTheDocument()
      })

      const loansCard = screen.getByText('USERS WITH LOANS').closest('div')
      const savingsCard = screen.getByText('USERS WITH SAVINGS').closest('div')
      expect(loansCard).toHaveTextContent('2')
      expect(savingsCard).toHaveTextContent('1')
    })

    it('renders the users table', async () => {
      renderDashboard()

      await waitFor(() => {
        expect(screen.getByText('ORGANIZATION')).toBeInTheDocument()
      })
      expect(screen.getByText('USERNAME')).toBeInTheDocument()
      expect(screen.getByText('EMAIL')).toBeInTheDocument()
    })
  })
})
