import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Pagination from './Pagination'

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    pageSize: 20,
    totalItems: 200,
    onPageChange: vi.fn(),
  }

  it('displays total items count', () => {
    render(<Pagination {...defaultProps} />)
    expect(screen.getByText('out of 200')).toBeInTheDocument()
  })

  it('disables previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />)
    expect(screen.getByLabelText('Previous page')).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={10} />)
    expect(screen.getByLabelText('Next page')).toBeDisabled()
  })

  it('calls onPageChange when a page is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />)

    await user.click(screen.getByLabelText('Page 2'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with previous page', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination {...defaultProps} currentPage={5} onPageChange={onPageChange} />)

    await user.click(screen.getByLabelText('Previous page'))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('marks current page with aria-current', () => {
    render(<Pagination {...defaultProps} currentPage={3} />)
    expect(screen.getByLabelText('Page 3')).toHaveAttribute('aria-current', 'page')
  })
})
