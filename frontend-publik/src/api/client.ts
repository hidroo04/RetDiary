import axios from 'axios';

// Axios instance utama untuk sisi publik — TANPA JWT Interceptor
const apiClient = axios.create({
  baseURL: '/api', // diteruskan via Vite proxy ke http://localhost:3000/api
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export default apiClient;
