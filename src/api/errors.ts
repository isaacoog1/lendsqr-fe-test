import axios, { AxiosError } from 'axios'
import type { ApiError } from '@/types'

/**
 * `ApiError.status` when no HTTP response ever arrived. There is no status
 * code to report in that case, and `0` is what `XMLHttpRequest` itself uses.
 */
export const NO_RESPONSE = 0

/**
 * Axios reports a single `Network Error` for every failure that stopped a
 * request before a response came back: the machine being offline, DNS not
 * resolving, the API being down, a TLS or CORS rejection, an extension or
 * corporate proxy blocking the call. Only the first of those is the user's
 * internet connection, so only the first message says so.
 */
export const ERROR_MESSAGES = {
  offline: "You're offline. Check your internet connection and try again.",
  unreachable:
    "We couldn't reach the server. It may be temporarily unavailable. Please try again.",
  timeout: 'The server took too long to respond. Please try again.',
  unknown: 'Something went wrong. Please try again.',
} as const

/**
 * `navigator.onLine` is only worth trusting when it is false: the browser
 * knows it has no usable network interface, so nothing could have left the
 * machine. True means an interface exists, not that the API is reachable — a
 * captive portal, a dead server, a DNS failure and a CORS rejection all report
 * true. It can therefore confirm the user's connection is at fault; it can
 * never confirm that it isn't.
 */
function isBrowserOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

function isTimeout(error: AxiosError): boolean {
  return (
    error.code === AxiosError.ECONNABORTED ||
    error.code === AxiosError.ETIMEDOUT
  )
}

/**
 * Turns anything a request can reject with into the one shape the UI renders.
 * Nothing above this point sees an Axios error, and no message reaches a user
 * unless it was written here or by the API.
 */
export function normalizeError(error: unknown): ApiError {
  if (!axios.isAxiosError<{ message?: string }>(error)) {
    return { message: ERROR_MESSAGES.unknown, status: NO_RESPONSE }
  }

  // The server answered, so it can speak for itself. Bad input comes back as a
  // 400 naming the offending parameter, which is more useful than our copy.
  if (error.response) {
    return {
      message: error.response.data?.message || ERROR_MESSAGES.unknown,
      status: error.response.status,
    }
  }

  if (isTimeout(error)) {
    return { message: ERROR_MESSAGES.timeout, status: NO_RESPONSE }
  }

  return {
    message: isBrowserOffline()
      ? ERROR_MESSAGES.offline
      : ERROR_MESSAGES.unreachable,
    status: NO_RESPONSE,
  }
}
