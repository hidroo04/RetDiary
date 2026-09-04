import apiClient, { unwrapApiData } from './client'
import type { ApiResponse } from '@/types/api.types'
import type {
  Matakuliah,
  CreateMatakuliahRequest,
  UpdateMatakuliahRequest,
} from '@/types/domain.types'

export const matakuliahApi = {
  getAll: async (): Promise<Matakuliah[]> => {
    const res = await apiClient.get<ApiResponse<Matakuliah[]>>('/admin/matakuliah')
    return unwrapApiData(res.data)
  },

  getById: async (id: string): Promise<Matakuliah> => {
    const res = await apiClient.get<ApiResponse<Matakuliah>>(`/admin/matakuliah/${id}`)
    return unwrapApiData(res.data)
  },

  create: async (data: CreateMatakuliahRequest, thumbnailFile?: File): Promise<Matakuliah> => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value))
    })
    if (thumbnailFile) formData.append('thumbnail', thumbnailFile)
    const res = await apiClient.post<ApiResponse<Matakuliah>>('/admin/matakuliah', formData)
    return unwrapApiData(res.data)
  },

  update: async (
    id: string,
    data: UpdateMatakuliahRequest,
    thumbnailFile?: File,
  ): Promise<Matakuliah> => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value))
    })
    if (thumbnailFile) formData.append('thumbnail', thumbnailFile)
    const res = await apiClient.put<ApiResponse<Matakuliah>>(`/admin/matakuliah/${id}`, formData)
    return unwrapApiData(res.data)
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/matakuliah/${id}`)
  },
}
