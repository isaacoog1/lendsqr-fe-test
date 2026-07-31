import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { buildUser } from '@/test/factories'
import UsersTable from './UsersTable'

const STATUSES = ['active', 'inactive', 'pending', 'blacklisted'] as const

const mockUsers = Array.from({ length: 25 }, (_, i) =>
  buildUser({
    id: `user-${i}`,
    organization: i % 2 === 0 ? 'Lendsqr' : 'Lendstar',
    username: `user${i}`,
    email: `user${i}@test.com`,
    phoneNumber: `0700000000${i}`,
    status: STATUSES[i % 4],
  }),
)

function renderTable(users = mockUsers) {
  return render(
    <MemoryRouter>
      <UsersTable data={users} />
    </MemoryRouter>,
  )
}

describe('UsersTable', () => {
  it('renders table headers', () => {
    renderTable()
    expect(screen.getByText('ORGANIZATION')).toBeInTheDocument()
    expect(screen.getByText('USERNAME')).toBeInTheDocument()
    expect(screen.getByText('EMAIL')).toBeInTheDocument()
    expect(screen.getByText('PHONE NUMBER')).toBeInTheDocument()
    expect(screen.getByText('DATE JOINED')).toBeInTheDocument()
    expect(screen.getByText('STATUS')).toBeInTheDocument()
  })

  it('renders first page of 20 rows by default', () => {
    renderTable()
    const rows = screen.getAllByRole('row')
    // 1 header row + 20 data rows
    expect(rows).toHaveLength(21)
  })

  it('shows pagination with correct total', () => {
    renderTable()
    expect(screen.getByText('out of 25')).toBeInTheDocument()
  })

  it('navigates to next page', async () => {
    const user = userEvent.setup()
    renderTable()

    await user.click(screen.getByLabelText('Page 2'))
    const rows = screen.getAllByRole('row')
    // 1 header + 5 remaining rows on page 2
    expect(rows).toHaveLength(6)
  })

  it('renders status badges', () => {
    renderTable()
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0)
  })

  it('renders action dropdown triggers', () => {
    renderTable()
    const buttons = screen.getAllByRole('button', { name: '' })
    expect(buttons.length).toBeGreaterThan(0)
  })
})
