import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { Materi, MateriListItem, RekomendasiMateri } from '@/types/domain.types';

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

  getRekomendasi: async (materiId: string): Promise<RekomendasiMateri> => {
    const res = await apiClient.get<ApiResponse<RekomendasiMateri>>(
      `/public/materi/${materiId}/rekomendasi`
    );
    return res.data.data;
  },
};
