import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.sorteiospremiummultimarcas.com.br/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const IMAGE_BASE_URL = 'https://api.sorteiospremiummultimarcas.com.br/img/rifas';

// Add interceptor for tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (token expired/invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/dashboard/login';
    }
    return Promise.reject(error);
  }
);

export default api;
