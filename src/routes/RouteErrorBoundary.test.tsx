import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import RouteErrorBoundary from './RouteErrorBoundary'

function Boom(): never {
  throw new Error('render exploded')
}

/** A one-route table that throws, so the boundary is what actually renders. */
function renderBoundary(onError?: (error: unknown) => void) {
  const router = createMemoryRouter([
    {
      path: '/',
      element: <Boom />,
      errorElement: <RouteErrorBoundary onError={onError} />,
    },
  ])

  return render(<RouterProvider router={router} />)
}

describe('RouteErrorBoundary', () => {
  beforeEach(() => {
    // React and React Router both log the caught error; silence them so the
    // run stays readable.
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the route when nothing throws', () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: <p>All good</p>,
        errorElement: <RouteErrorBoundary />,
      },
    ])
    render(<RouterProvider router={router} />)

    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('shows a recovery affordance instead of a blank page when a route throws', () => {
    renderBoundary()

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
    expect(
      screen.getByRole('button', { name: 'Reload page' }),
    ).toBeInTheDocument()
  })

  it('reports the error so it can be forwarded to a logging service', () => {
    const onError = vi.fn()

    renderBoundary(onError)

    expect(onError).toHaveBeenCalledOnce()
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error)
    expect((onError.mock.calls[0][0] as Error).message).toBe('render exploded')
  })
})
