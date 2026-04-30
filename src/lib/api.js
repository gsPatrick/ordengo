// src/lib/api.js
import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'https://geral-ordengoapi.r954jc.easypanel.host/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token automaticamente em rotas protegidas
api.interceptors.request.use((config) => {
  const token = Cookies.get('ordengo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;