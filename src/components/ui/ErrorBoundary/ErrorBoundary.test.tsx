import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ErrorBoundary from './ErrorBoundary'

function Boom(): never {
  throw new Error('render exploded')
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React logs the caught error; silence it so the run stays readable.
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders its children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    )

    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('shows a recovery affordance instead of a blank page when a child throws', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
    expect(
      screen.getByRole('button', { name: 'Reload page' }),
    ).toBeInTheDocument()
  })

  it('reports the error so it can be forwarded to a logging service', () => {
    const onError = vi.fn()

    render(
      <ErrorBoundary onError={onError}>
        <Boom />
      </ErrorBoundary>,
    )

    expect(onError).toHaveBeenCalledOnce()
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error)
    expect(onError.mock.calls[0][0].message).toBe('render exploded')
  })
})
