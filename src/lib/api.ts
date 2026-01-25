import axios from 'axios';
import { FiltrosAutos, Auto, Marca, Modelo, Estado, Cotizacion, Presupuesto, SolicitudVenta } from '@/types';

// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
console.log('API_BASE_URL:', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Funciones de API para autos
export const autosAPI = {
  getAll: (filtros?: FiltrosAutos) => api.get('/autos', { params: filtros }),
  getById: (id: number) => api.get(`/autos/${id}`),
  create: (data: Partial<Auto>) => api.post('/autos', data),
  update: (id: number, data: Partial<Auto>) => api.put(`/autos/${id}`, data),
  delete: (id: number) => api.delete(`/autos/${id}`),
};

// Funciones de API para marcas
export const marcasAPI = {
  getAll: () => api.get('/marcas'),
  getById: (id: number) => api.get(`/marcas/${id}`),
  create: (data: Partial<Marca>) => api.post('/marcas', data),
  update: (id: number, data: Partial<Marca>) => api.put(`/marcas/${id}`, data),
  delete: (id: number) => api.delete(`/marcas/${id}`),
};

// Funciones de API para modelos
export const modelosAPI = {
  getAll: () => api.get('/modelos'),
  getById: (id: number) => api.get(`/modelos/${id}`),
  create: (data: Partial<Modelo>) => api.post('/modelos', data),
  update: (id: number, data: Partial<Modelo>) => api.put(`/modelos/${id}`, data),
  delete: (id: number) => api.delete(`/modelos/${id}`),
};

// Funciones de API para estados
export const estadosAPI = {
  getAll: () => api.get('/estados'),
  getById: (id: number) => api.get(`/estados/${id}`),
  create: (data: Partial<Estado>) => api.post('/estados', data),
  update: (id: number, data: Partial<Estado>) => api.put(`/estados/${id}`, data),
  delete: (id: number) => api.delete(`/estados/${id}`),
};

// Funciones de API para cotizaciones
export const cotizacionesAPI = {
  getAll: () => api.get('/cotizaciones'),
  create: (data: Partial<Cotizacion>) => api.post('/cotizaciones', data),
};

// Funciones de API para presupuestos
export const presupuestosAPI = {
  getAll: () => api.get('/presupuestos'),
  create: (data: Partial<Presupuesto>) => api.post('/presupuestos', data),
  update: (id: number, data: Partial<Presupuesto>) => api.put(`/presupuestos/${id}`, data),
  delete: (id: number) => api.delete(`/presupuestos/${id}`),
};

// Funciones de API para solicitudes de venta
export const solicitudesVentaAPI = {
  getAll: () => api.get('/solicitudes-venta'),
  create: (data: Partial<SolicitudVenta>) => api.post('/solicitudes-venta', data),
  update: (id: number, data: Partial<SolicitudVenta>) => api.put(`/solicitudes-venta/${id}`, data),
  delete: (id: number) => api.delete(`/solicitudes-venta/${id}`),
};

// Funciones de API para autenticación
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
};