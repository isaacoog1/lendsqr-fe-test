import { useRef, type KeyboardEvent } from 'react'
import { cn } from '@/utils'
import { tabId, tabPanelId } from './tabIds'
import styles from './Tabs.module.scss'

interface Tab {
  key: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (key: string) => void
  className?: string
  /** Prefix for the generated tab and panel ids, so they can be associated. */
  idPrefix?: string
}

/**
 * Implements the ARIA tabs pattern: one tab stop for the whole set, with
 * Arrow/Home/End moving between tabs. Declaring role="tab" without this is
 * worse than plain buttons — assistive technology announces "tab, 1 of 6" and
 * then the arrow keys the user reaches for do nothing.
 */
function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  idPrefix = 'tabs',
}: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null)

  function focusTab(key: string) {
    onChange(key)
    listRef.current
      ?.querySelector<HTMLButtonElement>(`#${CSS.escape(tabId(idPrefix, key))}`)
      ?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = tabs.findIndex((tab) => tab.key === activeTab)
    if (currentIndex === -1) return

    const lastIndex = tabs.length - 1
    let nextIndex: number

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1
        break
      case 'ArrowLeft':
        nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = lastIndex
        break
      default:
        return
    }

    event.preventDefault()
    focusTab(tabs[nextIndex].key)
  }

  return (
    <div
      ref={listRef}
      className={cn(styles.container, className)}
      role="tablist"
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab

        return (
          <button
            key={tab.key}
            id={tabId(idPrefix, tab.key)}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={tabPanelId(idPrefix, tab.key)}
            // Roving tab stop: Tab reaches the set, arrows move within it.
            tabIndex={isActive ? 0 : -1}
            className={cn(styles.tab, isActive && styles.active)}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
