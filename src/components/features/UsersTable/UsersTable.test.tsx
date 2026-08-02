import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { EMPTY_FILTERS } from '@/components/features/UserFilters'
import { buildPaginatedUsers, buildUserSummary } from '@/test/factories'
import { STORAGE_KEYS } from '@/constants'
import type { Pagination, UserSummary } from '@/types'
import UsersTable, { type SortState } from './UsersTable'

const STATUSES = ['active', 'inactive', 'pending', 'blacklisted'] as const
const ORGANIZATIONS = ['Lendsqr', 'Lendstar']

const mockUsers = Array.from({ length: 20 }, (_, i) =>
  buildUserSummary({
    id: `user-${i}`,
    organization: ORGANIZATIONS[i % 2],
    username: `user${i}`,
    email: `user${i}@test.com`,
    phoneNumber: `0700000000${i}`,
    status: STATUSES[i % 4],
  }),
)

interface RenderOptions {
  users?: UserSummary[]
  pagination?: Partial<Pagination>
  sort?: SortState
  withFilters?: boolean
}

function renderTable({
  users = mockUsers,
  pagination = { total: 25, totalPages: 2 },
  sort = {},
  withFilters = false,
}: RenderOptions = {}) {
  const onApply = vi.fn()
  const onReset = vi.fn()
  const onSortChange = vi.fn()
  const onPageChange = vi.fn()
  const onPageSizeChange = vi.fn()

  const page = buildPaginatedUsers(users, pagination)

  const result = render(
    <MemoryRouter>
      <UsersTable
        data={page.users}
        pagination={page.pagination}
        sort={sort}
        onSortChange={onSortChange}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        filters={
          withFilters
            ? {
                organizations: ORGANIZATIONS,
                values: EMPTY_FILTERS,
                isActive: false,
                onApply,
                onReset,
              }
            : undefined
        }
      />
    </MemoryRouter>,
  )

  return {
    ...result,
    onApply,
    onReset,
    onSortChange,
    onPageChange,
    onPageSizeChange,
  }
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

    // The server sends exactly one page, so the table renders what it is
    // handed rather than slicing a longer list itself.
    it('renders every row it is given', () => {
      renderTable()

      expect(screen.getAllByRole('row')).toHaveLength(21)
    })

    it('reports the server-side total rather than the row count', () => {
      renderTable()

      expect(screen.getByText('out of 25')).toBeInTheDocument()
    })

    it('renders status badges', () => {
      renderTable()

      expect(screen.getAllByText('Active').length).toBeGreaterThan(0)
    })
  })

  describe('pagination', () => {
    it('asks the caller for the next page', async () => {
      const user = userEvent.setup()
      const { onPageChange } = renderTable()

      await user.click(screen.getByLabelText('Page 2'))

      expect(onPageChange).toHaveBeenCalledWith(2)
    })

    it('reflects the page the server returned', () => {
      renderTable({ pagination: { page: 2, total: 25, totalPages: 2 } })

      expect(screen.getByLabelText('Page 2')).toHaveAttribute(
        'aria-current',
        'page',
      )
    })

    it('asks the caller for a different page size', async () => {
      const user = userEvent.setup()
      const { onPageSizeChange } = renderTable()

      await user.selectOptions(screen.getByLabelText('Items per page'), '50')

      expect(onPageSizeChange).toHaveBeenCalledWith(50)
    })
  })

  describe('sorting', () => {
    it('asks the caller to sort ascending on the first activation', async () => {
      const user = userEvent.setup()
      const { onSortChange } = renderTable()

      await user.click(screen.getByRole('button', { name: /ORGANIZATION/ }))

      expect(onSortChange).toHaveBeenCalledWith({
        sortBy: 'organization',
        sortOrder: 'asc',
      })
    })

    it('flips to descending when the column is already ascending', async () => {
      const user = userEvent.setup()
      const { onSortChange } = renderTable({
        sort: { sortBy: 'organization', sortOrder: 'asc' },
      })

      await user.click(screen.getByRole('button', { name: /ORGANIZATION/ }))

      expect(onSortChange).toHaveBeenCalledWith({
        sortBy: 'organization',
        sortOrder: 'desc',
      })
    })

    it('exposes the applied sort on the column header', () => {
      renderTable({ sort: { sortBy: 'organization', sortOrder: 'desc' } })

      expect(
        screen.getByRole('columnheader', { name: /ORGANIZATION/ }),
      ).toHaveAttribute('aria-sort', 'descending')
    })

    it('leaves the other columns marked unsorted', () => {
      renderTable({ sort: { sortBy: 'organization', sortOrder: 'asc' } })

      expect(
        screen.getByRole('columnheader', { name: /EMAIL/ }),
      ).toHaveAttribute('aria-sort', 'none')
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

    it('records the selection when the row link is followed', async () => {
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
      renderTable({ withFilters: true })

      await user.click(
        screen.getByRole('button', { name: 'Filter by ORGANIZATION' }),
      )

      expect(screen.getByLabelText('Organization')).toBeInTheDocument()
      expect(screen.getByLabelText('Status')).toBeInTheDocument()
    })

    it('reports the chosen filters to the caller', async () => {
      const user = userEvent.setup()
      const { onApply } = renderTable({ withFilters: true })

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
