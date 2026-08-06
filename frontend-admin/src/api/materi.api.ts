import apiClient from './client';
import type { ApiResponse } from '@/types/api.types';
import type {
  Materi,
  MateriListItem,
  CreateMateriRequest,
  UpdateMateriRequest,
  FotoMateri,
} from '@/types/domain.types';

export const materiApi = {
  getAllByMatakuliah: async (matakuliahId: string): Promise<MateriListItem[]> => {
    const res = await apiClient.get<ApiResponse<MateriListItem[]>>(
      `/admin/matakuliah/${matakuliahId}/materi`,
    );
    return res.data.data;
  },

  create: async (data: CreateMateriRequest, pdfFile?: File): Promise<Materi> => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value));
    });
    if (pdfFile) formData.append('pdf', pdfFile);
    const res = await apiClient.post<ApiResponse<Materi>>('/admin/materi', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  update: async (id: string, data: UpdateMateriRequest, pdfFile?: File): Promise<Materi> => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value));
    });
    if (pdfFile) formData.append('pdf', pdfFile);
    const res = await apiClient.put<ApiResponse<Materi>>(`/admin/materi/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/materi/${id}`);
  },

  uploadFoto: async (materiId: string, files: File[]): Promise<FotoMateri[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('foto', file));
    const res = await apiClient.post<ApiResponse<FotoMateri[]>>(
      `/admin/materi/${materiId}/foto`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data.data;
  },

  deleteFoto: async (fotoId: string): Promise<void> => {
    await apiClient.delete(`/admin/foto/${fotoId}`);
  },
};
