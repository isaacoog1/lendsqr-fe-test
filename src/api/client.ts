import axios from 'axios'
import { config } from '@/config/env'
import { STORAGE_KEYS } from '@/constants'

const client = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    Accept: 'application/json',
  },
  timeout: 60000,
  timeoutErrorMessage: 'Connection timeout, please try again.',
})

client.interceptors.request.use(
  (requestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`
    }
    return requestConfig
  },
  (error) => Promise.reject(error),
)

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
