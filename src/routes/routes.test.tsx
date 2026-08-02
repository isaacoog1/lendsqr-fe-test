import { screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { STORAGE_KEYS } from '@/constants'
import { usersService } from '@/services/users.service'
import { buildPaginatedUsers, buildUserStats } from '@/test/factories'
import { renderRoutes } from '@/test/renderWithProviders'
import { routes } from './routes'

vi.mock('@/services/users.service')

function renderAt(route: string) {
  return renderRoutes(routes, { route })
}

describe('routes', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(usersService.list).mockResolvedValue(buildPaginatedUsers())
    vi.mocked(usersService.getStats).mockResolvedValue(buildUserStats())
  })

  describe('unauthenticated', () => {
    it('sends a protected route to the login page', async () => {
      renderAt('/users')

      expect(await screen.findByText('Welcome!')).toBeInTheDocument()
    })

    it('sends an unknown path to the 404 page, not to login', async () => {
      renderAt('/not-in-the-sidebar')

      expect(await screen.findByText('Page not found')).toBeInTheDocument()
    })
  })

  describe('authenticated', () => {
    beforeEach(() => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token')
    })

    it('renders the users page', async () => {
      renderAt('/users')

      expect(
        await screen.findByRole('heading', { name: 'Users' }),
      ).toBeInTheDocument()
    })

    // The sidebar advertises 21 destinations; only two are implemented. The
    // rest must not strip the shell, which is what a bare 404 used to do.
    it('keeps the app shell for an unimplemented sidebar destination', async () => {
      renderAt('/guarantors')

      expect(
        await screen.findByRole('heading', { name: 'Guarantors' }),
      ).toBeInTheDocument()
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('names the destination from the sidebar config', async () => {
      renderAt('/audit-logs')

      expect(
        await screen.findByRole('heading', { name: 'Audit Logs' }),
      ).toBeInTheDocument()
    })

    it('offers a way back to the users list', async () => {
      renderAt('/karma')

      expect(await screen.findByText('Go to Users')).toBeInTheDocument()
    })

    // A destination the sidebar never advertised is a 404, not a placeholder:
    // "not built yet" and "no such page" are different answers.
    it('shows the 404 page for an unknown path', async () => {
      renderAt('/not-in-the-sidebar')

      expect(await screen.findByText('Page not found')).toBeInTheDocument()
    })

    it('redirects the root to the dashboard', async () => {
      renderAt('/')

      expect(await screen.findByRole('banner')).toBeInTheDocument()
    })
  })
})
