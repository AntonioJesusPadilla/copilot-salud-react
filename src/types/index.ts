// Tipos de usuario y roles
export type UserRole = 'medico' | 'enfermero' | 'administrador' | 'paciente';

export interface User {
  username: string;
  role: UserRole;
  name: string;
  email?: string;
}

// Tipos de centros de salud
export interface CentroSalud {
  id: string;
  nombre: string;
  provincia: string;
  direccion: string;
  latitud: number;
  longitud: number;
  tipo: 'centro_salud' | 'hospital' | 'clinica';
  telefono?: string;
  email?: string;
  servicios?: string[];
}

// Tipos de KPIs
export interface KPI {
  id: string;
  nombre: string;
  descripcion: string;
  valor: number;
  unidad: string;
  tendencia?: 'up' | 'down' | 'stable';
  cambio?: number;
  fecha: Date;
  categoria?: string;
}

// Tipos de rango de fechas
export interface DateRange {
  start: Date;
  end: Date;
}

// Tipos de provincias de Andalucía
export type ProvinciaAndalucia =
  | 'Todas'
  | 'Almería'
  | 'Cádiz'
  | 'Córdoba'
  | 'Granada'
  | 'Huelva'
  | 'Jaén'
  | 'Málaga'
  | 'Sevilla';

export const PROVINCIAS_ANDALUCIA: ProvinciaAndalucia[] = [
  'Todas', 'Almería', 'Cádiz', 'Córdoba', 'Granada',
  'Huelva', 'Jaén', 'Málaga', 'Sevilla'
];
