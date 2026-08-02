import { describe, it, expect, afterEach } from 'vitest'
import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { ERROR_MESSAGES, NO_RESPONSE, normalizeError } from './errors'

function responseOf(status: number, data: unknown): AxiosResponse {
  return {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  }
}

/** The failure axios raises when no response comes back, whatever the cause. */
function transportError(): AxiosError {
  return new AxiosError('Network Error', AxiosError.ERR_NETWORK)
}

const originalOnLine = Object.getOwnPropertyDescriptor(
  window.navigator,
  'onLine',
)

function setBrowserOnline(online: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    get: () => online,
  })
}

describe('normalizeError', () => {
  afterEach(() => {
    if (originalOnLine) {
      Object.defineProperty(window.navigator, 'onLine', originalOnLine)
    } else {
      Reflect.deleteProperty(window.navigator, 'onLine')
    }
  })

  describe('when no response arrived', () => {
    // Axios cannot tell these apart — a dead API, a DNS failure, a CORS
    // rejection and an unplugged cable all arrive as the same `Network Error`.
    // Blaming the user's connection for all four sends them to reboot a router
    // that is working fine.
    it('blames the connection only when the browser reports being offline', () => {
      setBrowserOnline(false)

      expect(normalizeError(transportError())).toEqual({
        message: ERROR_MESSAGES.offline,
        status: NO_RESPONSE,
      })
    })

    it('blames the server when the browser has a network', () => {
      setBrowserOnline(true)

      expect(normalizeError(transportError())).toEqual({
        message: ERROR_MESSAGES.unreachable,
        status: NO_RESPONSE,
      })
    })

    it('does not mention the internet connection when the server is reachable', () => {
      setBrowserOnline(true)

      expect(normalizeError(transportError()).message).not.toMatch(/internet/i)
    })

    it('names a timeout as a timeout rather than a lost connection', () => {
      setBrowserOnline(true)

      expect(
        normalizeError(new AxiosError('timeout', AxiosError.ECONNABORTED)),
      ).toEqual({
        message: ERROR_MESSAGES.timeout,
        status: NO_RESPONSE,
      })
    })

    it('reports a timeout even while offline, since that is what happened', () => {
      setBrowserOnline(false)

      expect(
        normalizeError(new AxiosError('timeout', AxiosError.ETIMEDOUT)).message,
      ).toBe(ERROR_MESSAGES.timeout)
    })
  })

  describe('when the server answered', () => {
    it('surfaces the message and status the API sent', () => {
      const error = new AxiosError('Request failed with status code 404')
      error.response = responseOf(404, { message: 'User not found' })

      expect(normalizeError(error)).toEqual({
        message: 'User not found',
        status: 404,
      })
    })

    it('falls back to a generic message when the body carries none', () => {
      const error = new AxiosError('Request failed with status code 500')
      error.response = responseOf(500, {})

      expect(normalizeError(error)).toEqual({
        message: ERROR_MESSAGES.unknown,
        status: 500,
      })
    })

    // A 5xx is the server's problem, not the network's, and telling the user
    // to check their connection would send them looking in the wrong place.
    it('does not mention connectivity for a server error, even while offline', () => {
      setBrowserOnline(false)
      const error = new AxiosError('Request failed with status code 503')
      error.response = responseOf(503, {})

      expect(normalizeError(error).message).not.toMatch(/offline|connection/i)
    })
  })

  it('normalizes a non-axios rejection rather than leaking it', () => {
    expect(
      normalizeError(new TypeError('undefined is not a function')),
    ).toEqual({
      message: ERROR_MESSAGES.unknown,
      status: NO_RESPONSE,
    })
  })
})
