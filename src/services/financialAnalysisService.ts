import { DepartmentBudget, FinancialKPI, FINANCIAL_THRESHOLDS } from '../types/financial';
import {
  TrendResult,
  Anomaly,
  AnomalyType,
  AnomalySeverity,
  ComparisonInsight,
  ANALYSIS_CONFIG,
  getTrendDirection,
  getAnomalySeverity,
} from '../types/analysis';

// ============================================================================
// ANÁLISIS DE TENDENCIAS
// ============================================================================

/**
 * Calcula la tendencia de una serie de valores numéricos
 */
export function calculateTrend(values: number[]): TrendResult {
  if (values.length < ANALYSIS_CONFIG.minDataPoints) {
    return {
      direction: 'stable',
      changePercent: 0,
      slope: 0,
      confidence: 0,
      startValue: values[0] || 0,
      endValue: values[values.length - 1] || 0,
      dataPoints: values.length,
    };
  }

  const n = values.length;
  const startValue = values[0];
  const endValue = values[n - 1];

  // Calcular pendiente usando regresión lineal simple
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += (i - xMean) ** 2;
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;

  // Calcular porcentaje de cambio
  const changePercent =
    startValue !== 0 ? ((endValue - startValue) / Math.abs(startValue)) * 100 : 0;

  // Calcular R² como medida de confianza
  const predictions = values.map((_, i) => yMean + slope * (i - xMean));
  const ssRes = values.reduce((sum, val, i) => sum + (val - predictions[i]) ** 2, 0);
  const ssTot = values.reduce((sum, val) => sum + (val - yMean) ** 2, 0);
  const rSquared = ssTot !== 0 ? 1 - ssRes / ssTot : 0;
  const confidence = Math.max(0, Math.min(100, rSquared * 100));

  const direction = getTrendDirection(changePercent);

  return {
    direction,
    changePercent: parseFloat(changePercent.toFixed(2)),
    slope: parseFloat(slope.toFixed(4)),
    confidence: parseFloat(confidence.toFixed(1)),
    startValue,
    endValue,
    dataPoints: n,
  };
}

/**
 * Analiza tendencias de KPIs financieros por hospital
 */
export function analyzeKPITrends(kpis: FinancialKPI[]): Record<string, TrendResult> {
  const trends: Record<string, TrendResult> = {};

  // Agrupar por hospital y ordenar por mes
  const hospitals = [...new Set(kpis.map((k) => k.hospital))];

  hospitals.forEach((hospital) => {
    const hospitalKPIs = kpis
      .filter((k) => k.hospital === hospital)
      .sort((a, b) => a.mes.localeCompare(b.mes));

    if (hospitalKPIs.length >= ANALYSIS_CONFIG.minDataPoints) {
      // Tendencia de ingresos
      trends[`${hospital}_ingresos`] = calculateTrend(hospitalKPIs.map((k) => k.ingresosTotales));

      // Tendencia de margen neto
      trends[`${hospital}_margen`] = calculateTrend(hospitalKPIs.map((k) => k.margenNeto));

      // Tendencia de ROI
      trends[`${hospital}_roi`] = calculateTrend(hospitalKPIs.map((k) => k.roi));

      // Tendencia de EBITDA
      trends[`${hospital}_ebitda`] = calculateTrend(hospitalKPIs.map((k) => k.ebitda));
    }
  });

  // Tendencias globales del sistema
  const sortedKPIs = [...kpis].sort((a, b) => a.mes.localeCompare(b.mes));
  const months = [...new Set(sortedKPIs.map((k) => k.mes))];

  if (months.length >= ANALYSIS_CONFIG.minDataPoints) {
    const monthlyTotals = months.map((month) => {
      const monthKPIs = sortedKPIs.filter((k) => k.mes === month);
      return {
        ingresos: monthKPIs.reduce((sum, k) => sum + k.ingresosTotales, 0),
        margen: monthKPIs.reduce((sum, k) => sum + k.margenNeto, 0),
        roi: monthKPIs.reduce((sum, k) => sum + k.roi, 0) / monthKPIs.length,
      };
    });

    trends['sistema_ingresos'] = calculateTrend(monthlyTotals.map((m) => m.ingresos));
    trends['sistema_margen'] = calculateTrend(monthlyTotals.map((m) => m.margen));
    trends['sistema_roi'] = calculateTrend(monthlyTotals.map((m) => m.roi));
  }

  return trends;
}

// ============================================================================
// DETECCIÓN DE ANOMALÍAS
// ============================================================================

/**
 * Calcula la desviación estándar de un conjunto de valores
 */
function calculateStdDev(values: number[]): { mean: number; stdDev: number } {
  const n = values.length;
  if (n === 0) return { mean: 0, stdDev: 0 };

  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);

  return { mean, stdDev };
}

/**
 * Detecta anomalías en los presupuestos departamentales
 */
export function detectBudgetAnomalies(budgets: DepartmentBudget[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const timestamp = new Date().toISOString();

  // Agrupar por departamento para comparar entre hospitales
  const departments = [...new Set(budgets.map((b) => b.departamento))];

  departments.forEach((dept) => {
    const deptBudgets = budgets.filter((b) => b.departamento === dept);

    // Detectar anomalías en coste por paciente
    const costes = deptBudgets.map((b) => b.costePorPaciente);
    const { mean: costeMean, stdDev: costeStdDev } = calculateStdDev(costes);

    deptBudgets.forEach((budget) => {
      if (costeStdDev > 0) {
        const deviation = (budget.costePorPaciente - costeMean) / costeStdDev;

        if (Math.abs(deviation) > ANALYSIS_CONFIG.anomalyThreshold) {
          const type: AnomalyType = deviation > 0 ? 'spike' : 'drop';
          const severity = getAnomalySeverity(deviation);

          anomalies.push({
            id: `anomaly-coste-${budget.hospital}-${dept}-${timestamp}`,
            type,
            severity,
            metric: 'Coste por Paciente',
            value: budget.costePorPaciente,
            expectedValue: costeMean,
            deviation: parseFloat(deviation.toFixed(2)),
            timestamp,
            hospital: budget.hospital,
            departamento: dept,
            description: `El coste por paciente en ${dept} de ${budget.hospital} (${budget.costePorPaciente.toFixed(0)}€) está ${Math.abs(deviation).toFixed(1)} desviaciones del promedio (${costeMean.toFixed(0)}€)`,
            possibleCauses: getPossibleCausesForCostAnomaly(type, deviation),
            recommendedActions: getRecommendedActionsForCostAnomaly(type, deviation),
          });
        }
      }

      // Detectar anomalías en eficiencia
      const eficiencias = deptBudgets.map((b) => b.eficienciaCoste);
      const { mean: eficienciaMean, stdDev: eficienciaStdDev } = calculateStdDev(eficiencias);

      if (eficienciaStdDev > 0) {
        const deviation = (budget.eficienciaCoste - eficienciaMean) / eficienciaStdDev;

        if (Math.abs(deviation) > ANALYSIS_CONFIG.anomalyThreshold) {
          const type: AnomalyType = deviation < 0 ? 'drop' : 'spike';
          const severity = getAnomalySeverity(deviation);

          anomalies.push({
            id: `anomaly-eficiencia-${budget.hospital}-${dept}-${timestamp}`,
            type,
            severity,
            metric: 'Eficiencia de Coste',
            value: budget.eficienciaCoste,
            expectedValue: eficienciaMean,
            deviation: parseFloat(deviation.toFixed(2)),
            timestamp,
            hospital: budget.hospital,
            departamento: dept,
            description: `La eficiencia de coste en ${dept} de ${budget.hospital} (${(budget.eficienciaCoste * 100).toFixed(1)}%) está ${Math.abs(deviation).toFixed(1)} desviaciones del promedio`,
            possibleCauses: getPossibleCausesForEfficiencyAnomaly(type, deviation),
            recommendedActions: getRecommendedActionsForEfficiencyAnomaly(type, deviation),
          });
        }
      }
    });
  });

  // Ordenar por severidad
  return anomalies.sort((a, b) => {
    const severityOrder: Record<AnomalySeverity, number> = {
      critical: 1,
      high: 2,
      medium: 3,
      low: 4,
    };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

function getPossibleCausesForCostAnomaly(type: AnomalyType, _deviation: number): string[] {
  if (type === 'spike') {
    return [
      'Personal con mayor antigüedad y costes salariales elevados',
      'Equipamiento especializado de alto coste',
      'Menor volumen de pacientes distribuyendo costes fijos',
      'Ineficiencias en la gestión de recursos',
    ];
  }
  return [
    'Personal más joven con salarios menores',
    'Mayor volumen de pacientes diluyendo costes fijos',
    'Eficiencias operativas superiores',
    'Posible subinversión en equipamiento o personal',
  ];
}

function getRecommendedActionsForCostAnomaly(type: AnomalyType, _deviation: number): string[] {
  if (type === 'spike') {
    return [
      'Revisar estructura de personal y cargas de trabajo',
      'Analizar procesos para identificar ineficiencias',
      'Evaluar oportunidades de compartir recursos',
      'Considerar derivación de pacientes a centros más eficientes',
    ];
  }
  return [
    'Verificar que la calidad asistencial se mantiene',
    'Analizar si hay subinversión afectando resultados',
    'Documentar buenas prácticas para replicar',
    'Evaluar sostenibilidad a largo plazo',
  ];
}

function getPossibleCausesForEfficiencyAnomaly(type: AnomalyType, _deviation: number): string[] {
  if (type === 'drop') {
    return [
      'Procesos desactualizados o ineficientes',
      'Falta de formación del personal',
      'Equipamiento obsoleto',
      'Alta rotación de personal',
    ];
  }
  return [
    'Implementación exitosa de mejoras de procesos',
    'Personal altamente cualificado y motivado',
    'Inversión tecnológica reciente',
    'Liderazgo efectivo del departamento',
  ];
}

function getRecommendedActionsForEfficiencyAnomaly(
  type: AnomalyType,
  _deviation: number
): string[] {
  if (type === 'drop') {
    return [
      'Realizar auditoría de procesos',
      'Implementar programa de formación continua',
      'Evaluar actualización de equipamiento',
      'Revisar indicadores de clima laboral',
    ];
  }
  return [
    'Documentar mejores prácticas',
    'Compartir conocimiento con otros centros',
    'Reconocer y premiar al equipo',
    'Establecer como centro de referencia',
  ];
}

// ============================================================================
// COMPARACIONES
// ============================================================================

/**
 * Genera insights de comparación entre hospitales
 */
export function generateComparisons(
  budgets: DepartmentBudget[],
  kpis: FinancialKPI[]
): ComparisonInsight[] {
  const insights: ComparisonInsight[] = [];
  const hospitals = [...new Set(budgets.map((b) => b.hospital))];

  if (hospitals.length < 2) return insights;

  // Comparar eficiencia promedio entre hospitales
  const hospitalEfficiency = hospitals.map((hospital) => {
    const hospitalBudgets = budgets.filter((b) => b.hospital === hospital);
    const avgEfficiency =
      hospitalBudgets.reduce((sum, b) => sum + b.eficienciaCoste, 0) / hospitalBudgets.length;
    return { hospital, efficiency: avgEfficiency };
  });

  hospitalEfficiency.sort((a, b) => b.efficiency - a.efficiency);

  const best = hospitalEfficiency[0];
  const worst = hospitalEfficiency[hospitalEfficiency.length - 1];

  if (best && worst && best.hospital !== worst.hospital) {
    const difference = best.efficiency - worst.efficiency;
    const percentDiff = worst.efficiency !== 0 ? (difference / worst.efficiency) * 100 : 0;

    insights.push({
      id: `comparison-efficiency-${best.hospital}-${worst.hospital}`,
      type: percentDiff > 10 ? 'worse' : percentDiff > 5 ? 'similar' : 'better',
      metric: 'Eficiencia de Coste',
      entityA: best.hospital,
      entityB: worst.hospital,
      valueA: best.efficiency,
      valueB: worst.efficiency,
      difference,
      percentDifference: parseFloat(percentDiff.toFixed(1)),
      insight: `${best.hospital} tiene una eficiencia de coste ${percentDiff.toFixed(1)}% superior a ${worst.hospital}`,
      recommendation:
        percentDiff > 10
          ? `Estudiar las prácticas de ${best.hospital} para replicar en ${worst.hospital}`
          : undefined,
    });
  }

  // Comparar ROI entre hospitales (usando KPIs del último mes)
  const latestMonth = kpis.reduce((latest, k) => (k.mes > latest ? k.mes : latest), '');
  const latestKPIs = kpis.filter((k) => k.mes === latestMonth);

  if (latestKPIs.length >= 2) {
    latestKPIs.sort((a, b) => b.roi - a.roi);
    const bestROI = latestKPIs[0];
    const worstROI = latestKPIs[latestKPIs.length - 1];

    if (bestROI && worstROI && bestROI.hospital !== worstROI.hospital) {
      const difference = bestROI.roi - worstROI.roi;

      insights.push({
        id: `comparison-roi-${bestROI.hospital}-${worstROI.hospital}`,
        type: difference > 3 ? 'worse' : 'similar',
        metric: 'ROI',
        entityA: bestROI.hospital,
        entityB: worstROI.hospital,
        valueA: bestROI.roi,
        valueB: worstROI.roi,
        difference,
        percentDifference: parseFloat(difference.toFixed(1)),
        insight: `${bestROI.hospital} tiene un ROI ${difference.toFixed(1)} puntos superior a ${worstROI.hospital}`,
        recommendation:
          difference > 3
            ? `Analizar estructura de costes e ingresos de ${worstROI.hospital}`
            : undefined,
      });
    }
  }

  return insights;
}

// ============================================================================
// CÁLCULOS FINANCIEROS
// ============================================================================

/**
 * Calcula el ROI (Return on Investment)
 */
export function calculateROI(income: number, investment: number): number {
  if (investment === 0) return 0;
  return ((income - investment) / investment) * 100;
}

/**
 * Calcula el margen operativo
 */
export function calculateMargin(income: number, expenses: number): number {
  if (income === 0) return 0;
  return ((income - expenses) / income) * 100;
}

/**
 * Calcula el ratio de eficiencia
 */
export function calculateEfficiencyRatio(actual: number, standard: number): number {
  if (standard === 0) return 0;
  return actual / standard;
}

/**
 * Evalúa el estado de un KPI según umbrales
 */
export function evaluateKPIStatus(
  metric: 'roi' | 'margen' | 'eficiencia' | 'satisfaccion',
  value: number
): 'good' | 'warning' | 'critical' {
  if (metric === 'margen') {
    const thresholds = FINANCIAL_THRESHOLDS.margen;
    if (value >= thresholds.bueno) return 'good';
    if (value >= thresholds.malo) return 'warning';
    return 'critical';
  }

  if (metric === 'eficiencia') {
    const thresholds = FINANCIAL_THRESHOLDS.eficiencia;
    if (value >= thresholds.bueno) return 'good';
    if (value >= thresholds.malo) return 'warning';
    return 'critical';
  }

  // roi y satisfaccion tienen 'regular'
  const thresholds = FINANCIAL_THRESHOLDS[metric];
  if (value >= thresholds.bueno) return 'good';
  if (value >= thresholds.regular) return 'warning';
  return 'critical';
}

// ============================================================================
// ANÁLISIS AGREGADO
// ============================================================================

/**
 * Genera un resumen ejecutivo del análisis financiero
 */
export function generateExecutiveSummary(
  budgets: DepartmentBudget[],
  _kpis: FinancialKPI[],
  trends: Record<string, TrendResult>,
  anomalies: Anomaly[]
): {
  healthScore: number;
  mainConcerns: string[];
  opportunities: string[];
  achievements: string[];
} {
  const concerns: string[] = [];
  const opportunities: string[] = [];
  const achievements: string[] = [];

  // Analizar tendencias del sistema
  const sistemaTrend = trends['sistema_margen'];
  if (sistemaTrend) {
    if (sistemaTrend.direction === 'up') {
      achievements.push(
        `Margen neto del sistema en tendencia alcista (+${sistemaTrend.changePercent.toFixed(1)}%)`
      );
    } else if (sistemaTrend.direction === 'down') {
      concerns.push(
        `Margen neto del sistema en tendencia bajista (${sistemaTrend.changePercent.toFixed(1)}%)`
      );
    }
  }

  // Analizar anomalías críticas
  const criticalAnomalies = anomalies.filter((a) => a.severity === 'critical');
  if (criticalAnomalies.length > 0) {
    concerns.push(
      `${criticalAnomalies.length} anomalía(s) crítica(s) detectada(s) que requieren atención inmediata`
    );
  }

  // Buscar oportunidades de mejora
  const lowEfficiencyDepts = budgets.filter(
    (b) => b.eficienciaCoste < FINANCIAL_THRESHOLDS.eficiencia.malo
  );
  if (lowEfficiencyDepts.length > 0) {
    opportunities.push(
      `${lowEfficiencyDepts.length} departamento(s) con potencial de mejora de eficiencia`
    );
  }

  // Identificar logros
  const highSatisfaction = budgets.filter(
    (b) => b.satisfaccionPaciente >= FINANCIAL_THRESHOLDS.satisfaccion.bueno
  );
  if (highSatisfaction.length > budgets.length / 2) {
    achievements.push(
      `${highSatisfaction.length} de ${budgets.length} departamentos con alta satisfacción del paciente`
    );
  }

  // Calcular health score
  let score = 70; // Base

  // Ajustar por tendencias
  if (sistemaTrend?.direction === 'up') score += 10;
  if (sistemaTrend?.direction === 'down') score -= 15;

  // Ajustar por anomalías
  score -= criticalAnomalies.length * 5;
  score -= anomalies.filter((a) => a.severity === 'high').length * 3;

  // Ajustar por eficiencia
  const avgEfficiency = budgets.reduce((sum, b) => sum + b.eficienciaCoste, 0) / budgets.length;
  if (avgEfficiency >= FINANCIAL_THRESHOLDS.eficiencia.bueno) score += 10;
  if (avgEfficiency < FINANCIAL_THRESHOLDS.eficiencia.malo) score -= 10;

  // Limitar score entre 0 y 100
  const healthScore = Math.max(0, Math.min(100, score));

  return {
    healthScore,
    mainConcerns: concerns,
    opportunities,
    achievements,
  };
}

// Exportar servicio como objeto
export const financialAnalysisService = {
  calculateTrend,
  analyzeKPITrends,
  detectBudgetAnomalies,
  generateComparisons,
  calculateROI,
  calculateMargin,
  calculateEfficiencyRatio,
  evaluateKPIStatus,
  generateExecutiveSummary,
};
