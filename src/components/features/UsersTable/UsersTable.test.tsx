import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { buildUser } from '@/test/factories'
import { STORAGE_KEYS } from '@/constants'
import UsersTable from './UsersTable'

const STATUSES = ['active', 'inactive', 'pending', 'blacklisted'] as const
const ORGANIZATIONS = ['Lendsqr', 'Lendstar']

const mockUsers = Array.from({ length: 25 }, (_, i) =>
  buildUser({
    id: `user-${i}`,
    organization: ORGANIZATIONS[i % 2],
    username: `user${i}`,
    email: `user${i}@test.com`,
    phoneNumber: `0700000000${i}`,
    status: STATUSES[i % 4],
  }),
)

function renderTable(users = mockUsers, withFilters = false) {
  const onApply = vi.fn()
  const onReset = vi.fn()

  const result = render(
    <MemoryRouter>
      <UsersTable
        data={users}
        filters={
          withFilters
            ? {
                organizations: ORGANIZATIONS,
                isActive: false,
                onApply,
                onReset,
              }
            : undefined
        }
      />
    </MemoryRouter>,
  )

  return { ...result, onApply, onReset }
}

/** Text of the first cell in the first body row. */
function firstRowOrganization() {
  const [, firstBodyRow] = screen.getAllByRole('row')
  return within(firstBodyRow).getAllByRole('cell')[0].textContent
}

describe('UsersTable', () => {
  describe('rendering', () => {
    it('renders every column header', () => {
      renderTable()

      const headers = screen
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
      expect(headers).toEqual(
        expect.arrayContaining([
          'ORGANIZATION',
          'USERNAME',
          'EMAIL',
          'PHONE NUMBER',
          'DATE JOINED',
          'STATUS',
        ]),
      )
    })

    it('renders one page of rows at a time', () => {
      renderTable()

      // 1 header row + 20 data rows
      expect(screen.getAllByRole('row')).toHaveLength(21)
    })

    it('reports the unpaginated total', () => {
      renderTable()

      expect(screen.getByText('out of 25')).toBeInTheDocument()
    })

    it('renders status badges', () => {
      renderTable()

      expect(screen.getAllByText('Active').length).toBeGreaterThan(0)
    })
  })

  describe('pagination', () => {
    it('shows the remaining rows on the last page', async () => {
      const user = userEvent.setup()
      renderTable()

      await user.click(screen.getByLabelText('Page 2'))

      // 1 header + 5 remaining rows
      expect(screen.getAllByRole('row')).toHaveLength(6)
    })
  })

  describe('sorting', () => {
    it('reorders rows when a column header is activated', async () => {
      const user = userEvent.setup()
      renderTable()

      expect(firstRowOrganization()).toBe('Lendsqr')

      await user.click(screen.getByRole('button', { name: /ORGANIZATION/ }))
      expect(firstRowOrganization()).toBe('Lendsqr')

      await user.click(screen.getByRole('button', { name: /ORGANIZATION/ }))
      expect(firstRowOrganization()).toBe('Lendstar')
    })

    it('exposes the sort direction on the column header', async () => {
      const user = userEvent.setup()
      renderTable()

      const header = screen.getByRole('columnheader', { name: /ORGANIZATION/ })
      expect(header).toHaveAttribute('aria-sort', 'none')

      await user.click(screen.getByRole('button', { name: /ORGANIZATION/ }))
      expect(header).toHaveAttribute('aria-sort', 'ascending')

      await user.click(screen.getByRole('button', { name: /ORGANIZATION/ }))
      expect(header).toHaveAttribute('aria-sort', 'descending')
    })

    it('does not offer sorting on the actions column', () => {
      renderTable()

      const [actionsHeader] = screen.getAllByRole('columnheader').slice(-1)
      expect(
        within(actionsHeader).queryByRole('button'),
      ).not.toBeInTheDocument()
    })
  })

  describe('keyboard access', () => {
    it('exposes each row as a focusable link named after the user', () => {
      renderTable()

      const link = screen.getByRole('link', { name: 'user0' })
      expect(link).toHaveAttribute('href', '/users/user-0')
    })

    it('caches the user when the row link is followed', async () => {
      const user = userEvent.setup()
      renderTable()

      await user.click(screen.getByRole('link', { name: 'user0' }))

      const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_USER)
      expect(JSON.parse(stored!).id).toBe('user-0')
    })

    it('names every row-action trigger after its user', () => {
      renderTable()

      expect(
        screen.getByRole('button', { name: 'Actions for user0' }),
      ).toBeInTheDocument()
      expect(screen.queryAllByRole('button', { name: '' })).toHaveLength(0)
    })
  })

  describe('filters', () => {
    it('omits the filter affordance when no filter config is given', () => {
      renderTable()

      expect(
        screen.queryByRole('button', { name: /^Filter by/ }),
      ).not.toBeInTheDocument()
    })

    it('opens the filter panel from a column header', async () => {
      const user = userEvent.setup()
      renderTable(mockUsers, true)

      await user.click(
        screen.getByRole('button', { name: 'Filter by ORGANIZATION' }),
      )

      expect(screen.getByLabelText('Organization')).toBeInTheDocument()
      expect(screen.getByLabelText('Status')).toBeInTheDocument()
    })

    it('reports the chosen filters to the caller', async () => {
      const user = userEvent.setup()
      const { onApply } = renderTable(mockUsers, true)

      await user.click(
        screen.getByRole('button', { name: 'Filter by ORGANIZATION' }),
      )
      await user.type(screen.getByLabelText('Username'), 'user7')
      await user.click(screen.getByRole('button', { name: 'Filter' }))

      expect(onApply).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'user7' }),
      )
    })
  })
})
