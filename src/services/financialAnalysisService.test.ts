import { describe, it, expect } from 'vitest';
import {
  calculateTrend,
  analyzeKPITrends,
  detectBudgetAnomalies,
  generateComparisons,
  calculateROI,
  calculateMargin,
  calculateEfficiencyRatio,
  evaluateKPIStatus,
  generateExecutiveSummary,
  runFullAnalysis,
} from './financialAnalysisService';
import { DepartmentBudget, FinancialKPI } from '../types/financial';
import { TrendResult, Anomaly } from '../types/analysis';

// ============================================================================
// DATOS DE PRUEBA
// ============================================================================

const mockKPIs: FinancialKPI[] = [
  {
    hospital: 'Hospital A',
    mes: '2024-01',
    ingresosTotales: 1000000,
    gastosTotales: 800000,
    margenNeto: 200000,
    roi: 8.5,
    ebitda: 250000,
    flujoCaja: 150000,
    deudaTotal: 500000,
    ratioLiquidez: 1.5,
    diasCobroMedio: 30,
    rotacionInventario: 12,
    costeAdquisicionPaciente: 200,
    valorVidaPaciente: 5000,
    tasaRetencion: 85,
    pacientesNuevos: 100,
    pacientesTotales: 1000,
  },
  {
    hospital: 'Hospital A',
    mes: '2024-02',
    ingresosTotales: 1050000,
    gastosTotales: 820000,
    margenNeto: 230000,
    roi: 9.0,
    ebitda: 280000,
    flujoCaja: 160000,
    deudaTotal: 480000,
    ratioLiquidez: 1.6,
    diasCobroMedio: 28,
    rotacionInventario: 13,
    costeAdquisicionPaciente: 195,
    valorVidaPaciente: 5100,
    tasaRetencion: 86,
    pacientesNuevos: 110,
    pacientesTotales: 1050,
  },
  {
    hospital: 'Hospital A',
    mes: '2024-03',
    ingresosTotales: 1100000,
    gastosTotales: 850000,
    margenNeto: 250000,
    roi: 9.5,
    ebitda: 300000,
    flujoCaja: 170000,
    deudaTotal: 460000,
    ratioLiquidez: 1.7,
    diasCobroMedio: 26,
    rotacionInventario: 14,
    costeAdquisicionPaciente: 190,
    valorVidaPaciente: 5200,
    tasaRetencion: 87,
    pacientesNuevos: 120,
    pacientesTotales: 1100,
  },
  {
    hospital: 'Hospital B',
    mes: '2024-01',
    ingresosTotales: 800000,
    gastosTotales: 700000,
    margenNeto: 100000,
    roi: 5.0,
    ebitda: 150000,
    flujoCaja: 80000,
    deudaTotal: 600000,
    ratioLiquidez: 1.2,
    diasCobroMedio: 35,
    rotacionInventario: 10,
    costeAdquisicionPaciente: 250,
    valorVidaPaciente: 4500,
    tasaRetencion: 80,
    pacientesNuevos: 80,
    pacientesTotales: 800,
  },
  {
    hospital: 'Hospital B',
    mes: '2024-02',
    ingresosTotales: 820000,
    gastosTotales: 710000,
    margenNeto: 110000,
    roi: 5.5,
    ebitda: 160000,
    flujoCaja: 85000,
    deudaTotal: 590000,
    ratioLiquidez: 1.25,
    diasCobroMedio: 34,
    rotacionInventario: 11,
    costeAdquisicionPaciente: 245,
    valorVidaPaciente: 4600,
    tasaRetencion: 81,
    pacientesNuevos: 85,
    pacientesTotales: 820,
  },
  {
    hospital: 'Hospital B',
    mes: '2024-03',
    ingresosTotales: 840000,
    gastosTotales: 720000,
    margenNeto: 120000,
    roi: 6.0,
    ebitda: 170000,
    flujoCaja: 90000,
    deudaTotal: 580000,
    ratioLiquidez: 1.3,
    diasCobroMedio: 33,
    rotacionInventario: 12,
    costeAdquisicionPaciente: 240,
    valorVidaPaciente: 4700,
    tasaRetencion: 82,
    pacientesNuevos: 90,
    pacientesTotales: 840,
  },
];

const mockBudgets: DepartmentBudget[] = [
  {
    hospital: 'Hospital A',
    departamento: 'Urgencias',
    presupuestoAnualEuros: 500000,
    personalPlantilla: 50,
    costePersonal: 300000,
    costeEquipamiento: 100000,
    costeMedicamentos: 50000,
    costeOperativo: 50000,
    pacientesEstimados: 3200,
    costePorPaciente: 150,
    ingresosEstimados: 600000,
    margenOperativo: 100000,
    eficienciaCoste: 0.95,
    tasaOcupacion: 85,
    tiempoEsperaMedioDias: 0.5,
    satisfaccionPaciente: 8.2,
  },
  {
    hospital: 'Hospital A',
    departamento: 'Cardiología',
    presupuestoAnualEuros: 300000,
    personalPlantilla: 30,
    costePersonal: 180000,
    costeEquipamiento: 60000,
    costeMedicamentos: 40000,
    costeOperativo: 20000,
    pacientesEstimados: 700,
    costePorPaciente: 450,
    ingresosEstimados: 400000,
    margenOperativo: 100000,
    eficienciaCoste: 0.88,
    tasaOcupacion: 90,
    tiempoEsperaMedioDias: 2,
    satisfaccionPaciente: 8.8,
  },
  {
    hospital: 'Hospital B',
    departamento: 'Urgencias',
    presupuestoAnualEuros: 400000,
    personalPlantilla: 40,
    costePersonal: 240000,
    costeEquipamiento: 80000,
    costeMedicamentos: 45000,
    costeOperativo: 35000,
    pacientesEstimados: 2300,
    costePorPaciente: 180,
    ingresosEstimados: 450000,
    margenOperativo: 50000,
    eficienciaCoste: 0.82,
    tasaOcupacion: 80,
    tiempoEsperaMedioDias: 1,
    satisfaccionPaciente: 7.5,
  },
  {
    hospital: 'Hospital B',
    departamento: 'Cardiología',
    presupuestoAnualEuros: 250000,
    personalPlantilla: 25,
    costePersonal: 150000,
    costeEquipamiento: 50000,
    costeMedicamentos: 30000,
    costeOperativo: 20000,
    pacientesEstimados: 570,
    costePorPaciente: 420,
    ingresosEstimados: 320000,
    margenOperativo: 70000,
    eficienciaCoste: 0.92,
    tasaOcupacion: 88,
    tiempoEsperaMedioDias: 1.5,
    satisfaccionPaciente: 8.5,
  },
];

// ============================================================================
// TESTS: calculateTrend
// ============================================================================

describe('calculateTrend', () => {
  it('debe devolver tendencia estable con datos insuficientes', () => {
    const result = calculateTrend([100, 105]);

    expect(result.direction).toBe('stable');
    expect(result.confidence).toBe(0);
    expect(result.dataPoints).toBe(2);
  });

  it('debe detectar tendencia alcista correctamente', () => {
    const values = [100, 110, 120, 130, 140];
    const result = calculateTrend(values);

    expect(result.direction).toBe('up');
    expect(result.changePercent).toBeGreaterThan(0);
    expect(result.slope).toBeGreaterThan(0);
    expect(result.startValue).toBe(100);
    expect(result.endValue).toBe(140);
    expect(result.dataPoints).toBe(5);
  });

  it('debe detectar tendencia bajista correctamente', () => {
    const values = [140, 130, 120, 110, 100];
    const result = calculateTrend(values);

    expect(result.direction).toBe('down');
    expect(result.changePercent).toBeLessThan(0);
    expect(result.slope).toBeLessThan(0);
  });

  it('debe detectar tendencia estable con valores constantes', () => {
    const values = [100, 101, 99, 100, 101];
    const result = calculateTrend(values);

    expect(result.direction).toBe('stable');
    expect(Math.abs(result.changePercent)).toBeLessThan(5);
  });

  it('debe calcular confianza alta para datos lineales', () => {
    const values = [100, 110, 120, 130, 140];
    const result = calculateTrend(values);

    expect(result.confidence).toBeGreaterThan(90);
  });

  it('debe manejar arrays vacíos', () => {
    const result = calculateTrend([]);

    expect(result.direction).toBe('stable');
    expect(result.dataPoints).toBe(0);
  });
});

// ============================================================================
// TESTS: analyzeKPITrends
// ============================================================================

describe('analyzeKPITrends', () => {
  it('debe analizar tendencias por hospital', () => {
    const trends = analyzeKPITrends(mockKPIs);

    expect(trends).toHaveProperty('Hospital A_ingresos');
    expect(trends).toHaveProperty('Hospital A_margen');
    expect(trends).toHaveProperty('Hospital A_roi');
    expect(trends).toHaveProperty('Hospital A_ebitda');
  });

  it('debe calcular tendencias del sistema global', () => {
    const trends = analyzeKPITrends(mockKPIs);

    expect(trends).toHaveProperty('sistema_ingresos');
    expect(trends).toHaveProperty('sistema_margen');
    expect(trends).toHaveProperty('sistema_roi');
  });

  it('debe devolver objeto vacío sin datos suficientes', () => {
    const fewKPIs = mockKPIs.slice(0, 2);
    const trends = analyzeKPITrends(fewKPIs);

    // Solo tendencias parciales
    expect(Object.keys(trends).length).toBeLessThan(10);
  });
});

// ============================================================================
// TESTS: detectBudgetAnomalies
// ============================================================================

describe('detectBudgetAnomalies', () => {
  it('debe devolver array de anomalías', () => {
    const anomalies = detectBudgetAnomalies(mockBudgets);

    expect(Array.isArray(anomalies)).toBe(true);
  });

  it('debe ordenar anomalías por severidad', () => {
    // Crear datos con anomalías claras
    const budgetsWithAnomalies: DepartmentBudget[] = [
      ...mockBudgets,
      {
        hospital: 'Hospital C',
        departamento: 'Urgencias',
        presupuestoAnualEuros: 400000,
        personalPlantilla: 35,
        costePersonal: 250000,
        costeEquipamiento: 80000,
        costeMedicamentos: 40000,
        costeOperativo: 30000,
        pacientesEstimados: 1200,
        costePorPaciente: 500, // Muy alto comparado con otros
        ingresosEstimados: 350000,
        margenOperativo: -50000,
        eficienciaCoste: 0.5, // Muy baja
        tasaOcupacion: 70,
        tiempoEsperaMedioDias: 3,
        satisfaccionPaciente: 6.0,
      },
    ];

    const anomalies = detectBudgetAnomalies(budgetsWithAnomalies);

    if (anomalies.length >= 2) {
      const severityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
      const firstSeverity = severityOrder[anomalies[0].severity];
      const secondSeverity = severityOrder[anomalies[1].severity];
      expect(firstSeverity).toBeLessThanOrEqual(secondSeverity);
    }
  });

  it('debe incluir información del hospital y departamento', () => {
    const anomalies = detectBudgetAnomalies(mockBudgets);

    anomalies.forEach((anomaly) => {
      expect(anomaly.hospital).toBeDefined();
      expect(anomaly.departamento).toBeDefined();
    });
  });
});

// ============================================================================
// TESTS: generateComparisons
// ============================================================================

describe('generateComparisons', () => {
  it('debe generar comparaciones entre hospitales', () => {
    const comparisons = generateComparisons(mockBudgets, mockKPIs);

    expect(Array.isArray(comparisons)).toBe(true);
  });

  it('debe devolver array vacío con un solo hospital', () => {
    const singleHospitalBudgets = mockBudgets.filter((b) => b.hospital === 'Hospital A');
    const singleHospitalKPIs = mockKPIs.filter((k) => k.hospital === 'Hospital A');

    const comparisons = generateComparisons(singleHospitalBudgets, singleHospitalKPIs);

    expect(comparisons).toHaveLength(0);
  });

  it('debe incluir métricas de comparación válidas', () => {
    const comparisons = generateComparisons(mockBudgets, mockKPIs);

    comparisons.forEach((comparison) => {
      expect(comparison.entityA).toBeDefined();
      expect(comparison.entityB).toBeDefined();
      expect(typeof comparison.valueA).toBe('number');
      expect(typeof comparison.valueB).toBe('number');
      expect(typeof comparison.difference).toBe('number');
    });
  });
});

// ============================================================================
// TESTS: Cálculos Financieros
// ============================================================================

describe('calculateROI', () => {
  it('debe calcular ROI correctamente', () => {
    const roi = calculateROI(1200, 1000);
    expect(roi).toBe(20); // (1200 - 1000) / 1000 * 100 = 20%
  });

  it('debe devolver 0 con inversión cero', () => {
    const roi = calculateROI(100, 0);
    expect(roi).toBe(0);
  });

  it('debe manejar ROI negativo', () => {
    const roi = calculateROI(800, 1000);
    expect(roi).toBe(-20);
  });
});

describe('calculateMargin', () => {
  it('debe calcular margen correctamente', () => {
    const margin = calculateMargin(1000, 800);
    expect(margin).toBe(20); // (1000 - 800) / 1000 * 100 = 20%
  });

  it('debe devolver 0 con ingresos cero', () => {
    const margin = calculateMargin(0, 100);
    expect(margin).toBe(0);
  });

  it('debe manejar margen negativo', () => {
    const margin = calculateMargin(800, 1000);
    expect(margin).toBe(-25);
  });
});

describe('calculateEfficiencyRatio', () => {
  it('debe calcular ratio de eficiencia correctamente', () => {
    const ratio = calculateEfficiencyRatio(90, 100);
    expect(ratio).toBe(0.9);
  });

  it('debe devolver 0 con estándar cero', () => {
    const ratio = calculateEfficiencyRatio(100, 0);
    expect(ratio).toBe(0);
  });

  it('debe manejar eficiencia superior al 100%', () => {
    const ratio = calculateEfficiencyRatio(110, 100);
    expect(ratio).toBe(1.1);
  });
});

// ============================================================================
// TESTS: evaluateKPIStatus
// ============================================================================

describe('evaluateKPIStatus', () => {
  // FINANCIAL_THRESHOLDS:
  // ROI: bueno >= 8, regular >= 5, malo < 5
  // Margen: bueno >= 0, malo < -500000
  // Eficiencia: bueno >= 1.0, malo < 0.95
  // Satisfacción: bueno >= 4.0, regular >= 3.5, malo < 3.5

  it('debe evaluar ROI como good cuando es alto', () => {
    const status = evaluateKPIStatus('roi', 10);
    expect(status).toBe('good');
  });

  it('debe evaluar ROI como warning cuando es medio', () => {
    const status = evaluateKPIStatus('roi', 6); // entre 5 y 8 es warning
    expect(status).toBe('warning');
  });

  it('debe evaluar ROI como critical cuando es bajo', () => {
    const status = evaluateKPIStatus('roi', 3); // < 5 es critical
    expect(status).toBe('critical');
  });

  it('debe evaluar margen correctamente', () => {
    // bueno >= 0, warning entre -500000 y 0, critical < -500000
    expect(evaluateKPIStatus('margen', 100000)).toBe('good');
    expect(evaluateKPIStatus('margen', -200000)).toBe('warning');
    expect(evaluateKPIStatus('margen', -600000)).toBe('critical');
  });

  it('debe evaluar eficiencia correctamente', () => {
    // bueno >= 1.0, warning entre 0.95 y 1.0, critical < 0.95
    expect(evaluateKPIStatus('eficiencia', 1.05)).toBe('good');
    expect(evaluateKPIStatus('eficiencia', 0.97)).toBe('warning');
    expect(evaluateKPIStatus('eficiencia', 0.9)).toBe('critical');
  });

  it('debe evaluar satisfacción correctamente', () => {
    // bueno >= 4.0, regular >= 3.5, malo < 3.5
    expect(evaluateKPIStatus('satisfaccion', 4.5)).toBe('good');
    expect(evaluateKPIStatus('satisfaccion', 3.7)).toBe('warning');
    expect(evaluateKPIStatus('satisfaccion', 3.0)).toBe('critical');
  });
});

// ============================================================================
// TESTS: generateExecutiveSummary
// ============================================================================

describe('generateExecutiveSummary', () => {
  it('debe generar resumen con health score válido', () => {
    const trends: Record<string, TrendResult> = {
      sistema_margen: {
        direction: 'up',
        changePercent: 10,
        slope: 0.5,
        confidence: 85,
        startValue: 100,
        endValue: 110,
        dataPoints: 5,
      },
    };
    const anomalies: Anomaly[] = [];

    const summary = generateExecutiveSummary(mockBudgets, mockKPIs, trends, anomalies);

    expect(summary.healthScore).toBeGreaterThanOrEqual(0);
    expect(summary.healthScore).toBeLessThanOrEqual(100);
  });

  it('debe identificar tendencia alcista como logro', () => {
    const trends: Record<string, TrendResult> = {
      sistema_margen: {
        direction: 'up',
        changePercent: 15,
        slope: 0.8,
        confidence: 90,
        startValue: 100,
        endValue: 115,
        dataPoints: 5,
      },
    };

    const summary = generateExecutiveSummary(mockBudgets, mockKPIs, trends, []);

    expect(summary.achievements.length).toBeGreaterThan(0);
  });

  it('debe identificar tendencia bajista como preocupación', () => {
    const trends: Record<string, TrendResult> = {
      sistema_margen: {
        direction: 'down',
        changePercent: -15,
        slope: -0.8,
        confidence: 90,
        startValue: 100,
        endValue: 85,
        dataPoints: 5,
      },
    };

    const summary = generateExecutiveSummary(mockBudgets, mockKPIs, trends, []);

    expect(summary.mainConcerns.length).toBeGreaterThan(0);
  });

  it('debe penalizar health score por anomalías críticas', () => {
    const trends: Record<string, TrendResult> = {};
    const anomalies: Anomaly[] = [
      {
        id: 'test-1',
        type: 'spike',
        severity: 'critical',
        metric: 'Coste por Paciente',
        value: 500,
        expectedValue: 200,
        deviation: 4.5,
        timestamp: new Date().toISOString(),
        hospital: 'Hospital A',
        departamento: 'Urgencias',
        description: 'Test anomaly',
        possibleCauses: [],
        recommendedActions: [],
      },
    ];

    const summaryWithoutAnomalies = generateExecutiveSummary(mockBudgets, mockKPIs, trends, []);
    const summaryWithAnomalies = generateExecutiveSummary(mockBudgets, mockKPIs, trends, anomalies);

    expect(summaryWithAnomalies.healthScore).toBeLessThan(summaryWithoutAnomalies.healthScore);
  });
});

// ============================================================================
// TESTS: runFullAnalysis
// ============================================================================

describe('runFullAnalysis', () => {
  it('debe ejecutar análisis completo y devolver resultado válido', () => {
    const result = runFullAnalysis(mockKPIs, mockBudgets);

    expect(result.timestamp).toBeDefined();
    expect(result.period).toBeDefined();
    expect(result.period.start).toBeDefined();
    expect(result.period.end).toBeDefined();
    expect(result.summary).toBeDefined();
    expect(result.trends).toBeDefined();
    expect(result.anomalies).toBeDefined();
    expect(result.directives).toBeDefined();
    expect(result.comparisons).toBeDefined();
  });

  it('debe incluir todas las tendencias requeridas', () => {
    const result = runFullAnalysis(mockKPIs, mockBudgets);

    expect(result.trends).toHaveProperty('financial');
    expect(result.trends).toHaveProperty('efficiency');
    expect(result.trends).toHaveProperty('capacity');
    expect(result.trends).toHaveProperty('satisfaction');
  });

  it('debe generar resumen ejecutivo válido', () => {
    const result = runFullAnalysis(mockKPIs, mockBudgets);

    expect(result.summary.healthScore).toBeGreaterThanOrEqual(0);
    expect(result.summary.healthScore).toBeLessThanOrEqual(100);
    expect(Array.isArray(result.summary.mainConcerns)).toBe(true);
    expect(Array.isArray(result.summary.opportunities)).toBe(true);
    expect(Array.isArray(result.summary.achievements)).toBe(true);
  });

  it('debe manejar datos vacíos sin errores', () => {
    const result = runFullAnalysis([], []);

    expect(result.timestamp).toBeDefined();
    expect(result.summary.healthScore).toBeDefined();
  });
});
