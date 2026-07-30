import { describe, it, expect, beforeEach } from 'vitest'
import {
  storage,
  saveSelectedUser,
  getSelectedUser,
  clearSelectedUser,
} from './storage'
import { STORAGE_KEYS } from '@/constants'
import type { User } from '@/types'

const mockUser: User = {
  id: '1',
  organization: 'Lendsqr',
  username: 'grace_effiom',
  email: 'grace@lendsqr.com',
  phoneNumber: '07060780922',
  dateJoined: '2020-05-15T10:00:00.000Z',
  status: 'active',
  personalInfo: {
    fullName: 'Grace Effiom',
    bvn: '07060780922',
    gender: 'Female',
    maritalStatus: 'Single',
    children: 'None',
    typeOfResidence: "Parent's Apartment",
  },
  educationAndEmployment: {
    levelOfEducation: 'B.Sc',
    employmentStatus: 'Employed',
    sectorOfEmployment: 'FinTech',
    durationOfEmployment: '2 years',
    officeEmail: 'grace@lendsqr.com',
    monthlyIncome: '₦200,000.00 - ₦400,000.00',
    loanRepayment: '40,000',
  },
  socials: {
    twitter: '@grace_effiom',
    facebook: 'Grace Effiom',
    instagram: '@grace_effiom',
  },
  guarantor: {
    fullName: 'Debby Ogana',
    phoneNumber: '07060780922',
    emailAddress: 'debby@gmail.com',
    relationship: 'Sister',
  },
  accountBalance: '₦200,000.00',
  accountNumber: '9912345678',
  bankName: 'Providus Bank',
  tier: 1,
}

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
