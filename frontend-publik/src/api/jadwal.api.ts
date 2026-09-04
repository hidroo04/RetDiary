import apiClient, { unwrapApiData } from './client'
import type { ApiResponse } from '@/types/api.types'
import type { Jadwal } from '@/types/domain.types'

export const jadwalPublicApi = {
  getAll: async (): Promise<Jadwal[]> => {
    const res = await apiClient.get<ApiResponse<Jadwal[]>>('/public/jadwal')
    return unwrapApiData(res.data)
  },
}
