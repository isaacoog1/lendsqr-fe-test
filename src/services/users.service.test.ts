import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/api/client'
import { config } from '@/config/env'
import { buildUser } from '@/test/factories'
import { usersService } from './users.service'

vi.mock('@/api/client', () => ({
  apiClient: { get: vi.fn() },
}))

const mockedGet = vi.mocked(apiClient.get)

describe('usersService', () => {
  beforeEach(() => {
    mockedGet.mockReset()
  })

  describe('getAll', () => {
    it('requests the configured users path', async () => {
      mockedGet.mockResolvedValue({ data: [] })

      await usersService.getAll()

      expect(mockedGet).toHaveBeenCalledWith(config.usersPath)
    })

    it('unwraps the response body', async () => {
      const users = [buildUser(), buildUser()]
      mockedGet.mockResolvedValue({ data: users })

      await expect(usersService.getAll()).resolves.toEqual(users)
    })

    it('propagates a normalized request failure', async () => {
      mockedGet.mockRejectedValue({
        message: 'Please check your internet connection and try again.',
        status: 0,
      })

      await expect(usersService.getAll()).rejects.toEqual({
        message: 'Please check your internet connection and try again.',
        status: 0,
      })
    })
  })

  describe('getById', () => {
    it('resolves a user from the collection', async () => {
      const target = buildUser({ email: 'grace@lendstar.com' })
      mockedGet.mockResolvedValue({ data: [buildUser(), target, buildUser()] })

      const user = await usersService.getById(target.id)

      expect(user.id).toBe(target.id)
      expect(user.email).toBe('grace@lendstar.com')
    })

    it('throws a 404 when no user matches the id', async () => {
      mockedGet.mockResolvedValue({ data: [buildUser()] })

      await expect(usersService.getById('missing-id')).rejects.toEqual({
        message: 'User not found',
        status: 404,
      })
    })

    it('propagates a request failure rather than reporting a 404', async () => {
      mockedGet.mockRejectedValue({
        message: 'Something went wrong',
        status: 500,
      })

      await expect(usersService.getById('any-id')).rejects.toEqual({
        message: 'Something went wrong',
        status: 500,
      })
    })
  })
})
