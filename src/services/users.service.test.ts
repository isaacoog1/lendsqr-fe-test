import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/api/client'
import { config } from '@/config/env'
import {
  buildPaginatedUsers,
  buildUser,
  buildUserStats,
} from '@/test/factories'
import { usersService } from './users.service'

vi.mock('@/api/client', () => ({
  apiClient: { get: vi.fn() },
}))

const mockedGet = vi.mocked(apiClient.get)

/** Wraps a payload the way every endpoint answers. */
function envelope<T>(data: T, status = 200) {
  return { data: { data, message: 'ok', status } }
}

describe('usersService', () => {
  beforeEach(() => {
    mockedGet.mockReset()
  })

  describe('list', () => {
    it('requests the configured users path', async () => {
      mockedGet.mockResolvedValue(envelope(buildPaginatedUsers()))

      await usersService.list()

      expect(mockedGet).toHaveBeenCalledWith(config.usersPath, { params: {} })
    })

    it('unwraps the response envelope', async () => {
      const page = buildPaginatedUsers()
      mockedGet.mockResolvedValue(envelope(page))

      await expect(usersService.list()).resolves.toEqual(page)
    })

    it('forwards paging, sorting and filters as query parameters', async () => {
      mockedGet.mockResolvedValue(envelope(buildPaginatedUsers()))

      await usersService.list({
        page: 3,
        perPage: 50,
        sortBy: 'dateJoined',
        sortOrder: 'desc',
        status: 'active',
      })

      expect(mockedGet).toHaveBeenCalledWith(config.usersPath, {
        params: {
          page: 3,
          perPage: 50,
          sortBy: 'dateJoined',
          sortOrder: 'desc',
          status: 'active',
        },
      })
    })

    // The filter form submits all six fields whether or not they were filled
    // in, and the API answers a blank `status` with a 400 rather than ignoring
    // it.
    it('drops blank filters rather than sending them', async () => {
      mockedGet.mockResolvedValue(envelope(buildPaginatedUsers()))

      await usersService.list({
        organization: 'Lendsqr',
        username: '',
        email: undefined,
      })

      expect(mockedGet).toHaveBeenCalledWith(config.usersPath, {
        params: { organization: 'Lendsqr' },
      })
    })

    it('propagates a normalized request failure', async () => {
      mockedGet.mockRejectedValue({
        message: 'Please check your internet connection and try again.',
        status: 0,
      })

      await expect(usersService.list()).rejects.toEqual({
        message: 'Please check your internet connection and try again.',
        status: 0,
      })
    })
  })

  describe('getById', () => {
    it('requests the record by id', async () => {
      mockedGet.mockResolvedValue(envelope(buildUser()))

      await usersService.getById('user-1')

      expect(mockedGet).toHaveBeenCalledWith(`${config.usersPath}/user-1`)
    })

    it('returns the full record, not a summary', async () => {
      const user = buildUser({ email: 'grace@lendstar.com' })
      mockedGet.mockResolvedValue(envelope(user))

      const result = await usersService.getById(user.id)

      expect(result.email).toBe('grace@lendstar.com')
      expect(result.personalInfo.fullName).toBe('Grace Effiom')
    })

    it("propagates the API's 404 for a missing record", async () => {
      mockedGet.mockRejectedValue({
        message: "No user found with id 'nope'",
        status: 404,
      })

      await expect(usersService.getById('nope')).rejects.toEqual({
        message: "No user found with id 'nope'",
        status: 404,
      })
    })
  })

  describe('getStats', () => {
    it('requests the stats endpoint', async () => {
      mockedGet.mockResolvedValue(envelope(buildUserStats()))

      await usersService.getStats()

      expect(mockedGet).toHaveBeenCalledWith(`${config.usersPath}/stats`)
    })

    it('unwraps the totals, breakdowns and organization list', async () => {
      const stats = buildUserStats()
      mockedGet.mockResolvedValue(envelope(stats))

      await expect(usersService.getStats()).resolves.toEqual(stats)
    })
  })
})
