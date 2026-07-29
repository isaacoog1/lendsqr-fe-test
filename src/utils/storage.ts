import { STORAGE_KEYS } from '@/constants'
import type { User } from '@/types'

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

export function saveSelectedUser(user: User): void {
  storage.set(STORAGE_KEYS.SELECTED_USER, user)
}

export function getSelectedUser(): User | null {
  return storage.get<User>(STORAGE_KEYS.SELECTED_USER)
}

export function clearSelectedUser(): void {
  storage.remove(STORAGE_KEYS.SELECTED_USER)
}
