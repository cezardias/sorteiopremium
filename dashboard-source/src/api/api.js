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

export default api;
