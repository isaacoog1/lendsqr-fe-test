import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import type { User } from '@/types'
import UsersTable from './UsersTable'

const mockUsers: User[] = Array.from({ length: 25 }, (_, i) => ({
  id: `user-${i}`,
  organization: i % 2 === 0 ? 'Lendsqr' : 'Lendstar',
  username: `user${i}`,
  email: `user${i}@test.com`,
  phoneNumber: `0700000000${i}`,
  dateJoined: '2020-05-15T10:00:00.000Z',
  status: (['active', 'inactive', 'pending', 'blacklisted'] as const)[i % 4],
  personalInfo: {
    fullName: `User ${i}`,
    bvn: '12345678901',
    gender: 'Male',
    maritalStatus: 'Single',
    children: 'None',
    typeOfResidence: "Parent's Apartment",
  },
  educationAndEmployment: {
    levelOfEducation: 'B.Sc',
    employmentStatus: 'Employed',
    sectorOfEmployment: 'FinTech',
    durationOfEmployment: '2 years',
    officeEmail: `user${i}@office.com`,
    monthlyIncome: '₦200,000.00 - ₦400,000.00',
    loanRepayment: '40,000',
  },
  socials: {
    twitter: '@user',
    facebook: 'User',
    instagram: '@user',
  },
  guarantor: {
    fullName: 'Guarantor',
    phoneNumber: '07060780922',
    emailAddress: 'guarantor@test.com',
    relationship: 'Sister',
  },
  accountBalance: '₦200,000.00',
  accountNumber: '9912345678',
  bankName: 'Providus Bank',
  tier: 1,
}))

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
