import apiClient, { unwrapApiData } from './client'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type {
  Materi,
  MateriListItem,
  MateriPagesResponse,
  RekomendasiMateri,
} from '@/types/domain.types'

export const materiPublicApi = {
  // Ambil daftar materi per matakuliah dengan pagination
  getAllByMatakuliah: async (
    matakuliahId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<MateriListItem>> => {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<MateriListItem>>>(
      `/public/matakuliah/${matakuliahId}/materi`,
      { params: { page, limit } },
    )
    return unwrapApiData(res.data)
  },

  getById: async (id: string): Promise<Materi> => {
    const res = await apiClient.get<ApiResponse<Materi>>(`/public/materi/${id}`)
    return unwrapApiData(res.data)
  },

  getPages: async (id: string, page = 1, limit = 6): Promise<MateriPagesResponse> => {
    const res = await apiClient.get<ApiResponse<MateriPagesResponse>>(
      `/public/materi/${id}/pages`,
      { params: { page, limit } },
    )
    return unwrapApiData(res.data)
  },

  getRekomendasi: async (materiId: string): Promise<RekomendasiMateri> => {
    const res = await apiClient.get<ApiResponse<RekomendasiMateri>>(
      `/public/materi/${materiId}/rekomendasi`,
    )
    return unwrapApiData(res.data)
  },
}
