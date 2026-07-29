import { generateUsers } from './generateUsers'
import type { User } from '@/types'

let users: User[] | null = null

export function getUsers(): User[] {
  if (!users) {
    users = generateUsers(500)
  }
  return users
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((user) => user.id === id)
}
