import { TrendDirection, ANALYSIS_CONFIG } from '../types/analysis';

// ============================================================================
// TIPOS PARA PREDICCIONES
// ============================================================================

export interface Prediction {
  values: number[];
  labels: string[];
  confidence: number;
  trend: TrendDirection;
  changePercent: number;
}

export interface ScenarioAnalysis {
  best: number;
  expected: number;
  worst: number;
  probability: {
    best: number;
    expected: number;
    worst: number;
  };
}

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  standardError: number;
}

// ============================================================================
// REGRESIÓN LINEAL
// ============================================================================

/**
 * Realiza regresión lineal simple sobre una serie de valores
 */
export function linearRegression(values: number[]): LinearRegressionResult {
  const n = values.length;
  if (n < 2) {
    return { slope: 0, intercept: values[0] || 0, rSquared: 0, standardError: 0 };
  }

  // Calcular medias
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  // Calcular pendiente e intercepto
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += (i - xMean) ** 2;
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  // Calcular R² (coeficiente de determinación)
  const predictions = values.map((_, i) => intercept + slope * i);
  const ssRes = values.reduce((sum, val, i) => sum + (val - predictions[i]) ** 2, 0);
  const ssTot = values.reduce((sum, val) => sum + (val - yMean) ** 2, 0);
  const rSquared = ssTot !== 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;

  // Calcular error estándar
  const standardError = Math.sqrt(ssRes / Math.max(n - 2, 1));

  return {
    slope,
    intercept,
    rSquared,
    standardError,
  };
}

// ============================================================================
// PREDICCIONES
// ============================================================================

/**
 * Predice valores futuros usando regresión lineal
 */
export function predictNextValues(
  historicalData: number[],
  periodsAhead: number,
  labels?: string[]
): Prediction {
  if (historicalData.length < ANALYSIS_CONFIG.minDataPoints) {
    // Si no hay suficientes datos, devolver el último valor conocido
    const lastValue = historicalData[historicalData.length - 1] || 0;
    return {
      values: Array(periodsAhead).fill(lastValue),
      labels: labels || Array(periodsAhead).fill(''),
      confidence: 0,
      trend: 'stable',
      changePercent: 0,
    };
  }

  const regression = linearRegression(historicalData);
  const n = historicalData.length;

  // Generar predicciones
  const predictions: number[] = [];
  for (let i = 0; i < periodsAhead; i++) {
    const predictedValue = regression.intercept + regression.slope * (n + i);
    // Asegurar que los valores no sean negativos para métricas financieras
    predictions.push(Math.max(0, predictedValue));
  }

  // Calcular confianza basada en R² y cantidad de datos
  const dataQuality = Math.min(n / 10, 1); // Más datos = más confianza
  const confidence = Math.round(regression.rSquared * 100 * dataQuality);

  // Determinar tendencia
  const firstValue = historicalData[0];
  const lastPrediction = predictions[predictions.length - 1];
  const changePercent =
    firstValue !== 0 ? ((lastPrediction - firstValue) / Math.abs(firstValue)) * 100 : 0;

  let trend: TrendDirection = 'stable';
  if (changePercent > ANALYSIS_CONFIG.trendThreshold) trend = 'up';
  if (changePercent < -ANALYSIS_CONFIG.trendThreshold) trend = 'down';

  return {
    values: predictions,
    labels: labels || predictions.map((_, i) => `T+${i + 1}`),
    confidence,
    trend,
    changePercent: parseFloat(changePercent.toFixed(2)),
  };
}

/**
 * Predice ocupación de camas para las próximas horas
 */
export function predictOccupancy(
  historicalOccupancy: number[],
  hoursAhead: number = 24
): Prediction {
  const labels = Array.from({ length: hoursAhead }, (_, i) => `+${i + 1}h`);
  return predictNextValues(historicalOccupancy, hoursAhead, labels);
}

/**
 * Predice valores mensuales para los próximos meses
 */
export function predictMonthlyValues(
  historicalData: number[],
  monthsAhead: number,
  startMonth?: string
): Prediction {
  const getMonthLabels = () => {
    if (!startMonth) {
      return Array.from({ length: monthsAhead }, (_, i) => `Mes ${i + 1}`);
    }

    const labels: string[] = [];
    const [year, month] = startMonth.split('-').map(Number);
    const monthNames = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    for (let i = 0; i < monthsAhead; i++) {
      const newMonth = (month - 1 + i + 1) % 12;
      const newYear = year + Math.floor((month + i) / 12);
      labels.push(`${monthNames[newMonth]} ${newYear}`);
    }

    return labels;
  };

  return predictNextValues(historicalData, monthsAhead, getMonthLabels());
}

// ============================================================================
// ANÁLISIS DE ESCENARIOS
// ============================================================================

/**
 * Genera análisis de escenarios (optimista, esperado, pesimista)
 */
export function generateScenarioAnalysis(
  historicalData: number[],
  periodsAhead: number
): ScenarioAnalysis {
  const regression = linearRegression(historicalData);
  const n = historicalData.length;
  const predictedIndex = n + periodsAhead - 1;

  // Valor esperado
  const expected = Math.max(0, regression.intercept + regression.slope * predictedIndex);

  // Calcular varianza de los residuos para escenarios
  const predictions = historicalData.map((_, i) => regression.intercept + regression.slope * i);
  const residuals = historicalData.map((val, i) => val - predictions[i]);
  const stdDev = Math.sqrt(residuals.reduce((sum, r) => sum + r ** 2, 0) / Math.max(n - 1, 1));

  // Escenario optimista (+1.5 desviaciones estándar)
  const best = Math.max(0, expected + 1.5 * stdDev);

  // Escenario pesimista (-1.5 desviaciones estándar)
  const worst = Math.max(0, expected - 1.5 * stdDev);

  // Probabilidades basadas en distribución normal
  // En una distribución normal, ±1.5σ cubre ~87% de los casos
  return {
    best,
    expected,
    worst,
    probability: {
      best: 13.4, // Probabilidad de superar el escenario optimista
      expected: 68.3, // Probabilidad de estar cerca del esperado (±1σ)
      worst: 13.4, // Probabilidad de estar peor que el pesimista
    },
  };
}

/**
 * Calcula bandas de confianza para una predicción
 */
export function calculateConfidenceBands(
  prediction: Prediction,
  confidence: number = 95
): { upper: number[]; lower: number[] } {
  // Factor Z para diferentes niveles de confianza
  const zScores: Record<number, number> = {
    90: 1.645,
    95: 1.96,
    99: 2.576,
  };

  const z = zScores[confidence] || 1.96;

  // Calcular ancho de banda basado en la confianza de la predicción
  // Menor confianza = bandas más amplias
  const bandWidth = (100 - prediction.confidence) / 100;

  const upper = prediction.values.map((val, i) => {
    // Las bandas se amplían progresivamente
    const progressiveFactor = 1 + (i / prediction.values.length) * 0.5;
    return val * (1 + bandWidth * z * progressiveFactor);
  });

  const lower = prediction.values.map((val, i) => {
    const progressiveFactor = 1 + (i / prediction.values.length) * 0.5;
    return Math.max(0, val * (1 - bandWidth * z * progressiveFactor));
  });

  return { upper, lower };
}

// ============================================================================
// PREDICCIONES ESPECÍFICAS
// ============================================================================

/**
 * Predice tiempo hasta saturación de capacidad
 */
export function predictTimeToSaturation(
  currentOccupancy: number,
  historicalOccupancy: number[],
  threshold: number = 100
): number | null {
  if (currentOccupancy >= threshold) {
    return 0; // Ya está saturado
  }

  const regression = linearRegression(historicalOccupancy);

  if (regression.slope <= 0) {
    return null; // No hay tendencia hacia saturación
  }

  // Calcular cuántos períodos hasta alcanzar el umbral
  // threshold = intercept + slope * x
  // x = (threshold - intercept) / slope
  const n = historicalOccupancy.length;
  const currentIndex = n - 1;
  const saturationIndex = (threshold - regression.intercept) / regression.slope;

  if (saturationIndex <= currentIndex) {
    return 0; // Ya debería estar saturado
  }

  return Math.ceil(saturationIndex - currentIndex);
}

/**
 * Evalúa el riesgo de saturación
 */
export function evaluateSaturationRisk(
  currentOccupancy: number,
  prediction: Prediction
): 'low' | 'medium' | 'high' | 'critical' {
  const maxPredicted = Math.max(...prediction.values);

  if (currentOccupancy >= 90 || maxPredicted >= 95) {
    return 'critical';
  }
  if (currentOccupancy >= 85 || maxPredicted >= 90) {
    return 'high';
  }
  if (prediction.trend === 'up' && prediction.changePercent > 5) {
    return 'medium';
  }
  return 'low';
}

// Exportar servicio como objeto
export const predictionService = {
  linearRegression,
  predictNextValues,
  predictOccupancy,
  predictMonthlyValues,
  generateScenarioAnalysis,
  calculateConfidenceBands,
  predictTimeToSaturation,
  evaluateSaturationRisk,
};
