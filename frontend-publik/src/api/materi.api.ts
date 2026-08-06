import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { Materi, MateriListItem } from '@/types/domain.types';

export const materiPublicApi = {
  // Ambil daftar materi per matakuliah dengan pagination
  getAllByMatakuliah: async (
    matakuliahId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<PaginatedResponse<MateriListItem>> => {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<MateriListItem>>>(
      `/public/matakuliah/${matakuliahId}/materi`,
      { params: { page, limit } }
    );
    return res.data.data;
  },

  getById: async (id: string): Promise<Materi> => {
    const res = await apiClient.get<ApiResponse<Materi>>(`/public/materi/${id}`);
    return res.data.data;
  },

  // Ambil rekomendasi materi (materi lain dari matakuliah yang sama, atau materi terbaru global)
  getRekomendasi: async (
    materiId: string, 
    isLast: boolean = false
  ): Promise<MateriListItem[]> => {
    const res = await apiClient.get<ApiResponse<MateriListItem[]>>(
      `/public/materi/${materiId}/rekomendasi`,
      { params: { isLast } }
    );
    return res.data.data;
  },
};
