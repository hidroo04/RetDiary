import apiClient, { unwrapApiData } from './client'
import type { ApiResponse } from '@/types/api.types'
import type { LoginRequest, LoginResponse } from '@/types/auth.types'

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<ApiResponse<LoginResponse>>('/admin/auth/login', data)
    return unwrapApiData(res.data)
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/admin/auth/logout')
  },

  getDashboard: async () => {
    const res = await apiClient.get<
      ApiResponse<{
        jumlahMatakuliah: number
        jumlahMateri: number
        materiTerbaru: {
          id: string
          judul: string
          createdAt: string
          matakuliah: { nama: string }
        }[]
      }>
    >('/admin/auth/dashboard')
    return unwrapApiData(res.data)
  },
}
