/**
 * Servicio de Alertas de Capacidad Hospitalaria
 *
 * Este servicio proporciona funciones para verificar umbrales de capacidad,
 * generar alertas, priorizarlas y formatear mensajes de alerta.
 */

import {
  BedCapacityRecord,
  CapacityAlert,
  AlertLevel,
  CAPACITY_THRESHOLDS,
  ALERT_LEVEL_CONFIGS,
} from '../types/capacity';
import { capacityPredictionService } from './capacityPredictionService';

// ============================================================================
// TIPOS LOCALES
// ============================================================================

export interface AlertSummary {
  total: number;
  critical: number;
  warning: number;
  resolved: number;
  byHospital: Record<string, number>;
  byDepartment: Record<string, number>;
}

export interface RecommendedAction {
  priority: 'immediate' | 'high' | 'medium' | 'low';
  action: string;
  department: string;
  estimatedTimeMinutes: number;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const ALERT_MESSAGES = {
  rojo: {
    occupancy: 'Ocupación crítica alcanzada',
    waiting: 'Número crítico de pacientes en espera',
    saturation: 'Riesgo inminente de saturación',
  },
  amarillo: {
    occupancy: 'Ocupación elevada - monitorizar',
    waiting: 'Pacientes en espera por encima del umbral',
    saturation: 'Posible saturación en las próximas horas',
  },
  verde: {
    occupancy: 'Ocupación dentro de parámetros normales',
    waiting: 'Nivel de espera aceptable',
    saturation: 'Sin riesgo de saturación',
  },
};

const RECOMMENDED_ACTIONS_BY_LEVEL: Record<AlertLevel, string[]> = {
  rojo: [
    'Activar protocolo de emergencia de capacidad',
    'Revisar todas las altas pendientes de tramitación',
    'Considerar traslado de pacientes estables a otros centros',
    'Contactar con Dirección Médica para coordinación',
    'Preparar apertura de planta adicional si disponible',
  ],
  amarillo: [
    'Intensificar seguimiento de ocupación cada hora',
    'Revisar altas programadas para las próximas 24h',
    'Coordinar con admisiones para gestionar ingresos',
    'Preparar recursos para posible escalada',
  ],
  verde: ['Continuar monitorización estándar', 'Mantener procedimientos habituales'],
};

// ============================================================================
// FUNCIONES DE GENERACIÓN DE ALERTAS
// ============================================================================

/**
 * Verifica los umbrales de capacidad y genera alertas
 */
export function checkCapacityAlerts(capacityData: BedCapacityRecord[]): CapacityAlert[] {
  const alerts: CapacityAlert[] = [];
  const timestamp = new Date().toISOString();

  capacityData.forEach((record) => {
    // Solo generar alertas para niveles amarillo y rojo
    if (record.alertaCapacidad === 'verde') return;

    const alert = createAlertFromRecord(record, timestamp);
    alerts.push(alert);
  });

  return alerts;
}

/**
 * Crea una alerta a partir de un registro de capacidad
 */
function createAlertFromRecord(record: BedCapacityRecord, timestamp: string): CapacityAlert {
  const isRojo = record.alertaCapacidad === 'rojo';

  // Determinar el mensaje principal
  let mensaje = '';
  if (record.porcentajeOcupacion >= CAPACITY_THRESHOLDS.ocupacion.amarillo) {
    mensaje = isRojo ? ALERT_MESSAGES.rojo.occupancy : ALERT_MESSAGES.amarillo.occupancy;
  } else if (record.pacientesEsperando > 10) {
    mensaje = isRojo ? ALERT_MESSAGES.rojo.waiting : ALERT_MESSAGES.amarillo.waiting;
  }

  mensaje += `. ${record.planta} en ${record.hospital}: ${record.porcentajeOcupacion.toFixed(1)}% ocupación.`;

  if (record.pacientesEsperando > 0) {
    mensaje += ` ${record.pacientesEsperando} pacientes en espera.`;
  }

  // Acción recomendada basada en el nivel
  const accionRecomendada = isRojo
    ? record.recomendacionApertura || 'Activar protocolo de emergencia'
    : 'Monitorizar evolución y revisar altas pendientes';

  return {
    id: `alert-${record.hospital}-${record.planta}-${Date.now()}`,
    hospital: record.hospital,
    planta: record.planta,
    nivel: record.alertaCapacidad,
    mensaje,
    ocupacionActual: record.porcentajeOcupacion,
    umbralSuperado: isRojo
      ? CAPACITY_THRESHOLDS.ocupacion.amarillo
      : CAPACITY_THRESHOLDS.ocupacion.verde,
    timestamp,
    accionRecomendada,
    resuelta: false,
  };
}

/**
 * Prioriza alertas por severidad y ocupación
 */
export function prioritizeAlerts(alerts: CapacityAlert[]): CapacityAlert[] {
  return [...alerts].sort((a, b) => {
    // Primero por nivel (rojo > amarillo > verde)
    const levelOrder: Record<AlertLevel, number> = { rojo: 0, amarillo: 1, verde: 2 };
    const levelDiff = levelOrder[a.nivel] - levelOrder[b.nivel];
    if (levelDiff !== 0) return levelDiff;

    // Luego por ocupación (mayor primero)
    const occupancyDiff = b.ocupacionActual - a.ocupacionActual;
    if (occupancyDiff !== 0) return occupancyDiff;

    // Finalmente por timestamp (más reciente primero)
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

/**
 * Formatea el mensaje de una alerta para mostrar
 */
export function formatAlertMessage(alert: CapacityAlert): string {
  const config = ALERT_LEVEL_CONFIGS[alert.nivel];
  const timeAgo = getTimeAgo(alert.timestamp);

  return (
    `${config.icon} [${config.label.toUpperCase()}] ${alert.planta} - ${alert.hospital}\n` +
    `Ocupación: ${alert.ocupacionActual.toFixed(1)}% (umbral: ${alert.umbralSuperado}%)\n` +
    `${alert.mensaje}\n` +
    `Acción: ${alert.accionRecomendada}\n` +
    `Generada: ${timeAgo}`
  );
}

/**
 * Genera lista de acciones recomendadas para una alerta
 */
export function generateRecommendedActions(alert: CapacityAlert): RecommendedAction[] {
  const actions = RECOMMENDED_ACTIONS_BY_LEVEL[alert.nivel];

  return actions.map((action, index) => ({
    priority: getPriorityFromIndex(alert.nivel, index),
    action,
    department: `${alert.planta} - ${alert.hospital}`,
    estimatedTimeMinutes: getEstimatedTime(alert.nivel, index),
  }));
}

// ============================================================================
// FUNCIONES DE RESUMEN Y ANÁLISIS
// ============================================================================

/**
 * Genera un resumen de todas las alertas
 */
export function getAlertSummary(alerts: CapacityAlert[]): AlertSummary {
  const activeAlerts = alerts.filter((a) => !a.resuelta);

  const byHospital: Record<string, number> = {};
  const byDepartment: Record<string, number> = {};

  activeAlerts.forEach((alert) => {
    byHospital[alert.hospital] = (byHospital[alert.hospital] || 0) + 1;
    byDepartment[alert.planta] = (byDepartment[alert.planta] || 0) + 1;
  });

  return {
    total: activeAlerts.length,
    critical: activeAlerts.filter((a) => a.nivel === 'rojo').length,
    warning: activeAlerts.filter((a) => a.nivel === 'amarillo').length,
    resolved: alerts.filter((a) => a.resuelta).length,
    byHospital,
    byDepartment,
  };
}

/**
 * Filtra alertas por criterios
 */
export function filterAlerts(
  alerts: CapacityAlert[],
  filters: {
    level?: AlertLevel;
    hospital?: string;
    department?: string;
    resolved?: boolean;
  }
): CapacityAlert[] {
  return alerts.filter((alert) => {
    if (filters.level && alert.nivel !== filters.level) return false;
    if (filters.hospital && alert.hospital !== filters.hospital) return false;
    if (filters.department && alert.planta !== filters.department) return false;
    if (filters.resolved !== undefined && alert.resuelta !== filters.resolved) return false;
    return true;
  });
}

/**
 * Identifica departamentos con alertas recurrentes
 */
export function identifyRecurringAlertDepartments(
  alerts: CapacityAlert[],
  thresholdCount: number = 3
): { department: string; hospital: string; count: number }[] {
  const counts: Record<string, { hospital: string; count: number }> = {};

  alerts.forEach((alert) => {
    const key = `${alert.hospital}-${alert.planta}`;
    if (!counts[key]) {
      counts[key] = { hospital: alert.hospital, count: 0 };
    }
    counts[key].count++;
  });

  return Object.entries(counts)
    .filter(([_, data]) => data.count >= thresholdCount)
    .map(([key, data]) => ({
      department: key.split('-')[1],
      hospital: data.hospital,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Genera alertas predictivas basadas en tendencias
 */
export function generatePredictiveAlerts(capacityData: BedCapacityRecord[]): CapacityAlert[] {
  const predictiveAlerts: CapacityAlert[] = [];
  const timestamp = new Date().toISOString();

  capacityData.forEach((record) => {
    // Solo para departamentos que aún están en verde pero con tendencia preocupante
    if (record.alertaCapacidad !== 'verde') return;

    const prediction = capacityPredictionService.predictOccupancy([record], 24);

    // Determinar tendencia
    const tendencia =
      prediction.ocupacionPredicha24h > prediction.ocupacionActual + 2
        ? 'creciente'
        : prediction.ocupacionPredicha24h < prediction.ocupacionActual - 2
          ? 'decreciente'
          : 'estable';

    // Si la predicción indica que pasará a amarillo o rojo
    if (prediction.ocupacionPredicha24h >= CAPACITY_THRESHOLDS.ocupacion.verde) {
      predictiveAlerts.push({
        id: `pred-alert-${record.hospital}-${record.planta}-${Date.now()}`,
        hospital: record.hospital,
        planta: record.planta,
        nivel:
          prediction.ocupacionPredicha24h >= CAPACITY_THRESHOLDS.ocupacion.amarillo
            ? 'rojo'
            : 'amarillo',
        mensaje:
          `PREDICTIVO: ${record.planta} proyecta ${prediction.ocupacionPredicha24h.toFixed(1)}% de ocupación en 24h. ` +
          `Tendencia ${tendencia}. Actuar preventivamente.`,
        ocupacionActual: record.porcentajeOcupacion,
        umbralSuperado: CAPACITY_THRESHOLDS.ocupacion.verde,
        timestamp,
        accionRecomendada: 'Revisar ingresos programados y preparar recursos adicionales',
        resuelta: false,
      });
    }
  });

  return predictiveAlerts;
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  return then.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function getPriorityFromIndex(level: AlertLevel, index: number): RecommendedAction['priority'] {
  if (level === 'rojo') {
    return index < 2 ? 'immediate' : index < 4 ? 'high' : 'medium';
  }
  if (level === 'amarillo') {
    return index < 1 ? 'high' : index < 3 ? 'medium' : 'low';
  }
  return 'low';
}

function getEstimatedTime(level: AlertLevel, index: number): number {
  const baseTimes = {
    rojo: [5, 10, 30, 15, 60],
    amarillo: [15, 30, 20, 45],
    verde: [0, 0],
  };

  return baseTimes[level][index] || 30;
}

// ============================================================================
// EXPORTACIÓN DEL SERVICIO
// ============================================================================

export const capacityAlertService = {
  checkCapacityAlerts,
  prioritizeAlerts,
  formatAlertMessage,
  generateRecommendedActions,
  getAlertSummary,
  filterAlerts,
  identifyRecurringAlertDepartments,
  generatePredictiveAlerts,
};

export default capacityAlertService;
