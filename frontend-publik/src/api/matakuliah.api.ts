import apiClient from './client';
import type { ApiResponse } from '@/types/api.types';
import type { Matakuliah } from '@/types/domain.types';

export const matakuliahPublicApi = {
  getAll: async (): Promise<Matakuliah[]> => {
    const res = await apiClient.get<ApiResponse<Matakuliah[]>>('/public/matakuliah');
    return res.data.data;
  },

  getById: async (id: string): Promise<Matakuliah> => {
    const res = await apiClient.get<ApiResponse<Matakuliah>>(`/public/matakuliah/${id}`);
    return res.data.data;
  },
};
