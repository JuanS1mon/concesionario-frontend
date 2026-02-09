// Tipos TypeScript para la aplicación de concesionarios

export interface Marca {
  id: number;
  nombre: string;
}

export interface Modelo {
  id: number;
  nombre: string;
  marca_id: number;
}

export interface Estado {
  id: number;
  nombre: string;
}

export interface Imagen {
  id: number;
  url: string;
}

export interface Auto {
  id: number;
  marca_id: number;
  modelo_id: number;
  anio: number;
  tipo: string;
  precio: number;
  descripcion?: string;
  en_stock: boolean;
  estado_id: number;
  marca?: Marca;
  modelo?: Modelo;
  estado?: Estado;
  imagenes: Imagen[];
}

export interface PaginatedAutos {
  items: Auto[];
  total: number;
  skip: number;
  limit: number;
}

export interface Cotizacion {
  id: number;
  nombre_usuario: string;
  email: string;
  telefono?: string;
  auto_id: number;
  mensaje: string;
  estado: string;
  fecha_creacion: string;
  ciudad?: string;
  fuente?: string;
  preferencias_contacto?: string;
  score: number;
  estado_oportunidad: string;
  ip?: string;
  ubicacion?: string;
  notas_admin?: string;
  auto?: Auto;
}

export interface Presupuesto {
  id: number;
  auto_id: number;
  precio_sugerido: number;
  comentarios?: string;
  estado: string;
  fecha_creacion: string;
  auto?: Auto;
}

export interface SolicitudVenta {
  id: number;
  nombre_interesado: string;
  email: string;
  telefono?: string;
  auto_id: number;
  mensaje: string;
  estado: string;
  fecha_creacion: string;
  auto?: Auto;
}

export interface Admin {
  id: number;
  email: string;
}

// Filtros para búsqueda
export interface FiltrosAutos {
  marca_id?: number;
  modelo_id?: number;
  anio_min?: number;
  anio_max?: number;
  tipo?: string;
  precio_min?: number;
  precio_max?: number;
  en_stock?: boolean;
}

// CRM - Clientes
export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  ciudad?: string;
  direccion?: string;
  fuente?: string;
  score: number;
  calificacion: string; // frio, tibio, caliente
  estado: string; // nuevo, contactado, calificado, cliente, perdido
  preferencias_contacto?: string;
  presupuesto_min?: number;
  presupuesto_max?: number;
  tipo_vehiculo_interes?: string;
  notas?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  ultimo_contacto?: string;
  ip_registro?: string;
  ubicacion_geo?: string;
  total_oportunidades?: number;
}

// CRM - Oportunidades
export interface Oportunidad {
  id: number;
  cliente_id: number;
  auto_id?: number;
  titulo: string;
  descripcion?: string;
  etapa: string; // prospecto, contacto, evaluacion, negociacion, cierre, ganada, perdida
  probabilidad: number;
  valor_estimado?: number;
  prioridad: string; // baja, media, alta, urgente
  motivo_perdida?: string;
  notas?: string;
  proxima_accion?: string;
  fecha_proxima_accion?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_cierre?: string;
  cliente?: ClienteResumen;
  auto?: Auto;
}

export interface ClienteResumen {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  calificacion: string;
}

// CRM - Estadísticas
export interface EstadisticasClientes {
  total: number;
  por_estado: {
    nuevo: number;
    contactado: number;
    calificado: number;
    cliente: number;
    perdido: number;
  };
  por_calificacion: {
    frio: number;
    tibio: number;
    caliente: number;
  };
  score_promedio: number;
}

export interface EstadisticasOportunidades {
  total: number;
  por_etapa: {
    prospecto: number;
    contacto: number;
    evaluacion: number;
    negociacion: number;
    cierre: number;
    ganada: number;
    perdida: number;
  };
  por_prioridad: {
    baja: number;
    media: number;
    alta: number;
    urgente: number;
  };
  valor_pipeline: number;
  valor_ganado: number;
  tasa_conversion: number;
}

// Ventas
export interface Venta {
  id: number;
  cliente_id: number;
  auto_vendido_id: number;
  precio_venta: number;
  auto_tomado_id?: number;
  precio_toma?: number;
  es_parte_pago: boolean;
  diferencia?: number;
  ganancia_estimada?: number;
  cotizacion_id?: number;
  oportunidad_id?: number;
  estado: string; // pendiente, completada, cancelada
  notas?: string;
  fecha_venta: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  cliente?: ClienteResumen;
  auto_vendido?: Auto;
  auto_tomado?: Auto;
  cotizacion?: CotizacionResumen;
  oportunidad?: OportunidadResumen;
}

export interface CotizacionResumen {
  id: number;
  nombre_usuario: string;
  email: string;
  estado: string;
}

export interface OportunidadResumen {
  id: number;
  titulo: string;
  etapa: string;
  valor_estimado?: number;
}

export interface AutoTomadoData {
  marca_id: number;
  modelo_id: number;
  anio: number;
  tipo: string;
  precio: number;
  descripcion?: string;
}

export interface VentaCreate {
  cliente_id: number;
  auto_vendido_id: number;
  precio_venta: number;
  precio_toma?: number;
  es_parte_pago?: boolean;
  ganancia_estimada?: number;
  cotizacion_id?: number;
  oportunidad_id?: number;
  estado?: string;
  notas?: string;
  fecha_venta?: string;
  auto_tomado_data?: AutoTomadoData;
}

export interface EstadisticasVentas {
  total: number;
  por_estado: {
    pendiente: number;
    completada: number;
    cancelada: number;
  };
  total_vendido: number;
  total_tomado: number;
  total_diferencia: number;
  ventas_con_toma: number;
  ganancia_estimada_total: number;
}

// Pricing Inteligente
export type CompetitividadTag = 'muy_competitivo' | 'competitivo' | 'caro' | 'sin_datos';

export interface MarketListing {
  id: number;
  fuente: string;
  marca_id: number;
  modelo_id: number;
  anio: number;
  km?: number;
  precio: number;
  moneda: string;
  ubicacion?: string;
  url?: string;
  activo: boolean;
  fecha_scraping?: string;
}

export interface PrecioSugerido {
  auto_id: number;
  marca?: string;
  modelo?: string;
  anio?: number;
  precio_actual: number;
  precio_mercado_promedio?: number;
  precio_mercado_mediana?: number;
  precio_sugerido?: number;
  comparables_count?: number;
  competitividad?: CompetitividadTag;
  margen_actual?: number;
  margen_sugerido?: number;
  ajuste_km?: number;
  comparables?: MarketListing[];
}

export interface SimulacionPrecio {
  precio_propuesto: number;
  dias_estimados: number;
  probabilidad_venta_30dias: number;
  margen_estimado: number;
  competitividad: CompetitividadTag;
}

export interface EstadisticasPricing {
  total_analizados: number;
  con_datos_mercado: number;
  sin_datos_mercado: number;
  muy_competitivos: number;
  competitivos: number;
  caros: number;
  margen_promedio?: number;
  precio_mercado_promedio_global?: number;
  total_listings_mercado: number;
  total_raw_listings: number;
  fuentes_activas: string[];
}

export interface ScrapingResult {
  fuente: string;
  nuevos: number;
  duplicados: number;
  errores: number;
}

export interface NormalizacionResult {
  procesados: number;
  normalizados: number;
  sin_match: number;
  outliers_filtrados: number;
}