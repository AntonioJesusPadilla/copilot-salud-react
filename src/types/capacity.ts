// Tipos para el sistema de Gestión de Capacidad Hospitalaria
// ⚠️ CRÍTICO: Este módulo maneja alertas de saturación en tiempo real

// ============================================================================
// NIVELES DE ALERTA
// ============================================================================

export type AlertLevel = 'verde' | 'amarillo' | 'rojo';
export type AlertLevelEN = 'green' | 'yellow' | 'red';

export const ALERT_LEVEL_CONFIGS = {
  verde: {
    level: 'verde' as AlertLevel,
    levelEN: 'green' as AlertLevelEN,
    label: 'Normal',
    color: '#10B981',
    bgColor: '#D1FAE5',
    darkBgColor: '#064E3B',
    icon: '✅',
    threshold: 85, // < 85%
    description: 'Capacidad normal, sin alertas',
  },
  amarillo: {
    level: 'amarillo' as AlertLevel,
    levelEN: 'yellow' as AlertLevelEN,
    label: 'Advertencia',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    darkBgColor: '#78350F',
    icon: '⚠️',
    threshold: 90, // 85-90%
    description: 'Capacidad elevada, monitorizar',
  },
  rojo: {
    level: 'rojo' as AlertLevel,
    levelEN: 'red' as AlertLevelEN,
    label: 'Crítico',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    darkBgColor: '#7F1D1D',
    icon: '🚨',
    threshold: 100, // > 90%
    description: 'Saturación crítica, acción inmediata',
  },
} as const;

// ============================================================================
// GESTIÓN DE CAMAS HOSPITALARIAS
// ============================================================================

export interface BedCapacityRecord {
  hospital: string;
  planta: string;
  camasTotales: number;
  camasOcupadas: number;
  camasDisponibles: number;
  porcentajeOcupacion: number;
  pacientesEsperando: number;
  tiempoEsperaMedioHoras: number;
  altosTramite: number;
  ingresosProgramados: number;
  alertaCapacidad: AlertLevel;
  recomendacionApertura: string;
  fechaActualizacion: string;
}

// ============================================================================
// ESTADÍSTICAS DE CAPACIDAD
// ============================================================================

export interface CapacityStats {
  // Totales del sistema
  totalCamas: number;
  totalOcupadas: number;
  totalDisponibles: number;
  ocupacionPromedio: number;

  // Alertas activas
  alertasActivas: {
    verdes: number;
    amarillas: number;
    rojas: number;
  };

  // Por hospital
  porHospital: {
    hospital: string;
    camasTotales: number;
    camasOcupadas: number;
    ocupacion: number;
    alertaGeneral: AlertLevel;
  }[];

  // Por planta
  porPlanta: {
    planta: string;
    totalCamas: number;
    ocupacionPromedio: number;
    alertasRojas: number;
  }[];

  // Predicción
  tendencia: {
    direccion: 'up' | 'down' | 'stable';
    porcentajeCambio: number;
    tiempoHastaSaturacion?: number; // en horas, si aplica
  };
}

// ============================================================================
// PREDICCIONES DE CAPACIDAD
// ============================================================================

export interface CapacityPrediction {
  hospital: string;
  planta: string;
  fechaPrediccion: string;
  ocupacionActual: number;
  ocupacionPredicha24h: number;
  ocupacionPredicha48h: number;
  ocupacionPredicha72h: number;
  probabilidadSaturacion: number; // 0-100%
  tiempoEstimadoSaturacionHoras: number | null;
  factoresRiesgo: string[];
  recomendaciones: string[];
  confianza: number; // 0-100%
}

// ============================================================================
// ALERTAS DE CAPACIDAD
// ============================================================================

export interface CapacityAlert {
  id: string;
  hospital: string;
  planta: string;
  nivel: AlertLevel;
  mensaje: string;
  ocupacionActual: number;
  umbralSuperado: number;
  timestamp: string;
  accionRecomendada: string;
  resuelta: boolean;
  resolvidaPor?: string;
  fechaResolucion?: string;
}

// ============================================================================
// RECOMENDACIONES DE APERTURA DE PLANTAS
// ============================================================================

export type RecomendacionApertura =
  | 'No necesario'
  | 'Preparar apertura'
  | 'Abrir planta adicional'
  | 'Emergencia: todas las plantas';

export interface PlantOpeningRecommendation {
  hospital: string;
  planta: string;
  recomendacion: RecomendacionApertura;
  urgencia: 'baja' | 'media' | 'alta' | 'critica';
  justificacion: string;
  recursosNecesarios: {
    personal: number;
    equipamiento: string[];
    tiempoPreparacionHoras: number;
  };
  fechaRecomendacion: string;
}

// ============================================================================
// FILTROS DE CAPACIDAD
// ============================================================================

export interface CapacityFilters {
  hospital?: string;
  planta?: string;
  alertLevel?: AlertLevel;
  ocupacionMinima?: number;
  ocupacionMaxima?: number;
  soloConEspera?: boolean;
}

// ============================================================================
// CONFIGURACIÓN DE PLANTAS
// ============================================================================

export const PLANT_CONFIGS = {
  UCI: {
    icon: '❤️‍🩹',
    color: '#DC2626',
    prioridad: 1,
    tiempoPreparacionHoras: 4,
  },
  Urgencias: {
    icon: '🚨',
    color: '#EF4444',
    prioridad: 1,
    tiempoPreparacionHoras: 2,
  },
  'Medicina Interna': {
    icon: '🩺',
    color: '#0EA5E9',
    prioridad: 2,
    tiempoPreparacionHoras: 6,
  },
  Cirugía: {
    icon: '⚕️',
    color: '#8B5CF6',
    prioridad: 2,
    tiempoPreparacionHoras: 8,
  },
  Pediatría: {
    icon: '👶',
    color: '#F97316',
    prioridad: 2,
    tiempoPreparacionHoras: 6,
  },
  Traumatología: {
    icon: '🦴',
    color: '#64748B',
    prioridad: 3,
    tiempoPreparacionHoras: 6,
  },
  Oncología: {
    icon: '🎗️',
    color: '#EC4899',
    prioridad: 2,
    tiempoPreparacionHoras: 8,
  },
  Cardiología: {
    icon: '❤️',
    color: '#F43F5E',
    prioridad: 1,
    tiempoPreparacionHoras: 4,
  },
} as const;

export type PlantName = keyof typeof PLANT_CONFIGS;

// ============================================================================
// UMBRALES DE CAPACIDAD
// ============================================================================

export const CAPACITY_THRESHOLDS = {
  // Umbrales de ocupación (porcentaje)
  ocupacion: {
    verde: 85, // < 85% es verde
    amarillo: 90, // 85-90% es amarillo
    rojo: 90, // > 90% es rojo
  },
  // Umbrales de espera (pacientes)
  espera: {
    bajo: 5,
    medio: 10,
    alto: 20,
  },
  // Umbrales de tiempo de espera (horas)
  tiempoEspera: {
    aceptable: 2,
    elevado: 4,
    critico: 8,
  },
} as const;

// ============================================================================
// HELPERS DE ALERTA
// ============================================================================

/**
 * Determina el nivel de alerta basado en el porcentaje de ocupación
 */
export function getAlertLevel(ocupacion: number): AlertLevel {
  if (ocupacion < CAPACITY_THRESHOLDS.ocupacion.verde) return 'verde';
  if (ocupacion < CAPACITY_THRESHOLDS.ocupacion.amarillo) return 'amarillo';
  return 'rojo';
}

/**
 * Obtiene la configuración de alerta para un nivel dado
 */
export function getAlertConfig(level: AlertLevel) {
  return ALERT_LEVEL_CONFIGS[level];
}

/**
 * Obtiene el color de fondo para un nivel de alerta
 */
export function getAlertBgColor(level: AlertLevel, isDarkMode: boolean = false): string {
  const config = ALERT_LEVEL_CONFIGS[level];
  return isDarkMode ? config.darkBgColor : config.bgColor;
}

/**
 * Obtiene el color del texto para un nivel de alerta
 */
export function getAlertTextColor(level: AlertLevel): string {
  return ALERT_LEVEL_CONFIGS[level].color;
}

/**
 * Determina si una planta requiere acción inmediata
 */
export function requiresImmediateAction(record: BedCapacityRecord): boolean {
  return (
    record.alertaCapacidad === 'rojo' ||
    record.pacientesEsperando > CAPACITY_THRESHOLDS.espera.alto ||
    record.tiempoEsperaMedioHoras > CAPACITY_THRESHOLDS.tiempoEspera.critico
  );
}

/**
 * Calcula la urgencia de apertura de planta
 */
export function calculateOpeningUrgency(
  ocupacion: number,
  pacientesEsperando: number,
  ingresosProgramados: number
): 'baja' | 'media' | 'alta' | 'critica' {
  const score =
    (ocupacion / 100) * 0.5 +
    Math.min(pacientesEsperando / 20, 1) * 0.3 +
    Math.min(ingresosProgramados / 10, 1) * 0.2;

  if (score < 0.5) return 'baja';
  if (score < 0.7) return 'media';
  if (score < 0.85) return 'alta';
  return 'critica';
}
