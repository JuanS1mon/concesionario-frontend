import axios from 'axios';
import { FiltrosAutos, Auto, Marca, Modelo, Estado, Cotizacion, Presupuesto, SolicitudVenta, Cliente, Oportunidad, Venta, VentaCreate, PrecioSugerido, SimulacionPrecio, EstadisticasPricing, MarketListing, ScrapingResult, NormalizacionResult } from '@/types';
import { API_BASE_URL } from './constants';

export const api = axios.create({
  baseURL: API_BASE_URL,
  // headers: {
  //   'Content-Type': 'application/json',
  // },
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
  getAll: (filtros?: FiltrosAutos) => api.get('/autos/', { params: filtros }),
  getPaginated: (params?: FiltrosAutos & { skip?: number; limit?: number }) => api.get('/autos/paginated/', { params }),
  getById: (id: number) => api.get(`/autos/${id}/`),
  create: (data: Partial<Auto>) => api.post('/autos/', data),
  update: (id: number, data: Partial<Auto>) => api.put(`/autos/${id}/`, data),
  delete: (id: number) => api.delete(`/autos/${id}/`),
};

// Funciones de API para marcas
export const marcasAPI = {
  getAll: () => api.get('/marcas/'),
  getById: (id: number) => api.get(`/marcas/${id}/`),
  create: (data: Partial<Marca>) => api.post('/marcas/', data),
  update: (id: number, data: Partial<Marca>) => api.put(`/marcas/${id}/`, data),
  delete: (id: number) => api.delete(`/marcas/${id}/`),
};

// Funciones de API para modelos
export const modelosAPI = {
  getAll: () => api.get('/modelos/'),
  getByMarca: (marcaId: number) => api.get(`/modelos/marca/${marcaId}/`),
  getById: (id: number) => api.get(`/modelos/${id}/`),
  create: (data: Partial<Modelo>) => api.post('/modelos/', data),
  update: (id: number, data: Partial<Modelo>) => api.put(`/modelos/${id}/`, data),
  delete: (id: number) => api.delete(`/modelos/${id}/`),
};

// Funciones de API para estados
export const estadosAPI = {
  getAll: () => api.get('/estados/'),
  getById: (id: number) => api.get(`/estados/${id}/`),
  create: (data: Partial<Estado>) => api.post('/estados/', data),
  update: (id: number, data: Partial<Estado>) => api.put(`/estados/${id}/`, data),
  delete: (id: number) => api.delete(`/estados/${id}/`),
};

// Funciones de API para cotizaciones
export const cotizacionesAPI = {
  getAll: () => api.get('/cotizaciones/'),
  create: (data: Partial<Cotizacion>) => api.post('/cotizaciones/', data),
};

// Funciones de API para presupuestos
export const presupuestosAPI = {
  getAll: () => api.get('/presupuestos/'),
  create: (data: Partial<Presupuesto>) => api.post('/presupuestos/', data),
  update: (id: number, data: Partial<Presupuesto>) => api.put(`/presupuestos/${id}/`, data),
  delete: (id: number) => api.delete(`/presupuestos/${id}/`),
};

// Funciones de API para solicitudes de venta
export const solicitudesVentaAPI = {
  getAll: () => api.get('/solicitudes-venta/'),
  create: (data: Partial<SolicitudVenta>) => api.post('/solicitudes-venta/', data),
  update: (id: number, data: Partial<SolicitudVenta>) => api.put(`/solicitudes-venta/${id}/`, data),
  delete: (id: number) => api.delete(`/solicitudes-venta/${id}/`),
};

// Funciones de API para autenticación
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login/', data),
};

// Funciones de API para clientes (CRM)
export const clientesAPI = {
  getAll: (params?: { estado?: string; calificacion?: string; activo?: boolean; busqueda?: string }) =>
    api.get('/clientes/', { params }),
  getById: (id: number) => api.get(`/clientes/${id}/`),
  create: (data: Partial<Cliente>) => api.post('/clientes/', data),
  update: (id: number, data: Partial<Cliente>) => api.put(`/clientes/${id}/`, data),
  delete: (id: number) => api.delete(`/clientes/${id}/`),
  getEstadisticas: () => api.get('/clientes/estadisticas'),
};

// Funciones de API para oportunidades (CRM)
export const oportunidadesAPI = {
  getAll: (params?: { etapa?: string; prioridad?: string; cliente_id?: number }) =>
    api.get('/oportunidades/', { params }),
  getById: (id: number) => api.get(`/oportunidades/${id}/`),
  create: (data: Partial<Oportunidad>) => api.post('/oportunidades/', data),
  update: (id: number, data: Partial<Oportunidad>) => api.put(`/oportunidades/${id}/`, data),
  delete: (id: number) => api.delete(`/oportunidades/${id}/`),
  getEstadisticas: () => api.get('/oportunidades/estadisticas'),
};

// Funciones de API para ventas
export const ventasAPI = {
  getAll: (params?: { estado?: string; cliente_id?: number; fecha_desde?: string; fecha_hasta?: string }) =>
    api.get('/ventas/', { params }),
  getById: (id: number) => api.get(`/ventas/${id}/`),
  create: (data: VentaCreate) => api.post('/ventas/', data),
  update: (id: number, data: Partial<Venta>) => api.put(`/ventas/${id}/`, data),
  delete: (id: number) => api.delete(`/ventas/${id}/`),
  getEstadisticas: () => api.get('/ventas/estadisticas'),
};

// Funciones de API para Pricing Inteligente
export const pricingAPI = {
  getAnalisis: () => api.get<PrecioSugerido[]>('/pricing/analisis'),
  getAnalisisAuto: (autoId: number) => api.get<PrecioSugerido>(`/pricing/analisis/${autoId}`),
  getComparables: (autoId: number, rangoAnio?: number) =>
    api.get<MarketListing[]>(`/pricing/comparables/${autoId}`, { params: { rango_anio: rangoAnio } }),
  simular: (autoId: number, precioPropuesto: number) =>
    api.post<SimulacionPrecio>(`/pricing/simular/${autoId}`, { precio_propuesto: precioPropuesto }),
  simularRango: (autoId: number, precioMin: number, precioMax: number, steps?: number) =>
    api.post<SimulacionPrecio[]>(`/pricing/simular-rango/${autoId}`, {
      precio_min: precioMin,
      precio_max: precioMax,
      steps: steps || 10,
    }),
  getEstadisticas: () => api.get<EstadisticasPricing>('/pricing/estadisticas'),
  getMercado: (params?: { marca_id?: number; modelo_id?: number; anio?: number; fuente?: string }) =>
    api.get<MarketListing[]>('/pricing/mercado', { params }),
  ejecutarScraping: (fuente?: string) =>
    api.post<ScrapingResult>('/pricing/scrape', null, { params: { fuente: fuente || 'all' } }),
  ejecutarNormalizacion: () => api.post<NormalizacionResult>('/pricing/normalizar'),
};