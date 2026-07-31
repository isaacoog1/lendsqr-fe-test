import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Dropdown from './Dropdown'

function renderDropdown() {
  const onFirst = vi.fn()
  const onSecond = vi.fn()

  const result = render(
    <Dropdown
      trigger={<span aria-hidden="true">•••</span>}
      triggerLabel="Actions for Grace"
      items={[
        { label: 'View Details', onClick: onFirst },
        { label: 'Blacklist User', onClick: onSecond },
      ]}
    />,
  )

  return { ...result, onFirst, onSecond }
}

function getTrigger() {
  return screen.getByRole('button', { name: 'Actions for Grace' })
}

describe('Dropdown', () => {
  it('names an icon-only trigger', () => {
    renderDropdown()

    expect(getTrigger()).toBeInTheDocument()
    expect(getTrigger()).toHaveAttribute('aria-haspopup', 'menu')
  })

  it('keeps the menu closed until the trigger is used', () => {
    renderDropdown()

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the menu and reflects that on the trigger', async () => {
    const user = userEvent.setup()
    renderDropdown()

    await user.click(getTrigger())

    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'true')
  })

  it('runs the chosen item and closes', async () => {
    const user = userEvent.setup()
    const { onFirst } = renderDropdown()

    await user.click(getTrigger())
    await user.click(screen.getByRole('menuitem', { name: 'View Details' }))

    expect(onFirst).toHaveBeenCalledOnce()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  describe('focus management', () => {
    it('moves focus into the menu on open', async () => {
      const user = userEvent.setup()
      renderDropdown()

      await user.click(getTrigger())

      expect(
        screen.getByRole('menuitem', { name: 'View Details' }),
      ).toHaveFocus()
    })

    it('cycles through items with the arrow keys', async () => {
      const user = userEvent.setup()
      renderDropdown()

      await user.click(getTrigger())
      await user.keyboard('{ArrowDown}')
      expect(
        screen.getByRole('menuitem', { name: 'Blacklist User' }),
      ).toHaveFocus()

      await user.keyboard('{ArrowDown}')
      expect(
        screen.getByRole('menuitem', { name: 'View Details' }),
      ).toHaveFocus()

      await user.keyboard('{ArrowUp}')
      expect(
        screen.getByRole('menuitem', { name: 'Blacklist User' }),
      ).toHaveFocus()
    })

    it('returns focus to the trigger on Escape rather than losing it', async () => {
      const user = userEvent.setup()
      renderDropdown()

      await user.click(getTrigger())
      await user.keyboard('{Escape}')

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      expect(getTrigger()).toHaveFocus()
    })

    it('returns focus to the trigger after choosing an item', async () => {
      const user = userEvent.setup()
      renderDropdown()

      await user.click(getTrigger())
      await user.click(screen.getByRole('menuitem', { name: 'View Details' }))

      expect(getTrigger()).toHaveFocus()
    })
  })
})
