import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthProvider'

interface RenderOptions {
  /** Initial history entry, for components that read route params. */
  route?: string
}

/**
 * Renders with the providers the app supplies at runtime, using a fresh
 * QueryClient per test. Retries are off so rejected queries surface their
 * error state immediately instead of after a backoff.
 */
export function renderWithProviders(
  ui: ReactNode,
  { route = '/' }: RenderOptions = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })

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
