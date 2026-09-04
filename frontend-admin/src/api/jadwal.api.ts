import apiClient, { unwrapApiData } from './client'
import type { ApiResponse } from '@/types/api.types'
import type { Jadwal, CreateJadwalRequest, UpdateJadwalRequest } from '@/types/domain.types'

export const jadwalApi = {
  getAll: async (): Promise<Jadwal[]> => {
    const res = await apiClient.get<ApiResponse<Jadwal[]>>('/admin/jadwal')
    return unwrapApiData(res.data)
  },

  create: async (data: CreateJadwalRequest): Promise<Jadwal> => {
    const res = await apiClient.post<ApiResponse<Jadwal>>('/admin/jadwal', data)
    return unwrapApiData(res.data)
  },

  update: async (id: string, data: UpdateJadwalRequest): Promise<Jadwal> => {
    const res = await apiClient.put<ApiResponse<Jadwal>>(`/admin/jadwal/${id}`, data)
    return unwrapApiData(res.data)
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/jadwal/${id}`)
  },
}
