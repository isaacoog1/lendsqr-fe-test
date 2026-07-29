import { describe, it, expect, beforeEach } from 'vitest'
import { STORAGE_KEYS } from '@/constants'
import { apiClient } from './client'

describe('apiClient', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('has correct base URL configured', () => {
    expect(apiClient.defaults.baseURL).toBeDefined()
  })

  it('has timeout configured', () => {
    expect(apiClient.defaults.timeout).toBe(60000)
  })

  it('has Accept header set to application/json', () => {
    expect(apiClient.defaults.headers.Accept).toBe('application/json')
  })

  it('attaches auth token from localStorage via request interceptor', async () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token')

    const interceptors = apiClient.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (config: unknown) => unknown }>
    }

    const handler = interceptors.handlers[0]
    const config = { headers: {} as Record<string, string> }
    const result = handler.fulfilled(config) as typeof config

    expect(result.headers.Authorization).toBe('Bearer test-token')
  })

  it('does not attach auth header when no token exists', () => {
    const interceptors = apiClient.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (config: unknown) => unknown }>
    }

    const handler = interceptors.handlers[0]
    const config = { headers: {} as Record<string, string> }
    const result = handler.fulfilled(config) as typeof config

    expect(result.headers.Authorization).toBeUndefined()
  })
})
