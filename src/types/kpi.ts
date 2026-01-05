// Tipos para el sistema de KPIs de salud

// Categorías de KPIs
export type KPICategory =
  | 'asistencia_sanitaria'
  | 'salud_publica'
  | 'recursos_humanos'
  | 'infraestructura'
  | 'farmacia'
  | 'urgencias';

// Nivel de acceso requerido para ver un KPI
export type KPIAccessLevel = 'basico' | 'intermedio' | 'completo';

// Tendencia del KPI
export type KPITrend = 'up' | 'down' | 'stable';

// Punto de datos históricos
export interface KPIDataPoint {
  date: string; // formato: "YYYY-MM" o "YYYY-MM-DD"
  value: number;
  label?: string; // etiqueta opcional para el eje X
}

// Estructura principal de un KPI
export interface KPI {
  id: string;
  name: string;
  description: string;
  category: KPICategory;
  accessLevel: KPIAccessLevel; // nivel de acceso requerido

  // Valor actual
  currentValue: number;
  previousValue?: number; // valor del período anterior para calcular cambio
  unit: string; // unidad de medida (%, personas, horas, etc.)

  // Tendencia y cambio
  trend: KPITrend;
  changePercentage?: number; // % de cambio respecto al período anterior

  // Datos históricos para gráficas
  historicalData: KPIDataPoint[];

  // Metadatos
  source: string; // fuente de los datos
  lastUpdated: string; // fecha de última actualización
  province?: string; // provincia específica (por defecto Málaga)

  // Visualización
  icon?: string; // emoji o icono
  color?: string; // color personalizado para el KPI
  format?: 'number' | 'percentage' | 'currency' | 'decimal'; // formato de visualización
}

// Filtros para KPIs
export interface KPIFilters {
  category?: KPICategory;
  accessLevel?: KPIAccessLevel;
  searchTerm?: string;
  province?: string;
}

// Configuración de categorías
export interface KPICategoryConfig {
  category: KPICategory;
  name: string;
  icon: string;
  color: string;
  description: string;
}

// Mapa de configuración de categorías
export const KPI_CATEGORY_CONFIGS: Record<KPICategory, KPICategoryConfig> = {
  asistencia_sanitaria: {
    category: 'asistencia_sanitaria',
    name: 'Asistencia Sanitaria',
    icon: '🏥',
    color: '#3B82F6',
    description: 'Indicadores de atención médica y consultas',
  },
  salud_publica: {
    category: 'salud_publica',
    name: 'Salud Pública',
    icon: '🏛️',
    color: '#10B981',
    description: 'Indicadores de salud poblacional y prevención',
  },
  recursos_humanos: {
    category: 'recursos_humanos',
    name: 'Recursos Humanos',
    icon: '👥',
    color: '#F59E0B',
    description: 'Personal sanitario y profesionales',
  },
  infraestructura: {
    category: 'infraestructura',
    name: 'Infraestructura',
    icon: '🏗️',
    color: '#8B5CF6',
    description: 'Centros de salud y equipamiento',
  },
  farmacia: {
    category: 'farmacia',
    name: 'Farmacia',
    icon: '💊',
    color: '#EC4899',
    description: 'Prescripción y dispensación de medicamentos',
  },
  urgencias: {
    category: 'urgencias',
    name: 'Urgencias',
    icon: '🚑',
    color: '#EF4444',
    description: 'Atención de urgencias y emergencias',
  },
};

// Mapeo de niveles de acceso a roles
export const ACCESS_LEVEL_PERMISSIONS = {
  basico: ['admin', 'gestor', 'analista', 'invitado'],
  intermedio: ['admin', 'gestor', 'analista'],
  completo: ['admin', 'gestor'],
} as const;
