import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { queryClient } from '@/config/queryClient'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div>
          <h1>Lendsqr</h1>
          <p>Application shell ready.</p>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
