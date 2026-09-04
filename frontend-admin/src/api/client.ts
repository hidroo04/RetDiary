import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import type { ApiResponse } from '@/types/api.types'

type RetryableConfig = InternalAxiosRequestConfig & { retryCount?: number }

const wait = (duration: number) => new Promise((resolve) => window.setTimeout(resolve, duration))

// Axios instance utama — semua request API menggunakan ini
const apiClient = axios.create({
  baseURL: '/api', // diteruskan via Vite proxy ke http://localhost:3000/api
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// ─── Request Interceptor: Sisipkan JWT Bearer Token ────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Retry hanya request baca yang gagal sementara. Mutation tidak pernah diulang
// otomatis agar data tidak tercipta atau berubah dua kali.
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

// ─── Response Interceptor: Handle 401 Unauthorized ────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid — logout otomatis
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

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
