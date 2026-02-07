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