import { describe, it, expect } from 'vitest';
import {
  linearRegression,
  predictNextValues,
  predictOccupancy,
  predictMonthlyValues,
  generateScenarioAnalysis,
  calculateConfidenceBands,
  predictTimeToSaturation,
  evaluateSaturationRisk,
  Prediction,
} from './predictionService';

// ============================================================================
// TESTS: linearRegression
// ============================================================================

describe('linearRegression', () => {
  it('debe calcular pendiente correcta para datos lineales ascendentes', () => {
    const values = [10, 20, 30, 40, 50];
    const result = linearRegression(values);

    expect(result.slope).toBeCloseTo(10, 1);
    expect(result.intercept).toBeCloseTo(10, 1);
    expect(result.rSquared).toBeCloseTo(1, 2);
  });

  it('debe calcular pendiente correcta para datos lineales descendentes', () => {
    const values = [50, 40, 30, 20, 10];
    const result = linearRegression(values);

    expect(result.slope).toBeCloseTo(-10, 1);
    expect(result.rSquared).toBeCloseTo(1, 2);
  });

  it('debe devolver valores por defecto con menos de 2 puntos', () => {
    const result = linearRegression([100]);

    expect(result.slope).toBe(0);
    expect(result.intercept).toBe(100);
    expect(result.rSquared).toBe(0);
  });

  it('debe manejar array vacío', () => {
    const result = linearRegression([]);

    expect(result.slope).toBe(0);
    expect(result.intercept).toBe(0);
  });

  it('debe calcular R² bajo para datos con mucha varianza', () => {
    const values = [10, 50, 20, 80, 30];
    const result = linearRegression(values);

    expect(result.rSquared).toBeLessThan(0.5);
  });

  it('debe calcular error estándar mayor que cero para datos no perfectos', () => {
    const values = [10, 25, 30, 45, 55];
    const result = linearRegression(values);

    expect(result.standardError).toBeGreaterThan(0);
  });
});

// ============================================================================
// TESTS: predictNextValues
// ============================================================================

describe('predictNextValues', () => {
  it('debe predecir valores futuros correctamente', () => {
    const historicalData = [100, 110, 120, 130, 140];
    const prediction = predictNextValues(historicalData, 3);

    expect(prediction.values).toHaveLength(3);
    expect(prediction.values[0]).toBeGreaterThan(140);
    expect(prediction.values[1]).toBeGreaterThan(prediction.values[0]);
  });

  it('debe devolver el último valor conocido si no hay suficientes datos', () => {
    const historicalData = [100, 110];
    const prediction = predictNextValues(historicalData, 3);

    expect(prediction.values).toHaveLength(3);
    expect(prediction.values[0]).toBe(110);
    expect(prediction.confidence).toBe(0);
    expect(prediction.trend).toBe('stable');
  });

  it('debe detectar tendencia alcista', () => {
    const historicalData = [100, 120, 140, 160, 180];
    const prediction = predictNextValues(historicalData, 3);

    expect(prediction.trend).toBe('up');
    expect(prediction.changePercent).toBeGreaterThan(0);
  });

  it('debe detectar tendencia bajista', () => {
    const historicalData = [180, 160, 140, 120, 100];
    const prediction = predictNextValues(historicalData, 3);

    expect(prediction.trend).toBe('down');
    expect(prediction.changePercent).toBeLessThan(0);
  });

  it('debe generar etiquetas por defecto', () => {
    const historicalData = [100, 110, 120, 130, 140];
    const prediction = predictNextValues(historicalData, 3);

    expect(prediction.labels).toHaveLength(3);
    expect(prediction.labels[0]).toBe('T+1');
    expect(prediction.labels[2]).toBe('T+3');
  });

  it('debe usar etiquetas personalizadas si se proporcionan', () => {
    const historicalData = [100, 110, 120, 130, 140];
    const labels = ['Enero', 'Febrero', 'Marzo'];
    const prediction = predictNextValues(historicalData, 3, labels);

    expect(prediction.labels).toEqual(labels);
  });

  it('no debe predecir valores negativos', () => {
    const historicalData = [50, 40, 30, 20, 10];
    const prediction = predictNextValues(historicalData, 5);

    prediction.values.forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(0);
    });
  });
});

// ============================================================================
// TESTS: predictOccupancy
// ============================================================================

describe('predictOccupancy', () => {
  it('debe predecir ocupación para las próximas horas', () => {
    const historicalOccupancy = [75, 77, 79, 81, 83];
    const prediction = predictOccupancy(historicalOccupancy, 24);

    expect(prediction.values).toHaveLength(24);
    expect(prediction.labels[0]).toBe('+1h');
    expect(prediction.labels[23]).toBe('+24h');
  });

  it('debe usar 24 horas por defecto', () => {
    const historicalOccupancy = [75, 77, 79, 81, 83];
    const prediction = predictOccupancy(historicalOccupancy);

    expect(prediction.values).toHaveLength(24);
  });
});

// ============================================================================
// TESTS: predictMonthlyValues
// ============================================================================

describe('predictMonthlyValues', () => {
  it('debe predecir valores mensuales correctamente', () => {
    const historicalData = [100000, 105000, 110000, 115000, 120000];
    const prediction = predictMonthlyValues(historicalData, 3);

    expect(prediction.values).toHaveLength(3);
  });

  it('debe generar etiquetas de mes correctas', () => {
    const historicalData = [100000, 105000, 110000, 115000, 120000];
    const prediction = predictMonthlyValues(historicalData, 3, '2024-06');

    expect(prediction.labels).toHaveLength(3);
    expect(prediction.labels[0]).toContain('Jul');
    expect(prediction.labels[1]).toContain('Ago');
    expect(prediction.labels[2]).toContain('Sep');
  });

  it('debe generar etiquetas genéricas sin mes de inicio', () => {
    const historicalData = [100000, 105000, 110000, 115000, 120000];
    const prediction = predictMonthlyValues(historicalData, 3);

    expect(prediction.labels[0]).toBe('Mes 1');
    expect(prediction.labels[2]).toBe('Mes 3');
  });

  it('debe manejar cambio de año en etiquetas', () => {
    const historicalData = [100000, 105000, 110000, 115000, 120000];
    const prediction = predictMonthlyValues(historicalData, 3, '2024-11');

    expect(prediction.labels).toHaveLength(3);
    expect(prediction.labels[0]).toContain('Dic');
    expect(prediction.labels[1]).toContain('Ene');
  });
});

// ============================================================================
// TESTS: generateScenarioAnalysis
// ============================================================================

describe('generateScenarioAnalysis', () => {
  it('debe generar tres escenarios', () => {
    const historicalData = [100, 105, 110, 115, 120];
    const scenario = generateScenarioAnalysis(historicalData, 3);

    expect(scenario).toHaveProperty('best');
    expect(scenario).toHaveProperty('expected');
    expect(scenario).toHaveProperty('worst');
  });

  it('debe ordenar escenarios correctamente (best > expected > worst)', () => {
    const historicalData = [100, 105, 110, 115, 120];
    const scenario = generateScenarioAnalysis(historicalData, 3);

    expect(scenario.best).toBeGreaterThanOrEqual(scenario.expected);
    expect(scenario.expected).toBeGreaterThanOrEqual(scenario.worst);
  });

  it('debe incluir probabilidades que sumen aproximadamente 100%', () => {
    const historicalData = [100, 105, 110, 115, 120];
    const scenario = generateScenarioAnalysis(historicalData, 3);

    const totalProb =
      scenario.probability.best + scenario.probability.expected + scenario.probability.worst;
    expect(totalProb).toBeCloseTo(95.1, 1); // 13.4 + 68.3 + 13.4
  });

  it('no debe generar valores negativos', () => {
    const historicalData = [50, 40, 30, 20, 10];
    const scenario = generateScenarioAnalysis(historicalData, 5);

    expect(scenario.best).toBeGreaterThanOrEqual(0);
    expect(scenario.expected).toBeGreaterThanOrEqual(0);
    expect(scenario.worst).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================================
// TESTS: calculateConfidenceBands
// ============================================================================

describe('calculateConfidenceBands', () => {
  it('debe calcular bandas superior e inferior', () => {
    const prediction: Prediction = {
      values: [100, 110, 120],
      labels: ['T+1', 'T+2', 'T+3'],
      confidence: 80,
      trend: 'up',
      changePercent: 20,
    };

    const bands = calculateConfidenceBands(prediction);

    expect(bands.upper).toHaveLength(3);
    expect(bands.lower).toHaveLength(3);
  });

  it('debe tener banda superior mayor que predicción', () => {
    const prediction: Prediction = {
      values: [100, 110, 120],
      labels: ['T+1', 'T+2', 'T+3'],
      confidence: 80,
      trend: 'up',
      changePercent: 20,
    };

    const bands = calculateConfidenceBands(prediction);

    prediction.values.forEach((val, i) => {
      expect(bands.upper[i]).toBeGreaterThan(val);
    });
  });

  it('debe tener banda inferior menor que predicción', () => {
    const prediction: Prediction = {
      values: [100, 110, 120],
      labels: ['T+1', 'T+2', 'T+3'],
      confidence: 80,
      trend: 'up',
      changePercent: 20,
    };

    const bands = calculateConfidenceBands(prediction);

    prediction.values.forEach((val, i) => {
      expect(bands.lower[i]).toBeLessThan(val);
    });
  });

  it('debe ampliar bandas progresivamente', () => {
    const prediction: Prediction = {
      values: [100, 110, 120, 130],
      labels: ['T+1', 'T+2', 'T+3', 'T+4'],
      confidence: 70,
      trend: 'up',
      changePercent: 30,
    };

    const bands = calculateConfidenceBands(prediction);

    // La diferencia entre upper y lower debe crecer
    const diff1 = bands.upper[0] - bands.lower[0];
    const diff4 = bands.upper[3] - bands.lower[3];

    expect(diff4).toBeGreaterThan(diff1);
  });

  it('no debe generar bandas inferiores negativas', () => {
    const prediction: Prediction = {
      values: [10, 15, 20],
      labels: ['T+1', 'T+2', 'T+3'],
      confidence: 30,
      trend: 'up',
      changePercent: 100,
    };

    const bands = calculateConfidenceBands(prediction);

    bands.lower.forEach((val) => {
      expect(val).toBeGreaterThanOrEqual(0);
    });
  });
});

// ============================================================================
// TESTS: predictTimeToSaturation
// ============================================================================

describe('predictTimeToSaturation', () => {
  it('debe devolver 0 si ya está saturado', () => {
    const result = predictTimeToSaturation(100, [90, 92, 95, 98, 100], 100);

    expect(result).toBe(0);
  });

  it('debe devolver null si no hay tendencia hacia saturación', () => {
    const result = predictTimeToSaturation(70, [80, 78, 75, 72, 70], 100);

    expect(result).toBeNull();
  });

  it('debe calcular períodos hasta saturación con tendencia alcista', () => {
    const result = predictTimeToSaturation(80, [60, 65, 70, 75, 80], 100);

    expect(result).toBeGreaterThan(0);
    expect(typeof result).toBe('number');
  });

  it('debe devolver 0 si el índice de saturación está en el pasado', () => {
    // Datos que indican que ya debería estar saturado
    const result = predictTimeToSaturation(95, [70, 80, 90, 95, 100], 95);

    expect(result).toBe(0);
  });
});

// ============================================================================
// TESTS: evaluateSaturationRisk
// ============================================================================

describe('evaluateSaturationRisk', () => {
  it('debe devolver critical si ocupación actual >= 90%', () => {
    const prediction: Prediction = {
      values: [91, 92, 93],
      labels: [],
      confidence: 80,
      trend: 'up',
      changePercent: 5,
    };

    const risk = evaluateSaturationRisk(90, prediction);

    expect(risk).toBe('critical');
  });

  it('debe devolver critical si predicción máxima >= 95%', () => {
    const prediction: Prediction = {
      values: [85, 90, 96],
      labels: [],
      confidence: 80,
      trend: 'up',
      changePercent: 10,
    };

    const risk = evaluateSaturationRisk(80, prediction);

    expect(risk).toBe('critical');
  });

  it('debe devolver high si ocupación actual >= 85%', () => {
    const prediction: Prediction = {
      values: [86, 87, 88],
      labels: [],
      confidence: 80,
      trend: 'up',
      changePercent: 3,
    };

    const risk = evaluateSaturationRisk(85, prediction);

    expect(risk).toBe('high');
  });

  it('debe devolver high si predicción máxima >= 90%', () => {
    const prediction: Prediction = {
      values: [82, 86, 91],
      labels: [],
      confidence: 80,
      trend: 'up',
      changePercent: 8,
    };

    const risk = evaluateSaturationRisk(75, prediction);

    expect(risk).toBe('high');
  });

  it('debe devolver medium si hay tendencia alcista > 5%', () => {
    const prediction: Prediction = {
      values: [75, 78, 81],
      labels: [],
      confidence: 80,
      trend: 'up',
      changePercent: 8,
    };

    const risk = evaluateSaturationRisk(70, prediction);

    expect(risk).toBe('medium');
  });

  it('debe devolver low para situaciones normales', () => {
    const prediction: Prediction = {
      values: [70, 71, 72],
      labels: [],
      confidence: 80,
      trend: 'stable',
      changePercent: 2,
    };

    const risk = evaluateSaturationRisk(68, prediction);

    expect(risk).toBe('low');
  });
});
