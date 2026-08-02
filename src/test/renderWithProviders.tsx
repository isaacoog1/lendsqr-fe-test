import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import {
  MemoryRouter,
  RouterProvider,
  createMemoryRouter,
  type RouteObject,
} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthProvider'

interface RenderOptions {
  /** Initial history entry, for components that read route params. */
  route?: string
}

/**
 * Retries are off so rejected queries surface their error state immediately
 * instead of after a backoff, and nothing is cached between tests.
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })
}

/**
 * Renders with the providers the app supplies at runtime, using a fresh
 * QueryClient per test.
 */
export function renderWithProviders(
  ui: ReactNode,
  { route = '/' }: RenderOptions = {},
) {
  const queryClient = createTestQueryClient()

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <AuthProvider>{ui}</AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  }
}

/**
 * Renders a route table in a memory data router — the same shape the app runs,
 * minus the browser history. The root route supplies AuthProvider, so only the
 * query client is wrapped here.
 */
export function renderRoutes(
  routes: RouteObject[],
  { route = '/' }: RenderOptions = {},
) {
  const queryClient = createTestQueryClient()
  const router = createMemoryRouter(routes, { initialEntries: [route] })

  return {
    queryClient,
    router,
    ...render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    ),
  }
}
