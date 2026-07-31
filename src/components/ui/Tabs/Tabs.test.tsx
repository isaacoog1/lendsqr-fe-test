import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import Tabs from './Tabs'
import { tabId, tabPanelId } from './tabIds'

const TABS = [
  { key: 'one', label: 'One' },
  { key: 'two', label: 'Two' },
  { key: 'three', label: 'Three' },
]

function Harness() {
  const [activeTab, setActiveTab] = useState('one')

  return (
    <>
      <Tabs
        tabs={TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
        idPrefix="demo"
      />
      <div
        role="tabpanel"
        id={tabPanelId('demo', activeTab)}
        aria-labelledby={tabId('demo', activeTab)}
      >
        Panel {activeTab}
      </div>
    </>
  )
}

describe('Tabs', () => {
  it('marks only the active tab as selected', () => {
    render(<Harness />)

    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  it('associates each tab with its panel', () => {
    render(<Harness />)

    const tab = screen.getByRole('tab', { name: 'One' })
    const panel = screen.getByRole('tabpanel')

    expect(tab).toHaveAttribute('aria-controls', panel.id)
    expect(panel).toHaveAttribute('aria-labelledby', tab.id)
  })

  it('exposes a single tab stop for the whole set', () => {
    render(<Harness />)

    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute(
      'tabindex',
      '0',
    )
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute(
      'tabindex',
      '-1',
    )
  })

  it('selects on click', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('tab', { name: 'Two' }))

    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel two')
  })

  describe('keyboard navigation', () => {
    it('moves to the next tab on ArrowRight', async () => {
      const user = userEvent.setup()
      render(<Harness />)

      screen.getByRole('tab', { name: 'One' }).focus()
      await user.keyboard('{ArrowRight}')

      expect(screen.getByRole('tab', { name: 'Two' })).toHaveFocus()
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel two')
    })

    it('wraps from the last tab back to the first', async () => {
      const user = userEvent.setup()
      render(<Harness />)

      screen.getByRole('tab', { name: 'One' }).focus()
      await user.keyboard('{ArrowLeft}')

      expect(screen.getByRole('tab', { name: 'Three' })).toHaveFocus()
    })

    it('jumps to the first and last tab with Home and End', async () => {
      const user = userEvent.setup()
      render(<Harness />)

      screen.getByRole('tab', { name: 'One' }).focus()
      await user.keyboard('{End}')
      expect(screen.getByRole('tab', { name: 'Three' })).toHaveFocus()

      await user.keyboard('{Home}')
      expect(screen.getByRole('tab', { name: 'One' })).toHaveFocus()
    })

    it('ignores keys outside the pattern', async () => {
      const user = userEvent.setup()
      render(<Harness />)

      screen.getByRole('tab', { name: 'One' }).focus()
      await user.keyboard('{ArrowDown}')

      expect(screen.getByRole('tab', { name: 'One' })).toHaveFocus()
    })
  })
})
