import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usersService } from '@/services/users.service'
import { buildUsers } from '@/test/factories'
import DashboardPage from './DashboardPage'

vi.mock('@/services/users.service')

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
}

function renderDashboard() {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(usersService.getAll).mockResolvedValue(buildUsers(25))
  })

  it('shows loading skeleton initially', () => {
    renderDashboard()
    expect(screen.getByText('Users')).toBeInTheDocument()
  })

  it('renders stat cards after loading', async () => {
    renderDashboard()

    await waitFor(
      () => {
        expect(screen.getByText('USERS')).toBeInTheDocument()
      },
      { timeout: 3000 },
    )

    expect(screen.getByText('ACTIVE USERS')).toBeInTheDocument()
    expect(screen.getByText('USERS WITH LOANS')).toBeInTheDocument()
    expect(screen.getByText('USERS WITH SAVINGS')).toBeInTheDocument()
  })

  it('renders the users table after loading', async () => {
    renderDashboard()

    await waitFor(
      () => {
        expect(screen.getByText('ORGANIZATION')).toBeInTheDocument()
      },
      { timeout: 3000 },
    )

    expect(screen.getByText('USERNAME')).toBeInTheDocument()
    expect(screen.getByText('EMAIL')).toBeInTheDocument()
  })
})
