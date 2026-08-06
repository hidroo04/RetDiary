import apiClient from './client';
import type { ApiResponse } from '@/types/api.types';
import type {
  Matakuliah,
  CreateMatakuliahRequest,
  UpdateMatakuliahRequest,
} from '@/types/domain.types';

export const matakuliahApi = {
  getAll: async (): Promise<Matakuliah[]> => {
    const res = await apiClient.get<ApiResponse<Matakuliah[]>>('/admin/matakuliah');
    return res.data.data;
  },

  getById: async (id: string): Promise<Matakuliah> => {
    const res = await apiClient.get<ApiResponse<Matakuliah>>(`/admin/matakuliah/${id}`);
    return res.data.data;
  },

  create: async (data: CreateMatakuliahRequest): Promise<Matakuliah> => {
    const res = await apiClient.post<ApiResponse<Matakuliah>>('/admin/matakuliah', data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateMatakuliahRequest): Promise<Matakuliah> => {
    const res = await apiClient.put<ApiResponse<Matakuliah>>(`/admin/matakuliah/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/matakuliah/${id}`);
  },
};
