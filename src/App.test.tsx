import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders login page when unauthenticated', () => {
    render(<App />)
    expect(screen.getByText('Welcome!')).toBeInTheDocument()
  })
})
