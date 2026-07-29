import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Users } from 'lucide-react'
import StatCard from './StatCard'

describe('StatCard', () => {
  it('renders label and value', () => {
    render(
      <StatCard
        icon={Users}
        iconColor="#DF18FF"
        iconBgColor="#DF18FF1A"
        label="USERS"
        value="2,453"
      />,
    )
    expect(screen.getByText('USERS')).toBeInTheDocument()
    expect(screen.getByText('2,453')).toBeInTheDocument()
  })

  it('applies icon background color', () => {
    const { container } = render(
      <StatCard
        icon={Users}
        iconColor="#DF18FF"
        iconBgColor="#DF18FF1A"
        label="TEST"
        value="100"
      />,
    )
    const iconWrapper = container.querySelector('[style]')
    expect(iconWrapper).toHaveStyle({ backgroundColor: '#DF18FF1A' })
  })
})
