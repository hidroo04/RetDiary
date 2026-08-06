import apiClient from './client';
import type { ApiResponse } from '@/types/api.types';
import type { LoginRequest, LoginResponse } from '@/types/auth.types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<ApiResponse<LoginResponse>>('/admin/auth/login', data);
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/admin/auth/logout');
  },

  getDashboard: async () => {
    const res = await apiClient.get<ApiResponse<{
      jumlahMatakuliah: number;
      jumlahMateri: number;
      materiTerbaru: {
        judul: string;
        createdAt: string;
        matakuliah: { nama: string };
      } | null;
    }>>('/admin/auth/dashboard');
    return res.data.data;
  },
};
