import apiClient from './client';
import type { ApiResponse } from '@/types/api.types';
import type { Jadwal, CreateJadwalRequest, UpdateJadwalRequest } from '@/types/domain.types';

export const jadwalApi = {
  getAll: async (): Promise<Jadwal[]> => {
    const res = await apiClient.get<ApiResponse<Jadwal[]>>('/admin/jadwal');
    return res.data.data;
  },

  create: async (data: CreateJadwalRequest): Promise<Jadwal> => {
    const res = await apiClient.post<ApiResponse<Jadwal>>('/admin/jadwal', data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateJadwalRequest): Promise<Jadwal> => {
    const res = await apiClient.put<ApiResponse<Jadwal>>(`/admin/jadwal/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/jadwal/${id}`);
  },
};
