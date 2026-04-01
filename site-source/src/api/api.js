import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.sorteiospremiummultimarcas.com.br/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('client_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const IMAGE_BASE_URL = 'https://api.sorteiospremiummultimarcas.com.br/img/rifas';

export default api;
