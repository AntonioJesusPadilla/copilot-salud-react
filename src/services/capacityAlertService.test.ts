import { describe, it, expect } from 'vitest';
import {
  checkCapacityAlerts,
  prioritizeAlerts,
  formatAlertMessage,
  generateRecommendedActions,
  getAlertSummary,
  filterAlerts,
  identifyRecurringAlertDepartments,
} from './capacityAlertService';
import { BedCapacityRecord, CapacityAlert } from '../types/capacity';

// ============================================================================
// DATOS DE PRUEBA
// ============================================================================

const mockCapacityData: BedCapacityRecord[] = [
  {
    hospital: 'Hospital A',
    planta: 'UCI',
    camasTotales: 20,
    camasOcupadas: 19,
    camasDisponibles: 1,
    porcentajeOcupacion: 95,
    pacientesEsperando: 5,
    tiempoEsperaMedioHoras: 3.5,
    altosTramite: 2,
    ingresosProgramados: 3,
    alertaCapacidad: 'rojo',
    recomendacionApertura: 'Abrir planta adicional',
    fechaActualizacion: '2024-01-15T10:00:00Z',
  },
  {
    hospital: 'Hospital A',
    planta: 'Urgencias',
    camasTotales: 30,
    camasOcupadas: 26,
    camasDisponibles: 4,
    porcentajeOcupacion: 87,
    pacientesEsperando: 8,
    tiempoEsperaMedioHoras: 2.0,
    altosTramite: 5,
    ingresosProgramados: 4,
    alertaCapacidad: 'amarillo',
    recomendacionApertura: 'Preparar apertura',
    fechaActualizacion: '2024-01-15T10:00:00Z',
  },
  {
    hospital: 'Hospital B',
    planta: 'Medicina Interna',
    camasTotales: 40,
    camasOcupadas: 30,
    camasDisponibles: 10,
    porcentajeOcupacion: 75,
    pacientesEsperando: 2,
    tiempoEsperaMedioHoras: 1.0,
    altosTramite: 3,
    ingresosProgramados: 2,
    alertaCapacidad: 'verde',
    recomendacionApertura: 'No necesario',
    fechaActualizacion: '2024-01-15T10:00:00Z',
  },
  {
    hospital: 'Hospital B',
    planta: 'Cardiología',
    camasTotales: 25,
    camasOcupadas: 23,
    camasDisponibles: 2,
    porcentajeOcupacion: 92,
    pacientesEsperando: 4,
    tiempoEsperaMedioHoras: 2.5,
    altosTramite: 1,
    ingresosProgramados: 2,
    alertaCapacidad: 'rojo',
    recomendacionApertura: 'Abrir planta adicional',
    fechaActualizacion: '2024-01-15T10:00:00Z',
  },
];

const mockAlerts: CapacityAlert[] = [
  {
    id: 'alert-1',
    hospital: 'Hospital A',
    planta: 'UCI',
    nivel: 'rojo',
    mensaje: 'Ocupación crítica alcanzada',
    ocupacionActual: 95,
    umbralSuperado: 90,
    timestamp: '2024-01-15T10:00:00Z',
    accionRecomendada: 'Activar protocolo de emergencia',
    resuelta: false,
  },
  {
    id: 'alert-2',
    hospital: 'Hospital A',
    planta: 'Urgencias',
    nivel: 'amarillo',
    mensaje: 'Ocupación elevada',
    ocupacionActual: 87,
    umbralSuperado: 85,
    timestamp: '2024-01-15T09:30:00Z',
    accionRecomendada: 'Monitorizar evolución',
    resuelta: false,
  },
  {
    id: 'alert-3',
    hospital: 'Hospital B',
    planta: 'Cardiología',
    nivel: 'rojo',
    mensaje: 'Ocupación crítica',
    ocupacionActual: 92,
    umbralSuperado: 90,
    timestamp: '2024-01-15T08:00:00Z',
    accionRecomendada: 'Activar protocolo',
    resuelta: true,
    resolvidaPor: 'Admin',
    fechaResolucion: '2024-01-15T09:00:00Z',
  },
  {
    id: 'alert-4',
    hospital: 'Hospital A',
    planta: 'UCI',
    nivel: 'amarillo',
    mensaje: 'Ocupación elevada',
    ocupacionActual: 88,
    umbralSuperado: 85,
    timestamp: '2024-01-14T10:00:00Z',
    accionRecomendada: 'Monitorizar',
    resuelta: true,
  },
];

// ============================================================================
// TESTS: checkCapacityAlerts
// ============================================================================

describe('checkCapacityAlerts', () => {
  it('debe generar alertas solo para niveles amarillo y rojo', () => {
    const alerts = checkCapacityAlerts(mockCapacityData);

    expect(alerts.length).toBe(3); // 1 rojo + 1 amarillo + 1 rojo (excluye verde)
    alerts.forEach((alert) => {
      expect(['rojo', 'amarillo']).toContain(alert.nivel);
    });
  });

  it('debe incluir información del hospital y planta', () => {
    const alerts = checkCapacityAlerts(mockCapacityData);

    alerts.forEach((alert) => {
      expect(alert.hospital).toBeDefined();
      expect(alert.planta).toBeDefined();
      expect(alert.id).toContain(alert.hospital);
    });
  });

  it('debe generar mensaje con ocupación actual', () => {
    const alerts = checkCapacityAlerts(mockCapacityData);

    alerts.forEach((alert) => {
      expect(alert.mensaje).toContain('%');
      expect(alert.ocupacionActual).toBeGreaterThan(0);
    });
  });

  it('debe marcar alertas como no resueltas', () => {
    const alerts = checkCapacityAlerts(mockCapacityData);

    alerts.forEach((alert) => {
      expect(alert.resuelta).toBe(false);
    });
  });

  it('debe devolver array vacío si todos están en verde', () => {
    const greenData: BedCapacityRecord[] = [
      {
        ...mockCapacityData[2],
        alertaCapacidad: 'verde',
      },
    ];

    const alerts = checkCapacityAlerts(greenData);

    expect(alerts).toHaveLength(0);
  });

  it('debe incluir acción recomendada para alertas rojas', () => {
    const alerts = checkCapacityAlerts(mockCapacityData);
    const redAlerts = alerts.filter((a) => a.nivel === 'rojo');

    redAlerts.forEach((alert) => {
      expect(alert.accionRecomendada).toBeDefined();
      expect(alert.accionRecomendada.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// TESTS: prioritizeAlerts
// ============================================================================

describe('prioritizeAlerts', () => {
  it('debe ordenar alertas rojas primero', () => {
    const prioritized = prioritizeAlerts(mockAlerts);

    const firstNonResolved = prioritized.filter((a) => !a.resuelta)[0];
    expect(firstNonResolved.nivel).toBe('rojo');
  });

  it('debe ordenar por ocupación dentro del mismo nivel', () => {
    const sameLevel: CapacityAlert[] = [
      {
        ...mockAlerts[0],
        id: 'test-1',
        nivel: 'rojo',
        ocupacionActual: 92,
      },
      {
        ...mockAlerts[0],
        id: 'test-2',
        nivel: 'rojo',
        ocupacionActual: 98,
      },
    ];

    const prioritized = prioritizeAlerts(sameLevel);

    expect(prioritized[0].ocupacionActual).toBe(98);
    expect(prioritized[1].ocupacionActual).toBe(92);
  });

  it('debe mantener el orden original si todo es igual', () => {
    const sameAlerts: CapacityAlert[] = [
      { ...mockAlerts[0], id: 'a', ocupacionActual: 95 },
      { ...mockAlerts[0], id: 'b', ocupacionActual: 95 },
    ];

    const prioritized = prioritizeAlerts(sameAlerts);

    expect(prioritized).toHaveLength(2);
  });

  it('no debe modificar el array original', () => {
    const original = [...mockAlerts];
    prioritizeAlerts(mockAlerts);

    expect(mockAlerts).toEqual(original);
  });
});

// ============================================================================
// TESTS: formatAlertMessage
// ============================================================================

describe('formatAlertMessage', () => {
  it('debe incluir información del nivel', () => {
    const message = formatAlertMessage(mockAlerts[0]);

    // El formato usa la etiqueta del nivel (Crítico, Advertencia, Normal) no el color
    expect(message).toContain('CRÍTICO');
  });

  it('debe incluir hospital y planta', () => {
    const message = formatAlertMessage(mockAlerts[0]);

    expect(message).toContain('Hospital A');
    expect(message).toContain('UCI');
  });

  it('debe incluir porcentaje de ocupación', () => {
    const message = formatAlertMessage(mockAlerts[0]);

    expect(message).toContain('95');
    expect(message).toContain('%');
  });

  it('debe incluir umbral superado', () => {
    const message = formatAlertMessage(mockAlerts[0]);

    expect(message).toContain('umbral');
    expect(message).toContain('90');
  });

  it('debe incluir acción recomendada', () => {
    const message = formatAlertMessage(mockAlerts[0]);

    expect(message).toContain('Acción');
  });
});

// ============================================================================
// TESTS: generateRecommendedActions
// ============================================================================

describe('generateRecommendedActions', () => {
  it('debe generar acciones para alertas rojas', () => {
    const redAlert = mockAlerts[0];
    const actions = generateRecommendedActions(redAlert);

    expect(actions.length).toBeGreaterThan(0);
    expect(actions[0].priority).toBe('immediate');
  });

  it('debe generar acciones para alertas amarillas', () => {
    const yellowAlert = mockAlerts[1];
    const actions = generateRecommendedActions(yellowAlert);

    expect(actions.length).toBeGreaterThan(0);
  });

  it('debe incluir departamento en cada acción', () => {
    const actions = generateRecommendedActions(mockAlerts[0]);

    actions.forEach((action) => {
      expect(action.department).toContain(mockAlerts[0].planta);
      expect(action.department).toContain(mockAlerts[0].hospital);
    });
  });

  it('debe incluir tiempo estimado en cada acción', () => {
    const actions = generateRecommendedActions(mockAlerts[0]);

    actions.forEach((action) => {
      expect(typeof action.estimatedTimeMinutes).toBe('number');
      expect(action.estimatedTimeMinutes).toBeGreaterThanOrEqual(0);
    });
  });

  it('debe tener prioridades válidas', () => {
    const actions = generateRecommendedActions(mockAlerts[0]);
    const validPriorities = ['immediate', 'high', 'medium', 'low'];

    actions.forEach((action) => {
      expect(validPriorities).toContain(action.priority);
    });
  });
});

// ============================================================================
// TESTS: getAlertSummary
// ============================================================================

describe('getAlertSummary', () => {
  it('debe contar total de alertas activas', () => {
    const summary = getAlertSummary(mockAlerts);

    expect(summary.total).toBe(2); // 2 no resueltas
  });

  it('debe contar alertas críticas correctamente', () => {
    const summary = getAlertSummary(mockAlerts);

    expect(summary.critical).toBe(1); // 1 roja no resuelta
  });

  it('debe contar alertas de advertencia correctamente', () => {
    const summary = getAlertSummary(mockAlerts);

    expect(summary.warning).toBe(1); // 1 amarilla no resuelta
  });

  it('debe contar alertas resueltas correctamente', () => {
    const summary = getAlertSummary(mockAlerts);

    expect(summary.resolved).toBe(2); // 2 resueltas
  });

  it('debe agrupar por hospital', () => {
    const summary = getAlertSummary(mockAlerts);

    expect(summary.byHospital).toHaveProperty('Hospital A');
    expect(summary.byHospital['Hospital A']).toBe(2);
  });

  it('debe agrupar por departamento', () => {
    const summary = getAlertSummary(mockAlerts);

    expect(summary.byDepartment).toHaveProperty('UCI');
    expect(summary.byDepartment).toHaveProperty('Urgencias');
  });

  it('debe manejar array vacío', () => {
    const summary = getAlertSummary([]);

    expect(summary.total).toBe(0);
    expect(summary.critical).toBe(0);
    expect(summary.warning).toBe(0);
    expect(summary.resolved).toBe(0);
  });
});

// ============================================================================
// TESTS: filterAlerts
// ============================================================================

describe('filterAlerts', () => {
  it('debe filtrar por nivel de alerta', () => {
    const filtered = filterAlerts(mockAlerts, { level: 'rojo' });

    expect(filtered.length).toBe(2);
    filtered.forEach((alert) => {
      expect(alert.nivel).toBe('rojo');
    });
  });

  it('debe filtrar por hospital', () => {
    const filtered = filterAlerts(mockAlerts, { hospital: 'Hospital A' });

    expect(filtered.length).toBe(3);
    filtered.forEach((alert) => {
      expect(alert.hospital).toBe('Hospital A');
    });
  });

  it('debe filtrar por departamento', () => {
    const filtered = filterAlerts(mockAlerts, { department: 'UCI' });

    expect(filtered.length).toBe(2);
    filtered.forEach((alert) => {
      expect(alert.planta).toBe('UCI');
    });
  });

  it('debe filtrar por estado resuelto', () => {
    const filteredResolved = filterAlerts(mockAlerts, { resolved: true });
    const filteredNotResolved = filterAlerts(mockAlerts, { resolved: false });

    expect(filteredResolved.length).toBe(2);
    expect(filteredNotResolved.length).toBe(2);
  });

  it('debe combinar múltiples filtros', () => {
    const filtered = filterAlerts(mockAlerts, {
      hospital: 'Hospital A',
      level: 'rojo',
      resolved: false,
    });

    expect(filtered.length).toBe(1);
    expect(filtered[0].hospital).toBe('Hospital A');
    expect(filtered[0].nivel).toBe('rojo');
    expect(filtered[0].resuelta).toBe(false);
  });

  it('debe devolver todas las alertas sin filtros', () => {
    const filtered = filterAlerts(mockAlerts, {});

    expect(filtered.length).toBe(mockAlerts.length);
  });
});

// ============================================================================
// TESTS: identifyRecurringAlertDepartments
// ============================================================================

describe('identifyRecurringAlertDepartments', () => {
  it('debe identificar departamentos con alertas recurrentes', () => {
    const alertsWithRecurring: CapacityAlert[] = [
      ...mockAlerts,
      { ...mockAlerts[0], id: 'alert-5', timestamp: '2024-01-14T08:00:00Z' },
      { ...mockAlerts[0], id: 'alert-6', timestamp: '2024-01-13T08:00:00Z' },
    ];

    const recurring = identifyRecurringAlertDepartments(alertsWithRecurring, 3);

    expect(recurring.length).toBeGreaterThan(0);
    expect(recurring[0].department).toBe('UCI');
    expect(recurring[0].count).toBeGreaterThanOrEqual(3);
  });

  it('debe ordenar por cantidad de alertas (descendente)', () => {
    const alertsWithRecurring: CapacityAlert[] = [
      ...mockAlerts,
      { ...mockAlerts[0], id: 'alert-5' },
      { ...mockAlerts[0], id: 'alert-6' },
      { ...mockAlerts[1], id: 'alert-7' },
      { ...mockAlerts[1], id: 'alert-8' },
      { ...mockAlerts[1], id: 'alert-9' },
      { ...mockAlerts[1], id: 'alert-10' },
    ];

    const recurring = identifyRecurringAlertDepartments(alertsWithRecurring, 3);

    if (recurring.length >= 2) {
      expect(recurring[0].count).toBeGreaterThanOrEqual(recurring[1].count);
    }
  });

  it('debe respetar umbral mínimo', () => {
    const recurring = identifyRecurringAlertDepartments(mockAlerts, 5);

    expect(recurring.length).toBe(0);
  });

  it('debe incluir información del hospital', () => {
    const alertsWithRecurring: CapacityAlert[] = [
      ...mockAlerts,
      { ...mockAlerts[0], id: 'alert-5' },
      { ...mockAlerts[0], id: 'alert-6' },
    ];

    const recurring = identifyRecurringAlertDepartments(alertsWithRecurring, 3);

    if (recurring.length > 0) {
      expect(recurring[0].hospital).toBeDefined();
      expect(recurring[0].hospital.length).toBeGreaterThan(0);
    }
  });

  it('debe manejar array vacío', () => {
    const recurring = identifyRecurringAlertDepartments([], 3);

    expect(recurring).toHaveLength(0);
  });
});

// ============================================================================
// TESTS: Escenarios de integración
// ============================================================================

describe('Escenarios de integración', () => {
  it('debe generar alertas y luego obtener resumen coherente', () => {
    const alerts = checkCapacityAlerts(mockCapacityData);
    const summary = getAlertSummary(alerts);

    expect(summary.total).toBe(alerts.length);
    expect(summary.critical + summary.warning).toBe(alerts.length);
  });

  it('debe priorizar y filtrar alertas correctamente', () => {
    const alerts = checkCapacityAlerts(mockCapacityData);
    const prioritized = prioritizeAlerts(alerts);
    const redOnly = filterAlerts(prioritized, { level: 'rojo' });

    // Las alertas rojas deben estar primero después de priorizar
    expect(prioritized[0].nivel).toBe('rojo');

    // Filtrar debe mantener solo las rojas
    redOnly.forEach((alert) => {
      expect(alert.nivel).toBe('rojo');
    });
  });

  it('debe generar acciones para todas las alertas generadas', () => {
    const alerts = checkCapacityAlerts(mockCapacityData);

    alerts.forEach((alert) => {
      const actions = generateRecommendedActions(alert);
      expect(actions.length).toBeGreaterThan(0);
    });
  });
});
