import axios from 'axios';

const API_URL = 'http://localhost:4000/api';


const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bizcocho-token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      localStorage.removeItem('bizcocho-token');
      localStorage.removeItem('bizcocho-user');
      
      window.location.href = '/login';
      
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      console.error('No tienes permisos para esta acción');
    }

    if (error.response?.status === 404) {
      console.error('Recurso no encontrado');
    }

    if (error.response?.status === 500) {
      console.error('Error del servidor');
    }

    return Promise.reject(error);
  }
);

export default api;