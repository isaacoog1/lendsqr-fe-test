import { useEffect, useRef, useState, type ReactNode } from 'react'
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
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  return (
    <div className={cn(styles.wrapper, className)} ref={ref}>
      <button
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
        <div className={cn(styles.menu, styles[align])} role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              className={styles.item}
              role="menuitem"
              onClick={() => {
                item.onClick()
                setIsOpen(false)
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
