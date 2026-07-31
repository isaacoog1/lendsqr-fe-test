import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthProvider } from '@/contexts/AuthProvider'
import { STORAGE_KEYS } from '@/constants'
import { usersService } from '@/services/users.service'
import { buildUsers } from '@/test/factories'
import UsersPage from './UsersPage'

vi.mock('@/services/users.service')

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })
}

function renderUsersPage() {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <UsersPage />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('UsersPage', () => {
  beforeEach(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token')
    vi.mocked(usersService.getAll).mockResolvedValue(buildUsers(25))
  })

  it('shows loading skeleton initially', () => {
    renderUsersPage()
    expect(screen.getByText('Users')).toBeInTheDocument()
  })

  it('renders stat cards after loading', async () => {
    renderUsersPage()
    await waitFor(
      () => {
        expect(screen.getByText('USERS')).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
    expect(screen.getByText('ACTIVE USERS')).toBeInTheDocument()
  })

  it('renders search input', async () => {
    renderUsersPage()
    await waitFor(
      () => {
        expect(screen.getByLabelText('Search users')).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  })

  it('renders filter button', async () => {
    renderUsersPage()
    await waitFor(
      () => {
        expect(
          screen.getByRole('button', { name: 'Filter' }),
        ).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  })

  it('filters users by search query', async () => {
    const user = userEvent.setup()
    renderUsersPage()

    await waitFor(
      () => {
        expect(screen.getByLabelText('Search users')).toBeInTheDocument()
      },
      { timeout: 3000 },
    )

    await user.type(screen.getByLabelText('Search users'), 'zzzznonexistent')

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument()
    })
  })

  it('shows clear filters button when no results with active search', async () => {
    const user = userEvent.setup()
    renderUsersPage()

    await waitFor(
      () => {
        expect(screen.getByLabelText('Search users')).toBeInTheDocument()
      },
      { timeout: 3000 },
    )

    await user.type(screen.getByLabelText('Search users'), 'zzzznonexistent')

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Clear Filters' }),
      ).toBeInTheDocument()
    })
  })

  it('opens filter panel when filter button is clicked', async () => {
    const user = userEvent.setup()
    renderUsersPage()

    await waitFor(
      () => {
        expect(
          screen.getByRole('button', { name: 'Filter' }),
        ).toBeInTheDocument()
      },
      { timeout: 3000 },
    )

    await user.click(screen.getByRole('button', { name: 'Filter' }))
    expect(screen.getByLabelText('Organization')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
  })

  it('persists selected user to localStorage on View Details', async () => {
    const user = userEvent.setup()
    renderUsersPage()

    await waitFor(
      () => {
        expect(screen.getByText('ORGANIZATION')).toBeInTheDocument()
      },
      { timeout: 3000 },
    )

    const actionButtons = screen.getAllByRole('button', { name: '' })
    await user.click(actionButtons[0])

    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument()
    })

    await user.click(screen.getByText('View Details'))

    const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_USER)
    expect(stored).not.toBeNull()
    expect(JSON.parse(stored!)).toHaveProperty('id')
  })
})
