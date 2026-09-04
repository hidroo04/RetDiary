import apiClient, { unwrapApiData } from './client'
import type { ApiResponse } from '@/types/api.types'
import type { Matakuliah, MateriListItem } from '@/types/domain.types'

export interface SearchResult {
  matakuliah: Matakuliah[]
  materi: MateriListItem[]
}

export const searchApi = {
  search: async (query: string): Promise<SearchResult> => {
    const res = await apiClient.get<ApiResponse<SearchResult>>('/public/search', {
      params: { q: query },
    })
    return unwrapApiData(res.data)
  },
}
