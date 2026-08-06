import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

// Axios instance utama — semua request API menggunakan ini
const apiClient = axios.create({
  baseURL: '/api', // diteruskan via Vite proxy ke http://localhost:3000/api
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ─── Request Interceptor: Sisipkan JWT Bearer Token ────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor: Handle 401 Unauthorized ────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid — logout otomatis
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
