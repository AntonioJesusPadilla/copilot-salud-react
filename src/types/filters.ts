// Tipos para el sistema de búsqueda y filtros avanzados

import { KPICategory, KPITrend } from './kpi';
import { HealthCenterType } from './map';
import { ProvinciaAndalucia } from './index';

// Tipo de búsqueda
export type SearchScope = 'all' | 'kpis' | 'centers' | 'data';

// Resultado de búsqueda genérico
export interface SearchResult {
  id: string;
  type: 'kpi' | 'center' | 'data';
  title: string;
  description: string;
  url?: string;
  category?: string;
  relevance: number; // score de relevancia (0-100)
  metadata?: Record<string, unknown>;
}

// Parámetros de búsqueda global
export interface SearchParams {
  query: string;
  scope: SearchScope;
  limit?: number;
  minRelevance?: number;
}

// Filtro temporal con rangos de fechas
export interface DateRangeFilter {
  startDate: Date | null;
  endDate: Date | null;
  preset?: 'last7days' | 'last30days' | 'last3months' | 'last6months' | 'lastYear' | 'custom';
}

// Filtros combinados avanzados (combina múltiples dimensiones)
export interface AdvancedFilters {
  // Geográfico
  provinces?: ProvinciaAndalucia[];

  // KPIs
  categories?: KPICategory[];
  trends?: KPITrend[];
  minValue?: number;
  maxValue?: number;

  // Centros de salud
  centerTypes?: HealthCenterType[];
  hasEmergency?: boolean;
  hasServices?: string[];

  // Temporal
  dateRange?: DateRangeFilter;

  // Texto
  searchTerm?: string;

  // Orden y límites
  sortBy?: 'name' | 'value' | 'trend' | 'date' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

// Filtro guardado como favorito
export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filters: AdvancedFilters;
  createdAt: string;
  lastUsed?: string;
  useCount: number;
  isFavorite: boolean;
}

// Período de comparación para KPIs
export interface ComparisonPeriod {
  label: string;
  startDate: Date;
  endDate: Date;
}

// Configuración del comparador de KPIs
export interface KPIComparison {
  kpiId: string;
  periods: ComparisonPeriod[];
  showPercentageChange: boolean;
  showAbsoluteChange: boolean;
}

// Resultado de comparación de KPIs
export interface KPIComparisonResult {
  kpiId: string;
  kpiName: string;
  comparisons: Array<{
    period: ComparisonPeriod;
    value: number;
    change?: number;
    changePercentage?: number;
  }>;
}

// Presets de rangos de fechas
export const DATE_RANGE_PRESETS: Record<string, DateRangeFilter> = {
  last7days: {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    preset: 'last7days',
  },
  last30days: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    preset: 'last30days',
  },
  last3months: {
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    preset: 'last3months',
  },
  last6months: {
    startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    preset: 'last6months',
  },
  lastYear: {
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    preset: 'lastYear',
  },
  custom: {
    startDate: null,
    endDate: null,
    preset: 'custom',
  },
};

// Configuración de opciones de ordenamiento
export interface SortOption {
  value: string;
  label: string;
  icon: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: 'name', label: 'Nombre (A-Z)', icon: '📝' },
  { value: 'value', label: 'Valor', icon: '📊' },
  { value: 'trend', label: 'Tendencia', icon: '📈' },
  { value: 'date', label: 'Fecha', icon: '📅' },
  { value: 'relevance', label: 'Relevancia', icon: '⭐' },
];
