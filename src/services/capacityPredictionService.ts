/**
 * Servicio de Predicción de Capacidad Hospitalaria
 *
 * Este servicio proporciona funciones para predecir la ocupación hospitalaria,
 * calcular niveles de riesgo y generar recomendaciones de capacidad.
 */

import { BedCapacityRecord, CapacityPrediction, RecomendacionApertura } from '../types/capacity';

// ============================================================================
// TIPOS LOCALES
// ============================================================================

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PredictionResult {
  currentOccupancy: number;
  predictedOccupancy24h: number;
  predictedOccupancy48h: number;
  predictedOccupancy72h: number;
  confidence: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  riskLevel: RiskLevel;
  recommendation: string;
}

export interface SaturationEstimate {
  hoursToSaturation: number | null;
  isAtRisk: boolean;
  urgency: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// CONSTANTES
// ============================================================================

const RISK_THRESHOLDS = {
  low: 75,
  medium: 85,
  high: 90,
  critical: 95,
};

// ============================================================================
// FUNCIONES DE PREDICCIÓN
// ============================================================================

/**
 * Predice la ocupación futura basándose en datos históricos
 */
export function predictOccupancy(
  historicalData: BedCapacityRecord[],
  hoursAhead: number = 24
): CapacityPrediction {
  if (historicalData.length === 0) {
    return {
      hospital: '',
      planta: '',
      fechaPrediccion: new Date().toISOString(),
      ocupacionActual: 0,
      ocupacionPredicha24h: 0,
      ocupacionPredicha48h: 0,
      ocupacionPredicha72h: 0,
      probabilidadSaturacion: 0,
      tiempoEstimadoSaturacionHoras: null,
      factoresRiesgo: [],
      recomendaciones: [],
      confianza: 0,
    };
  }

  // Usar el primer registro como referencia (en producción usaríamos datos históricos reales)
  const currentRecord = historicalData[0];
  const currentOccupancy = currentRecord.porcentajeOcupacion;

  // Calcular tendencia basada en ingresos/altas programados
  const netFlow = currentRecord.ingresosProgramados - currentRecord.altosTramite;
  const capacityChange = (netFlow / currentRecord.camasTotales) * 100;

  // Factor de ajuste basado en la cola de espera
  const waitingPressure = (currentRecord.pacientesEsperando / currentRecord.camasTotales) * 5;

  // Predicciones con incertidumbre creciente
  const predicted24h = Math.min(
    100,
    Math.max(0, currentOccupancy + capacityChange + waitingPressure * 0.3)
  );
  const predicted48h = Math.min(
    100,
    Math.max(0, predicted24h + capacityChange * 0.8 + waitingPressure * 0.2)
  );
  const predicted72h = Math.min(
    100,
    Math.max(0, predicted48h + capacityChange * 0.6 + waitingPressure * 0.1)
  );

  // Calcular confianza basada en la volatilidad de los datos
  const confidence = Math.max(60, 95 - (hoursAhead / 72) * 30);

  // Calcular probabilidad de saturación
  const saturationProb =
    predicted72h >= 95 ? 90 : predicted72h >= 90 ? 70 : predicted72h >= 85 ? 40 : 10;

  // Generar factores de riesgo
  const factoresRiesgo: string[] = [];
  if (currentRecord.pacientesEsperando > 10) factoresRiesgo.push('Alta demanda en espera');
  if (currentRecord.ingresosProgramados > 5) factoresRiesgo.push('Múltiples ingresos programados');
  if (currentOccupancy > 85) factoresRiesgo.push('Ocupación actual elevada');
  if (netFlow > 0) factoresRiesgo.push('Flujo neto positivo de pacientes');

  // Generar recomendaciones
  const recomendaciones: string[] = [];
  if (predicted24h >= 90) recomendaciones.push('Preparar apertura de planta adicional');
  if (currentRecord.altosTramite > 0)
    recomendaciones.push(`Priorizar ${currentRecord.altosTramite} altas pendientes`);
  if (predicted24h >= 85) recomendaciones.push('Intensificar monitorización cada hora');

  return {
    hospital: currentRecord.hospital,
    planta: currentRecord.planta,
    fechaPrediccion: new Date().toISOString(),
    ocupacionActual: currentOccupancy,
    ocupacionPredicha24h: predicted24h,
    ocupacionPredicha48h: predicted48h,
    ocupacionPredicha72h: predicted72h,
    probabilidadSaturacion: saturationProb,
    tiempoEstimadoSaturacionHoras: predicted72h >= 95 ? 48 : null,
    factoresRiesgo,
    recomendaciones,
    confianza: confidence,
  };
}

/**
 * Calcula el nivel de riesgo basado en ocupación actual y proyectada
 */
export function calculateRiskLevel(
  currentOccupancy: number,
  projectedOccupancy: number
): RiskLevel {
  // Usar el mayor entre actual y proyectado
  const maxOccupancy = Math.max(currentOccupancy, projectedOccupancy);

  if (maxOccupancy >= RISK_THRESHOLDS.critical) return 'critical';
  if (maxOccupancy >= RISK_THRESHOLDS.high) return 'high';
  if (maxOccupancy >= RISK_THRESHOLDS.medium) return 'medium';
  return 'low';
}

/**
 * Genera una recomendación de capacidad basada en el nivel de riesgo
 */
export function generateCapacityRecommendation(
  riskLevel: RiskLevel,
  projectedOccupancy: number,
  department: string
): string {
  switch (riskLevel) {
    case 'critical':
      return (
        `URGENTE: ${department} alcanzará ${projectedOccupancy.toFixed(1)}% de ocupación. ` +
        'Activar protocolo de emergencia. Considerar traslado de pacientes a otros centros.'
      );

    case 'high':
      return (
        `ALERTA: ${department} proyecta ${projectedOccupancy.toFixed(1)}% de ocupación. ` +
        'Preparar apertura de planta adicional. Revisar altas pendientes.'
      );

    case 'medium':
      return (
        `ATENCIÓN: ${department} muestra tendencia alcista (${projectedOccupancy.toFixed(1)}%). ` +
        'Monitorizar evolución. Coordinar con admisiones.'
      );

    default:
      return (
        `${department} opera con normalidad (${projectedOccupancy.toFixed(1)}%). ` +
        'Continuar monitorización estándar.'
      );
  }
}

/**
 * Estima el tiempo hasta la saturación completa
 */
export function estimateTimeToSaturation(
  currentOccupancy: number,
  avgDailyAdmissions: number,
  avgDailyDischarges: number,
  totalBeds: number
): SaturationEstimate {
  // Si ya está saturado
  if (currentOccupancy >= 100) {
    return {
      hoursToSaturation: 0,
      isAtRisk: true,
      urgency: 'critical',
    };
  }

  // Calcular tasa neta de cambio (camas por día)
  const netDailyChange = avgDailyAdmissions - avgDailyDischarges;

  // Si el flujo es negativo o cero, no hay riesgo de saturación
  if (netDailyChange <= 0) {
    return {
      hoursToSaturation: null,
      isAtRisk: false,
      urgency: 'none',
    };
  }

  // Calcular camas restantes
  const occupiedBeds = Math.round(totalBeds * (currentOccupancy / 100));
  const remainingBeds = totalBeds - occupiedBeds;

  // Calcular días hasta saturación
  const daysToSaturation = remainingBeds / netDailyChange;
  const hoursToSaturation = daysToSaturation * 24;

  // Determinar urgencia
  let urgency: SaturationEstimate['urgency'] = 'none';
  if (hoursToSaturation <= 24) urgency = 'critical';
  else if (hoursToSaturation <= 48) urgency = 'high';
  else if (hoursToSaturation <= 72) urgency = 'medium';
  else if (hoursToSaturation <= 120) urgency = 'low';

  return {
    hoursToSaturation: Math.round(hoursToSaturation),
    isAtRisk: hoursToSaturation <= 72,
    urgency,
  };
}

/**
 * Determina si se necesita abrir una planta adicional
 */
export function shouldOpenPlant(
  currentOccupancy: number,
  projectedOccupancy: number,
  scheduledSurgeries: number,
  patientsWaiting: number = 0
): { shouldOpen: boolean; recommendation: RecomendacionApertura; reason: string } {
  // Factores de presión adicional
  const surgeryPressure = scheduledSurgeries > 5 ? 5 : scheduledSurgeries;
  const waitingPressure = patientsWaiting > 10 ? 10 : patientsWaiting;

  // Ocupación efectiva considerando presión
  const effectiveOccupancy = projectedOccupancy + surgeryPressure + waitingPressure * 0.5;

  if (effectiveOccupancy >= 95 || currentOccupancy >= 95) {
    return {
      shouldOpen: true,
      recommendation: 'Emergencia: todas las plantas',
      reason:
        `Saturación crítica (${currentOccupancy.toFixed(1)}% actual, ${projectedOccupancy.toFixed(1)}% proyectado). ` +
        `${patientsWaiting} pacientes en espera.`,
    };
  }

  if (effectiveOccupancy >= 90 || (projectedOccupancy >= 90 && scheduledSurgeries > 3)) {
    return {
      shouldOpen: true,
      recommendation: 'Abrir planta adicional',
      reason: `Alta ocupación (${projectedOccupancy.toFixed(1)}% proyectado) con ${scheduledSurgeries} cirugías programadas.`,
    };
  }

  if (effectiveOccupancy >= 85 || (currentOccupancy >= 80 && projectedOccupancy >= 85)) {
    return {
      shouldOpen: false,
      recommendation: 'Preparar apertura',
      reason: `Ocupación moderada-alta (${projectedOccupancy.toFixed(1)}% proyectado). Mantener preparación.`,
    };
  }

  return {
    shouldOpen: false,
    recommendation: 'No necesario',
    reason: `Ocupación bajo control (${currentOccupancy.toFixed(1)}% actual).`,
  };
}

/**
 * Genera predicciones completas para un conjunto de datos de capacidad
 */
export function generateFullPredictions(capacityData: BedCapacityRecord[]): PredictionResult[] {
  return capacityData.map((record) => {
    const prediction = predictOccupancy([record], 72);
    const riskLevel = calculateRiskLevel(
      record.porcentajeOcupacion,
      prediction.ocupacionPredicha24h
    );

    // Determinar tendencia
    const trend: 'increasing' | 'stable' | 'decreasing' =
      prediction.ocupacionPredicha24h > prediction.ocupacionActual + 2
        ? 'increasing'
        : prediction.ocupacionPredicha24h < prediction.ocupacionActual - 2
          ? 'decreasing'
          : 'stable';

    return {
      currentOccupancy: record.porcentajeOcupacion,
      predictedOccupancy24h: prediction.ocupacionPredicha24h,
      predictedOccupancy48h: prediction.ocupacionPredicha48h,
      predictedOccupancy72h: prediction.ocupacionPredicha72h,
      confidence: prediction.confianza,
      trend,
      riskLevel,
      recommendation: generateCapacityRecommendation(
        riskLevel,
        prediction.ocupacionPredicha24h,
        `${record.planta} - ${record.hospital}`
      ),
    };
  });
}

/**
 * Identifica departamentos en riesgo de saturación
 */
export function identifyAtRiskDepartments(
  capacityData: BedCapacityRecord[],
  thresholdHours: number = 48
): BedCapacityRecord[] {
  return capacityData.filter((record) => {
    const estimate = estimateTimeToSaturation(
      record.porcentajeOcupacion,
      record.ingresosProgramados,
      record.altosTramite,
      record.camasTotales
    );

    return (
      estimate.isAtRisk &&
      estimate.hoursToSaturation !== null &&
      estimate.hoursToSaturation <= thresholdHours
    );
  });
}

// ============================================================================
// EXPORTACIÓN DEL SERVICIO
// ============================================================================

export const capacityPredictionService = {
  predictOccupancy,
  calculateRiskLevel,
  generateCapacityRecommendation,
  estimateTimeToSaturation,
  shouldOpenPlant,
  generateFullPredictions,
  identifyAtRiskDepartments,
};

export default capacityPredictionService;
