import axios from 'axios'
import { config } from '@/config/env'
import { normalizeError } from './errors'

/**
 * No `Authorization` header. There is no auth backend, so the stored token is
 * a local marker that authenticates nothing, and the users API is public and
 * read-only. Sending it would also break every request: the header is not
 * CORS-safelisted, so it forces a preflight, and the API answers preflight
 * with `Access-Control-Allow-Headers: Content-Type`. A credential that proves
 * nothing is not worth failing every request for.
 */
const client = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    Accept: 'application/json',
  },
  timeout: 60000,
})

/**
 * Every rejection leaves here as an `ApiError`. Cancellations are the one
 * exception: React Query cancels in-flight requests itself and reads the
 * signal, so turning one into an error would report a failure that no user
 * caused and nothing needs to recover from.
 */
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    return Promise.reject(normalizeError(error))
  },
)

export { client as apiClient }
