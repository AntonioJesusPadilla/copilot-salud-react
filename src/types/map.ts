// Tipos para el sistema de mapas de centros de salud

// Tipos de centros sanitarios
export type HealthCenterType =
  | 'hospital'
  | 'centro_salud'
  | 'consultorio'
  | 'urgencias'
  | 'farmacia'
  | 'laboratorio';

// Coordenadas geográficas
export interface Coordinates {
  lat: number;
  lng: number;
}

// Centro de salud/sanitario
export interface HealthCenter {
  id: string;
  name: string;
  type: HealthCenterType;
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
  coordinates: Coordinates;

  // Información adicional
  description?: string;
  services?: string[]; // Servicios disponibles
  schedule?: string; // Horario de atención
  emergencyService?: boolean; // Tiene servicio de urgencias
  beds?: number; // Número de camas (para hospitales)

  // Metadatos
  zone?: string; // Zona sanitaria
  district?: string; // Distrito
  website?: string;
  email?: string;
}

// Configuración de tipos de centros
export interface HealthCenterTypeConfig {
  type: HealthCenterType;
  name: string;
  namePlural: string;
  icon: string;
  color: string;
  markerColor: string;
  description: string;
}

// Mapa de configuraciones por tipo
export const HEALTH_CENTER_TYPE_CONFIGS: Record<HealthCenterType, HealthCenterTypeConfig> = {
  hospital: {
    type: 'hospital',
    name: 'Hospital',
    namePlural: 'Hospitales',
    icon: '🏥',
    color: '#EF4444',
    markerColor: '#DC2626',
    description: 'Centros hospitalarios con servicios especializados',
  },
  centro_salud: {
    type: 'centro_salud',
    name: 'Centro de Salud',
    namePlural: 'Centros de Salud',
    icon: '🏢',
    color: '#3B82F6',
    markerColor: '#2563EB',
    description: 'Centros de atención primaria',
  },
  consultorio: {
    type: 'consultorio',
    name: 'Consultorio',
    namePlural: 'Consultorios',
    icon: '🏪',
    color: '#10B981',
    markerColor: '#059669',
    description: 'Consultorios locales',
  },
  urgencias: {
    type: 'urgencias',
    name: 'Punto de Urgencias',
    namePlural: 'Puntos de Urgencias',
    icon: '🚑',
    color: '#F59E0B',
    markerColor: '#D97706',
    description: 'Puntos de atención de urgencias',
  },
  farmacia: {
    type: 'farmacia',
    name: 'Farmacia',
    namePlural: 'Farmacias',
    icon: '💊',
    color: '#EC4899',
    markerColor: '#DB2777',
    description: 'Farmacias y oficinas de dispensación',
  },
  laboratorio: {
    type: 'laboratorio',
    name: 'Laboratorio',
    namePlural: 'Laboratorios',
    icon: '🔬',
    color: '#8B5CF6',
    markerColor: '#7C3AED',
    description: 'Laboratorios de análisis clínicos',
  },
};

// Filtros de mapa
export interface MapFilters {
  types?: HealthCenterType[]; // Filtrar por tipos de centros
  searchTerm?: string; // Búsqueda por nombre o dirección
  zone?: string; // Filtrar por zona sanitaria
  district?: string; // Filtrar por distrito
  emergencyOnly?: boolean; // Solo centros con urgencias
}

// Vista del mapa
export interface MapView {
  center: Coordinates;
  zoom: number;
}

// Configuración por defecto del mapa (Málaga centro)
export const DEFAULT_MAP_VIEW: MapView = {
  center: {
    lat: 36.7213,
    lng: -4.4214,
  },
  zoom: 12,
};

// Límites del mapa de Málaga
export const MALAGA_BOUNDS = {
  north: 36.85,
  south: 36.60,
  east: -4.30,
  west: -4.55,
};
