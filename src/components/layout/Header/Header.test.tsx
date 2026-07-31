import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import Header from './Header'

/** Renders the current url so assertions can read where navigation landed. */
function LocationProbe() {
  const location = useLocation()
  return (
    <output data-testid="location">
      {location.pathname + location.search}
    </output>
  )
}

function renderHeader(route = '/dashboard') {
  const onMenuClick = vi.fn()

  const result = renderWithProviders(
    <>
      <Header onMenuClick={onMenuClick} />
      <Routes>
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </>,
    { route },
  )

  return { ...result, onMenuClick }
}

function currentLocation() {
  return screen.getByTestId('location').textContent
}

describe('Header', () => {
  describe('search', () => {
    it('sends the query to the users list', async () => {
      const user = userEvent.setup()
      renderHeader()

      await user.type(screen.getByLabelText('Search users'), 'grace')
      await user.click(screen.getByRole('button', { name: 'Search' }))

      expect(currentLocation()).toBe('/users?q=grace')
    })

    it('submits on Enter without needing the button', async () => {
      const user = userEvent.setup()
      renderHeader()

      await user.type(screen.getByLabelText('Search users'), 'grace{Enter}')

      expect(currentLocation()).toBe('/users?q=grace')
    })

    it('escapes characters that would corrupt the query string', async () => {
      const user = userEvent.setup()
      renderHeader()

      await user.type(screen.getByLabelText('Search users'), 'a&b=c{Enter}')

      expect(currentLocation()).toBe('/users?q=a%26b%3Dc')
    })

    it('goes to the unfiltered list when the query is blank', async () => {
      const user = userEvent.setup()
      renderHeader()

      await user.type(screen.getByLabelText('Search users'), '   {Enter}')

      expect(currentLocation()).toBe('/users')
    })

    it('shows the query already applied to the list', () => {
      renderHeader('/users?q=existing')

      expect(screen.getByLabelText('Search users')).toHaveValue('existing')
    })

    it('is exposed as a search landmark', () => {
      renderHeader()

      expect(screen.getByRole('search')).toBeInTheDocument()
    })
  })

  describe('controls', () => {
    it('opens the sidebar from the menu button', async () => {
      const user = userEvent.setup()
      const { onMenuClick } = renderHeader()

      // Queried by label rather than role: the button is display:none above
      // the tablet breakpoint, which getByRole treats as inaccessible.
      await user.click(screen.getByLabelText('Open menu'))

      expect(onMenuClick).toHaveBeenCalledOnce()
    })

    it('labels the notifications button', () => {
      renderHeader()

      expect(
        screen.getByRole('button', { name: 'Notifications' }),
      ).toBeInTheDocument()
    })
  })
})
