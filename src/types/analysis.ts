// Tipos para el sistema de Análisis y Generación de Directivas
// Este módulo maneja tendencias, anomalías y recomendaciones automáticas

// ============================================================================
// TIPOS DE TENDENCIA
// ============================================================================

export type TrendDirection = 'up' | 'down' | 'stable';

export interface TrendResult {
  direction: TrendDirection;
  changePercent: number;
  slope: number;
  confidence: number; // 0-100%
  startValue: number;
  endValue: number;
  dataPoints: number;
}

export const TREND_CONFIGS = {
  up: {
    icon: '📈',
    color: '#10B981',
    label: 'Tendencia alcista',
    labelShort: 'Subiendo',
  },
  down: {
    icon: '📉',
    color: '#EF4444',
    label: 'Tendencia bajista',
    labelShort: 'Bajando',
  },
  stable: {
    icon: '➡️',
    color: '#6B7280',
    label: 'Tendencia estable',
    labelShort: 'Estable',
  },
} as const;

// ============================================================================
// DETECCIÓN DE ANOMALÍAS
// ============================================================================

export type AnomalyType = 'spike' | 'drop' | 'outlier' | 'trend_break';
export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  metric: string;
  value: number;
  expectedValue: number;
  deviation: number; // en desviaciones estándar
  timestamp: string;
  hospital?: string;
  departamento?: string;
  description: string;
  possibleCauses: string[];
  recommendedActions: string[];
}

export const ANOMALY_TYPE_CONFIGS = {
  spike: {
    icon: '⬆️',
    color: '#F59E0B',
    label: 'Pico anormal',
    description: 'Valor significativamente superior al esperado',
  },
  drop: {
    icon: '⬇️',
    color: '#EF4444',
    label: 'Caída anormal',
    description: 'Valor significativamente inferior al esperado',
  },
  outlier: {
    icon: '🔴',
    color: '#DC2626',
    label: 'Valor atípico',
    description: 'Valor fuera del rango normal',
  },
  trend_break: {
    icon: '📊',
    color: '#8B5CF6',
    label: 'Ruptura de tendencia',
    description: 'Cambio brusco en la tendencia histórica',
  },
} as const;

export const ANOMALY_SEVERITY_CONFIGS = {
  low: {
    color: '#6B7280',
    bgColor: '#F3F4F6',
    label: 'Baja',
    priority: 4,
  },
  medium: {
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    label: 'Media',
    priority: 3,
  },
  high: {
    color: '#EF4444',
    bgColor: '#FEE2E2',
    label: 'Alta',
    priority: 2,
  },
  critical: {
    color: '#DC2626',
    bgColor: '#FEE2E2',
    label: 'Crítica',
    priority: 1,
  },
} as const;

// ============================================================================
// DIRECTIVAS Y RECOMENDACIONES
// ============================================================================

export type DirectiveCategory =
  | 'financial'
  | 'operational'
  | 'capacity'
  | 'quality'
  | 'efficiency'
  | 'strategic';

export type DirectivePriority = 'low' | 'medium' | 'high' | 'urgent';
export type DirectiveStatus = 'pending' | 'in_progress' | 'completed' | 'dismissed';

export interface Directive {
  id: string;
  category: DirectiveCategory;
  priority: DirectivePriority;
  status: DirectiveStatus;
  title: string;
  description: string;
  metric: string;
  currentValue: number;
  targetValue: number;
  improvement: number; // porcentaje de mejora esperada
  hospital?: string;
  departamento?: string;
  actions: string[];
  estimatedImpact: {
    financial?: number; // en euros
    efficiency?: number; // porcentaje
    quality?: number; // puntos de satisfacción
  };
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
}

export const DIRECTIVE_CATEGORY_CONFIGS = {
  financial: {
    icon: '💰',
    color: '#10B981',
    label: 'Financiero',
    description: 'Relacionado con presupuesto, costes e ingresos',
  },
  operational: {
    icon: '⚙️',
    color: '#6366F1',
    label: 'Operativo',
    description: 'Relacionado con procesos y operaciones diarias',
  },
  capacity: {
    icon: '🏥',
    color: '#EF4444',
    label: 'Capacidad',
    description: 'Relacionado con gestión de camas y recursos',
  },
  quality: {
    icon: '⭐',
    color: '#F59E0B',
    label: 'Calidad',
    description: 'Relacionado con satisfacción y calidad asistencial',
  },
  efficiency: {
    icon: '📊',
    color: '#8B5CF6',
    label: 'Eficiencia',
    description: 'Relacionado con optimización de recursos',
  },
  strategic: {
    icon: '🎯',
    color: '#EC4899',
    label: 'Estratégico',
    description: 'Relacionado con decisiones de largo plazo',
  },
} as const;

export const DIRECTIVE_PRIORITY_CONFIGS = {
  low: {
    color: '#6B7280',
    bgColor: '#F3F4F6',
    darkBgColor: '#374151',
    label: 'Baja',
    icon: '🔵',
  },
  medium: {
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    darkBgColor: '#78350F',
    label: 'Media',
    icon: '🟡',
  },
  high: {
    color: '#EF4444',
    bgColor: '#FEE2E2',
    darkBgColor: '#7F1D1D',
    label: 'Alta',
    icon: '🟠',
  },
  urgent: {
    color: '#DC2626',
    bgColor: '#FEE2E2',
    darkBgColor: '#7F1D1D',
    label: 'Urgente',
    icon: '🔴',
  },
} as const;

// ============================================================================
// INSIGHTS DE COMPARACIÓN
// ============================================================================

export interface ComparisonInsight {
  id: string;
  type: 'better' | 'worse' | 'similar';
  metric: string;
  entityA: string;
  entityB: string;
  valueA: number;
  valueB: number;
  difference: number;
  percentDifference: number;
  insight: string;
  recommendation?: string;
}

// ============================================================================
// ANÁLISIS AGREGADO
// ============================================================================

export interface AnalysisResult {
  timestamp: string;
  period: {
    start: string;
    end: string;
  };

  // Resumen ejecutivo
  summary: {
    healthScore: number; // 0-100
    mainConcerns: string[];
    opportunities: string[];
    achievements: string[];
  };

  // Tendencias detectadas
  trends: {
    financial: TrendResult;
    efficiency: TrendResult;
    capacity: TrendResult;
    satisfaction: TrendResult;
  };

  // Anomalías detectadas
  anomalies: Anomaly[];

  // Directivas generadas
  directives: Directive[];

  // Comparaciones
  comparisons: {
    vsLastMonth: ComparisonInsight[];
    vsLastYear: ComparisonInsight[];
    vsBenchmark: ComparisonInsight[];
  };

  // KPIs críticos
  criticalKPIs: {
    metric: string;
    value: number;
    threshold: number;
    status: 'ok' | 'warning' | 'critical';
  }[];
}

// ============================================================================
// CONFIGURACIÓN DE ANÁLISIS
// ============================================================================

export const ANALYSIS_CONFIG = {
  // Umbral para detectar anomalías (desviaciones estándar)
  anomalyThreshold: 2,

  // Umbral para considerar tendencia significativa (%)
  trendThreshold: 5,

  // Número mínimo de puntos para análisis de tendencia
  minDataPoints: 3,

  // Períodos de análisis
  periods: {
    shortTerm: 30, // días
    mediumTerm: 90,
    longTerm: 365,
  },

  // Peso de métricas en health score
  healthScoreWeights: {
    financial: 0.3,
    efficiency: 0.25,
    capacity: 0.25,
    satisfaction: 0.2,
  },
} as const;

// ============================================================================
// HELPERS DE ANÁLISIS
// ============================================================================

/**
 * Determina la dirección de tendencia basada en el porcentaje de cambio
 */
export function getTrendDirection(changePercent: number): TrendDirection {
  if (changePercent > ANALYSIS_CONFIG.trendThreshold) return 'up';
  if (changePercent < -ANALYSIS_CONFIG.trendThreshold) return 'down';
  return 'stable';
}

/**
 * Determina la severidad de una anomalía basada en la desviación
 */
export function getAnomalySeverity(deviation: number): AnomalySeverity {
  const absDeviation = Math.abs(deviation);
  if (absDeviation < 2.5) return 'low';
  if (absDeviation < 3) return 'medium';
  if (absDeviation < 4) return 'high';
  return 'critical';
}

/**
 * Calcula el health score general del sistema
 */
export function calculateHealthScore(metrics: {
  financial: number;
  efficiency: number;
  capacity: number;
  satisfaction: number;
}): number {
  const weights = ANALYSIS_CONFIG.healthScoreWeights;
  return Math.round(
    metrics.financial * weights.financial +
      metrics.efficiency * weights.efficiency +
      metrics.capacity * weights.capacity +
      metrics.satisfaction * weights.satisfaction
  );
}

/**
 * Obtiene la configuración de una categoría de directiva
 */
export function getDirectiveCategoryConfig(category: DirectiveCategory) {
  return DIRECTIVE_CATEGORY_CONFIGS[category];
}

/**
 * Obtiene la configuración de prioridad de directiva
 */
export function getDirectivePriorityConfig(priority: DirectivePriority) {
  return DIRECTIVE_PRIORITY_CONFIGS[priority];
}

/**
 * Ordena directivas por prioridad y fecha
 */
export function sortDirectivesByPriority(directives: Directive[]): Directive[] {
  const priorityOrder: Record<DirectivePriority, number> = {
    urgent: 1,
    high: 2,
    medium: 3,
    low: 4,
  };

  return [...directives].sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * Filtra anomalías por severidad mínima
 */
export function filterAnomaliesBySeverity(
  anomalies: Anomaly[],
  minSeverity: AnomalySeverity
): Anomaly[] {
  const severityOrder: Record<AnomalySeverity, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };

  const minOrder = severityOrder[minSeverity];
  return anomalies.filter((a) => severityOrder[a.severity] >= minOrder);
}
