import { describe, it, expect } from 'vitest'
import { usersService } from './users.service'

describe('usersService', () => {
  describe('getAll', () => {
    it('returns 500 users', async () => {
      const users = await usersService.getAll()
      expect(users).toHaveLength(500)
    })

    it('each user has required fields', async () => {
      const users = await usersService.getAll()
      const user = users[0]

      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('organization')
      expect(user).toHaveProperty('username')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('phoneNumber')
      expect(user).toHaveProperty('dateJoined')
      expect(user).toHaveProperty('status')
      expect(user).toHaveProperty('personalInfo')
      expect(user).toHaveProperty('educationAndEmployment')
      expect(user).toHaveProperty('socials')
      expect(user).toHaveProperty('guarantor')
    })

    it('user status is one of valid values', async () => {
      const users = await usersService.getAll()
      const validStatuses = ['active', 'inactive', 'pending', 'blacklisted']

      for (const user of users.slice(0, 20)) {
        expect(validStatuses).toContain(user.status)
      }
    })
  })

  describe('getById', () => {
    it('returns a user by id', async () => {
      const users = await usersService.getAll()
      const firstUser = users[0]

      const user = await usersService.getById(firstUser.id)
      expect(user.id).toBe(firstUser.id)
      expect(user.email).toBe(firstUser.email)
    })

    it('throws when user not found', async () => {
      await expect(usersService.getById('nonexistent-id')).rejects.toEqual({
        message: 'User not found',
        status: 404,
      })
    })
  })
})
