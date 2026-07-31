import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { cn } from '@/utils'
import styles from './Dropdown.module.scss'

interface DropdownItem {
  label: string
  icon?: ReactNode
  onClick: () => void
}

interface DropdownProps {
  trigger: ReactNode
  /** Accessible name for the trigger. Required when `trigger` is icon-only. */
  triggerLabel?: string
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
}

function Dropdown({
  trigger,
  triggerLabel,
  items,
  align = 'right',
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Focus enters the menu on open so the keyboard lands somewhere useful.
  useEffect(() => {
    if (isOpen) {
      menuRef.current?.querySelector('button')?.focus()
    }
  }, [isOpen])

  /** Closes and returns focus to the trigger, so the tab order is not lost. */
  function close() {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

    const buttons = Array.from(
      menuRef.current?.querySelectorAll('button') ?? [],
    )
    const currentIndex = buttons.indexOf(
      document.activeElement as HTMLButtonElement,
    )
    if (currentIndex === -1) return

    event.preventDefault()
    const lastIndex = buttons.length - 1
    const nextIndex =
      event.key === 'ArrowDown'
        ? currentIndex === lastIndex
          ? 0
          : currentIndex + 1
        : currentIndex === 0
          ? lastIndex
          : currentIndex - 1

    buttons[nextIndex].focus()
  }

  return (
    <div className={cn(styles.wrapper, className)} ref={wrapperRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={triggerLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={cn(styles.menu, styles[align])}
          role="menu"
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              className={styles.item}
              role="menuitem"
              onClick={() => {
                item.onClick()
                close()
              }}
            >
              {item.icon && <span className={styles.icon}>{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dropdown
