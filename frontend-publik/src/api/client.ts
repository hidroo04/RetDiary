import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types/api.types'

type RetryableConfig = InternalAxiosRequestConfig & { retryCount?: number }

const wait = (duration: number) => new Promise((resolve) => window.setTimeout(resolve, duration))

// Axios instance utama untuk sisi publik — TANPA JWT Interceptor
const apiClient = axios.create({
  baseURL: '/api', // diteruskan via Vite proxy ke http://localhost:3000/api
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

apiClient.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetryableConfig | undefined
  const status = error.response?.status
  const isReadRequest = config?.method?.toLowerCase() === 'get'
  const isTemporaryFailure =
    !status || status === 408 || status === 425 || status === 429 || status >= 500
  const retryLimit = status === 429 ? 1 : 2

  if (!config || !isReadRequest || !isTemporaryFailure || error.code === 'ERR_CANCELED') {
    return Promise.reject(error)
  }

  config.retryCount = (config.retryCount ?? 0) + 1
  if (config.retryCount > retryLimit) return Promise.reject(error)

  const retryAfter = Number(error.response?.headers['retry-after'])
  const delay =
    Number.isFinite(retryAfter) && retryAfter > 0
      ? Math.min(retryAfter * 1000, 3000)
      : 250 * 2 ** (config.retryCount - 1) + Math.random() * 120
  await wait(delay)
  return apiClient.request(config)
})

export function unwrapApiData<T>(payload: ApiResponse<T>): T {
  if (
    !payload ||
    payload.success !== true ||
    !Object.prototype.hasOwnProperty.call(payload, 'data')
  ) {
    throw new Error('Respons API tidak valid. Silakan muat ulang halaman.')
  }
  return payload.data
}

export default apiClient
