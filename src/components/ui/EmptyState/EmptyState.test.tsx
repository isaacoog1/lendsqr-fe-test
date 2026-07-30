import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import EmptyState from './EmptyState'

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No users found" />)
    expect(screen.getByText('No users found')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <EmptyState title="No data" description="Try adjusting your filters" />,
    )
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument()
  })

  it('renders action when provided', () => {
    render(<EmptyState title="No data" action={<button>Retry</button>} />)
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="Empty" />)
    expect(container.querySelector('p')).not.toBeInTheDocument()
  })
})
