import { screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { STORAGE_KEYS } from '@/constants'
import { renderWithProviders } from '@/test/renderWithProviders'
import Sidebar from './Sidebar'

function renderSidebar(isOpen = true) {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token')
  return renderWithProviders(<Sidebar isOpen={isOpen} onClose={vi.fn()} />, {
    route: '/users',
  })
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
