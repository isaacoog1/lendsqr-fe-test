import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import { STORAGE_KEYS } from '@/constants'
import { apiClient } from './client'

const originalAdapter = apiClient.defaults.adapter

/** Captures the outgoing request and replies with `body`. */
function stubSuccess(body: unknown = {}) {
  const adapter = vi.fn<AxiosAdapter>(async (requestConfig) => ({
    data: body,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: requestConfig,
  }))

  apiClient.defaults.adapter = adapter
  return adapter
}

/** Replies the way axios does for the given transport failure. */
function stubFailure(error: unknown) {
  apiClient.defaults.adapter = vi.fn<AxiosAdapter>(() => Promise.reject(error))
}

describe('apiClient', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter
  })

  describe('configuration', () => {
    it('sends a timeout so a hung request cannot block the UI forever', () => {
      expect(apiClient.defaults.timeout).toBe(60000)
    })

    it('requests JSON', () => {
      expect(apiClient.defaults.headers.Accept).toBe('application/json')
    })

    it('resolves request paths against the configured base URL', async () => {
      const adapter = stubSuccess()

      await apiClient.get('/users')

      const sent = adapter.mock.calls[0][0]
      expect(sent.baseURL).toBe(apiClient.defaults.baseURL)
      expect(sent.url).toBe('/users')
    })
  })

  describe('auth header', () => {
    // The users API is public and read-only, and the stored token
    // authenticates nothing. Sending it would force a CORS preflight the API
    // does not allow `Authorization` through, failing every request.
    it('does not send a credential, even with a token stored', async () => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token')
      const adapter = stubSuccess()

      await apiClient.get('/users')

      const sent = adapter.mock.calls[0][0] as InternalAxiosRequestConfig
      expect(sent.headers.Authorization).toBeUndefined()
    })
  })

  describe('error normalization', () => {
    it('reports a connection failure in language a user can act on', async () => {
      stubFailure(Object.assign(new Error('Network Error'), { config: {} }))

      await expect(apiClient.get('/users')).rejects.toEqual({
        message: 'Please check your internet connection and try again.',
        status: 0,
      })
    })

    it('surfaces the server message and status for an HTTP error', async () => {
      stubFailure({
        message: 'Request failed with status code 404',
        response: { status: 404, data: { message: 'User not found' } },
      })

      await expect(apiClient.get('/users')).rejects.toEqual({
        message: 'User not found',
        status: 404,
      })
    })

    it('falls back to a generic message when the body carries none', async () => {
      stubFailure({
        message: 'Request failed with status code 500',
        response: { status: 500, data: {} },
      })

      await expect(apiClient.get('/users')).rejects.toEqual({
        message: 'Something went wrong',
        status: 500,
      })
    })
  })

  describe('response handling', () => {
    it('passes the body through untouched on success', async () => {
      stubSuccess([{ id: 'user-1' }])

      const response = await apiClient.get('/users')

      expect(response.data).toEqual([{ id: 'user-1' }])
    })
  })
})
