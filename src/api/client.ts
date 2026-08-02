import axios from 'axios'
import { config } from '@/config/env'

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
  timeoutErrorMessage: 'Connection timeout, please try again.',
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    const status = error.response?.status
    const message = error.response?.data?.message || 'Something went wrong'

    if (error?.message === 'Network Error') {
      return Promise.reject({
        message: 'Please check your internet connection and try again.',
        status: 0,
      })
    }

    return Promise.reject({
      message,
      status,
    })
  },
)

export { client as apiClient }
