import { STORAGE_KEYS } from '@/constants'
import type { UserSummary } from '@/types'

export const storage = {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : null
    } catch {
      return null
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage full or unavailable
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key)
  },
}

/**
 * Records which user was opened from a list. Lists carry summaries — the full
 * record only exists behind `GET /users/:id` — so this persists the selection
 * rather than caching a whole user.
 */
export function saveSelectedUser(user: UserSummary): void {
  storage.set(STORAGE_KEYS.SELECTED_USER, user)
}

export function getSelectedUser(): UserSummary | null {
  return storage.get<UserSummary>(STORAGE_KEYS.SELECTED_USER)
}

export function clearSelectedUser(): void {
  storage.remove(STORAGE_KEYS.SELECTED_USER)
}
