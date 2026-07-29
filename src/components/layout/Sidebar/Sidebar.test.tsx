import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { AuthProvider } from '@/contexts/AuthProvider'
import { STORAGE_KEYS } from '@/constants'
import Sidebar from './Sidebar'

function renderSidebar(isOpen = true) {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token')
  return render(
    <MemoryRouter initialEntries={['/users']}>
      <AuthProvider>
        <Sidebar isOpen={isOpen} onClose={vi.fn()} />
      </AuthProvider>
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

  it('renders logout button at the bottom', () => {
    renderSidebar()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('renders version number', () => {
    renderSidebar()
    expect(screen.getByText('v1.2.0')).toBeInTheDocument()
  })
})
