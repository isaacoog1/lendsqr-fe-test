import { useEffect, useRef } from 'react'

/**
 * Tab order inside the trap. Deliberately narrow: the panels using this hook
 * contain form fields and buttons, nothing exotic.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
}

/**
 * Keeps Tab inside the returned element while `isActive`, and hands focus back
 * to whatever opened it on close.
 *
 * Without this, a popover anchored somewhere other than where it is declared in
 * the DOM leaves the keyboard behind: focus stays on the trigger and Tab walks
 * the page underneath the open panel instead of entering it.
 */
export function useFocusTrap<T extends HTMLElement>(isActive: boolean) {
  const containerRef = useRef<T>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!isActive || !container) return

    // Captured before focus moves, so it still points at the trigger.
    const previouslyFocused = document.activeElement

    getFocusable(container)[0]?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const focusable = getFocusable(container)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const atEdge = event.shiftKey
        ? document.activeElement === first
        : document.activeElement === last
      if (!atEdge) return

      event.preventDefault()
      ;(event.shiftKey ? last : first).focus()
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)

      // Restore only when focus would otherwise be stranded. `body` covers the
      // usual case: React has already detached the trapped element by the time
      // this runs, so the focused field is gone and focus fell to the document.
      // Anywhere else means the user clicked their way out, and pulling focus
      // back would fight them.
      const active = document.activeElement
      const focusIsStranded =
        !active || active === document.body || container.contains(active)

      if (focusIsStranded && previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus()
      }
    }
  }, [isActive])

  return containerRef
}
