import { getUsers, getUserById } from '@/mocks'
import type { User } from '@/types'

function delay(ms = 800): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const usersService = {
  async getAll(): Promise<User[]> {
    await delay()
    return getUsers()
  },

  async getById(id: string): Promise<User> {
    await delay(500)
    const user = getUserById(id)
    if (!user) {
      throw { message: 'User not found', status: 404 }
    }
    return user
  },
}
