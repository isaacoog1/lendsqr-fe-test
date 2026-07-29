import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Sidebar from './Sidebar'

function renderSidebar(isOpen = true) {
  return render(
    <MemoryRouter initialEntries={['/users']}>
      <Sidebar isOpen={isOpen} onClose={vi.fn()} />
    </MemoryRouter>,
  )
}

describe('Sidebar', () => {
  it('renders dashboard link', () => {
    renderSidebar()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders customer group items', () => {
    renderSidebar()
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Guarantors')).toBeInTheDocument()
    expect(screen.getByText('Loans')).toBeInTheDocument()
  })

  it('renders business group items', () => {
    renderSidebar()
    expect(screen.getByText('Organization')).toBeInTheDocument()
    expect(screen.getByText('Transactions')).toBeInTheDocument()
  })

  it('renders settings group items', () => {
    renderSidebar()
    expect(screen.getByText('Preferences')).toBeInTheDocument()
    expect(screen.getByText('Audit Logs')).toBeInTheDocument()
  })

  it('renders switch organization option', () => {
    renderSidebar()
    expect(screen.getByText('Switch Organization')).toBeInTheDocument()
  })
})
