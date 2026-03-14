import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.sorteiospremiummultimarcas.com.br/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add interceptor for tokens if needed later
api.interceptors.request.use((config) => {
  // const token = localStorage.getItem('admin_token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

export default api;
