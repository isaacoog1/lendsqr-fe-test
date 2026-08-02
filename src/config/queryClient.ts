import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      /**
       * By default React Query pauses queries whenever `navigator.onLine` is
       * false, which leaves the page in a silent non-state: no data, no error,
       * and a Retry button that does nothing. Letting the request run instead
       * means a failure always produces an error the UI can name — and the
       * attempt itself is a far better test of connectivity than the flag,
       * which cannot see a captive portal or a dead API.
       */
      networkMode: 'always',
      /**
       * `always` turns this off by default. Kept on so a page that failed
       * while the machine was offline recovers on its own once the OS reports
       * the network is back, rather than waiting for a click.
       */
      refetchOnReconnect: true,
    },
  },
})
