import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { STORAGE_KEYS } from '@/constants'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  // Routes are lazy, so the first paint is the Suspense fallback — every
  // assertion here has to wait for the chunk to resolve.
  it('sends an unauthenticated visitor to the login page', async () => {
    render(<App />)

    expect(await screen.findByText('Welcome!')).toBeInTheDocument()
  })

  it('shows the app shell to an authenticated visitor', async () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token')
    render(<App />)

    expect(await screen.findByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})
