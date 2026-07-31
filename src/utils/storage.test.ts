import { describe, it, expect, beforeEach } from 'vitest'
import {
  storage,
  saveSelectedUser,
  getSelectedUser,
  clearSelectedUser,
} from './storage'
import { STORAGE_KEYS } from '@/constants'
import { buildUser } from '@/test/factories'

const mockUser = buildUser({ id: '1', username: 'grace_effiom' })

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('generic operations', () => {
    it('sets and gets a value', () => {
      storage.set('test-key', { name: 'test' })
      expect(storage.get('test-key')).toEqual({ name: 'test' })
    })

    it('returns null for missing key', () => {
      expect(storage.get('nonexistent')).toBeNull()
    })

    it('removes a value', () => {
      storage.set('test-key', 'value')
      storage.remove('test-key')
      expect(storage.get('test-key')).toBeNull()
    })

    it('handles invalid JSON gracefully', () => {
      localStorage.setItem('bad-json', '{invalid')
      expect(storage.get('bad-json')).toBeNull()
    })
  })

  describe('user storage helpers', () => {
    it('saves and retrieves selected user', () => {
      saveSelectedUser(mockUser)
      const retrieved = getSelectedUser()
      expect(retrieved).toEqual(mockUser)
    })

    it('returns null when no user saved', () => {
      expect(getSelectedUser()).toBeNull()
    })

    it('clears selected user', () => {
      saveSelectedUser(mockUser)
      clearSelectedUser()
      expect(getSelectedUser()).toBeNull()
    })

    it('stores under the correct key', () => {
      saveSelectedUser(mockUser)
      const raw = localStorage.getItem(STORAGE_KEYS.SELECTED_USER)
      expect(raw).not.toBeNull()
      expect(JSON.parse(raw!).id).toBe('1')
    })
  })
})
