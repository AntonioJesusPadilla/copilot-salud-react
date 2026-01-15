import {
  Directive,
  DirectiveCategory,
  DirectivePriority,
  Anomaly,
  ComparisonInsight,
  TrendResult,
} from '../types/analysis';
import { DepartmentBudget, FINANCIAL_THRESHOLDS } from '../types/financial';
import { BedCapacityRecord, CAPACITY_THRESHOLDS } from '../types/capacity';

// ============================================================================
// GENERACIÓN DE DIRECTIVAS
// ============================================================================

/**
 * Genera directivas basadas en anomalías detectadas
 */
export function generateDirectivesFromAnomalies(anomalies: Anomaly[]): Directive[] {
  const directives: Directive[] = [];
  const timestamp = new Date().toISOString();

  anomalies.forEach((anomaly, index) => {
    // Determinar prioridad basada en severidad
    const priorityMap: Record<string, DirectivePriority> = {
      critical: 'urgent',
      high: 'high',
      medium: 'medium',
      low: 'low',
    };

    // Determinar categoría basada en la métrica
    let category: DirectiveCategory = 'operational';
    if (anomaly.metric.includes('Coste') || anomaly.metric.includes('ROI')) {
      category = 'financial';
    } else if (anomaly.metric.includes('Eficiencia')) {
      category = 'efficiency';
    } else if (anomaly.metric.includes('Satisfacción') || anomaly.metric.includes('Calidad')) {
      category = 'quality';
    }

    const directive: Directive = {
      id: `directive-anomaly-${anomaly.id}-${index}`,
      category,
      priority: priorityMap[anomaly.severity] || 'medium',
      status: 'pending',
      title: `Revisar ${anomaly.metric} en ${anomaly.departamento || ''} - ${anomaly.hospital || ''}`,
      description: anomaly.description,
      metric: anomaly.metric,
      currentValue: anomaly.value,
      targetValue: anomaly.expectedValue,
      improvement:
        anomaly.expectedValue !== 0
          ? Math.abs(((anomaly.expectedValue - anomaly.value) / anomaly.expectedValue) * 100)
          : 0,
      hospital: anomaly.hospital,
      departamento: anomaly.departamento,
      actions: anomaly.recommendedActions,
      estimatedImpact: calculateEstimatedImpact(anomaly),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    directives.push(directive);
  });

  return directives;
}

/**
 * Genera directivas basadas en comparaciones entre entidades
 */
export function generateDirectivesFromComparisons(comparisons: ComparisonInsight[]): Directive[] {
  const directives: Directive[] = [];
  const timestamp = new Date().toISOString();

  comparisons.forEach((comparison, index) => {
    if (comparison.type === 'worse' || comparison.percentDifference > 10) {
      const priority: DirectivePriority = comparison.percentDifference > 20 ? 'high' : 'medium';

      const directive: Directive = {
        id: `directive-comparison-${comparison.id}-${index}`,
        category:
          comparison.metric.includes('ROI') || comparison.metric.includes('Coste')
            ? 'financial'
            : 'efficiency',
        priority,
        status: 'pending',
        title: `Mejorar ${comparison.metric}: ${comparison.entityB} vs ${comparison.entityA}`,
        description: comparison.insight,
        metric: comparison.metric,
        currentValue: comparison.valueB,
        targetValue: comparison.valueA,
        improvement: comparison.percentDifference,
        hospital: comparison.entityB,
        actions: [
          `Analizar prácticas de ${comparison.entityA} para identificar mejores prácticas`,
          `Realizar benchmarking detallado entre ambas entidades`,
          comparison.recommendation || 'Establecer plan de mejora con objetivos medibles',
        ],
        estimatedImpact: {
          efficiency: comparison.percentDifference,
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      directives.push(directive);
    }
  });

  return directives;
}

/**
 * Genera directivas basadas en tendencias negativas
 */
export function generateDirectivesFromTrends(
  trends: Record<string, TrendResult>,
  context?: { hospital?: string; departamento?: string }
): Directive[] {
  const directives: Directive[] = [];
  const timestamp = new Date().toISOString();

  Object.entries(trends).forEach(([key, trend]) => {
    // Solo generar directivas para tendencias negativas significativas
    if (trend.direction === 'down' && trend.changePercent < -5 && trend.confidence > 50) {
      const [entity, metric] = key.split('_');
      const isSystemWide = entity === 'sistema';

      const priority: DirectivePriority =
        trend.changePercent < -15 ? 'urgent' : trend.changePercent < -10 ? 'high' : 'medium';

      const category: DirectiveCategory = 'financial';
      let metricName = metric;

      if (metric === 'ingresos') metricName = 'Ingresos Totales';
      if (metric === 'margen') metricName = 'Margen Neto';
      if (metric === 'roi') metricName = 'ROI';
      if (metric === 'ebitda') metricName = 'EBITDA';

      const directive: Directive = {
        id: `directive-trend-${key}-${timestamp}`,
        category,
        priority,
        status: 'pending',
        title: `Revertir tendencia negativa de ${metricName}${isSystemWide ? ' del sistema' : ` en ${entity}`}`,
        description: `${metricName} ha caído un ${Math.abs(trend.changePercent).toFixed(1)}% con una confianza del ${trend.confidence.toFixed(0)}%`,
        metric: metricName,
        currentValue: trend.endValue,
        targetValue: trend.startValue,
        improvement: Math.abs(trend.changePercent),
        hospital: isSystemWide ? undefined : entity,
        departamento: context?.departamento,
        actions: generateActionsForTrend(metric, trend),
        estimatedImpact: {
          financial: Math.abs(trend.endValue - trend.startValue),
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      directives.push(directive);
    }
  });

  return directives;
}

/**
 * Genera directivas para departamentos con bajo rendimiento
 */
export function generateDirectivesFromBudgets(budgets: DepartmentBudget[]): Directive[] {
  const directives: Directive[] = [];
  const timestamp = new Date().toISOString();

  budgets.forEach((budget) => {
    // Directiva para baja eficiencia
    if (budget.eficienciaCoste < FINANCIAL_THRESHOLDS.eficiencia.malo) {
      directives.push({
        id: `directive-efficiency-${budget.hospital}-${budget.departamento}-${timestamp}`,
        category: 'efficiency',
        priority: budget.eficienciaCoste < 0.9 ? 'high' : 'medium',
        status: 'pending',
        title: `Mejorar eficiencia en ${budget.departamento} - ${budget.hospital}`,
        description: `La eficiencia de coste (${(budget.eficienciaCoste * 100).toFixed(1)}%) está por debajo del umbral aceptable (${(FINANCIAL_THRESHOLDS.eficiencia.malo * 100).toFixed(0)}%)`,
        metric: 'Eficiencia de Coste',
        currentValue: budget.eficienciaCoste,
        targetValue: FINANCIAL_THRESHOLDS.eficiencia.bueno,
        improvement:
          ((FINANCIAL_THRESHOLDS.eficiencia.bueno - budget.eficienciaCoste) /
            budget.eficienciaCoste) *
          100,
        hospital: budget.hospital,
        departamento: budget.departamento,
        actions: [
          'Auditar procesos operativos para identificar ineficiencias',
          'Revisar asignación de personal y cargas de trabajo',
          'Evaluar oportunidades de automatización',
          'Implementar programa de mejora continua',
        ],
        estimatedImpact: {
          efficiency: (FINANCIAL_THRESHOLDS.eficiencia.bueno - budget.eficienciaCoste) * 100,
          financial: budget.presupuestoAnualEuros * 0.05, // Estimación de ahorro del 5%
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    // Directiva para baja satisfacción
    if (budget.satisfaccionPaciente < FINANCIAL_THRESHOLDS.satisfaccion.regular) {
      directives.push({
        id: `directive-satisfaction-${budget.hospital}-${budget.departamento}-${timestamp}`,
        category: 'quality',
        priority: budget.satisfaccionPaciente < 3.0 ? 'high' : 'medium',
        status: 'pending',
        title: `Mejorar satisfacción del paciente en ${budget.departamento} - ${budget.hospital}`,
        description: `La satisfacción del paciente (${budget.satisfaccionPaciente.toFixed(1)}/5) está por debajo del objetivo (${FINANCIAL_THRESHOLDS.satisfaccion.bueno}/5)`,
        metric: 'Satisfacción del Paciente',
        currentValue: budget.satisfaccionPaciente,
        targetValue: FINANCIAL_THRESHOLDS.satisfaccion.bueno,
        improvement:
          ((FINANCIAL_THRESHOLDS.satisfaccion.bueno - budget.satisfaccionPaciente) /
            budget.satisfaccionPaciente) *
          100,
        hospital: budget.hospital,
        departamento: budget.departamento,
        actions: [
          'Realizar encuestas detalladas para identificar áreas de mejora',
          'Revisar tiempos de espera y procesos de atención',
          'Implementar programa de formación en atención al paciente',
          'Establecer canales de feedback continuo',
        ],
        estimatedImpact: {
          quality: FINANCIAL_THRESHOLDS.satisfaccion.bueno - budget.satisfaccionPaciente,
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    // Directiva para alto tiempo de espera
    if (budget.tiempoEsperaMedioDias > 7) {
      directives.push({
        id: `directive-waittime-${budget.hospital}-${budget.departamento}-${timestamp}`,
        category: 'operational',
        priority: budget.tiempoEsperaMedioDias > 14 ? 'high' : 'medium',
        status: 'pending',
        title: `Reducir tiempo de espera en ${budget.departamento} - ${budget.hospital}`,
        description: `El tiempo de espera medio (${budget.tiempoEsperaMedioDias.toFixed(0)} días) es excesivo`,
        metric: 'Tiempo de Espera',
        currentValue: budget.tiempoEsperaMedioDias,
        targetValue: 5,
        improvement: ((budget.tiempoEsperaMedioDias - 5) / budget.tiempoEsperaMedioDias) * 100,
        hospital: budget.hospital,
        departamento: budget.departamento,
        actions: [
          'Analizar cuellos de botella en el proceso de atención',
          'Evaluar ampliación de horarios o personal',
          'Implementar sistema de citas online optimizado',
          'Considerar derivación a otros centros',
        ],
        estimatedImpact: {
          quality: (budget.tiempoEsperaMedioDias - 5) / budget.tiempoEsperaMedioDias,
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
  });

  return directives;
}

/**
 * Genera directivas para problemas de capacidad
 */
export function generateDirectivesFromCapacity(capacity: BedCapacityRecord[]): Directive[] {
  const directives: Directive[] = [];
  const timestamp = new Date().toISOString();

  capacity.forEach((record) => {
    // Directiva para alta ocupación
    if (record.alertaCapacidad === 'rojo' || record.porcentajeOcupacion >= 90) {
      directives.push({
        id: `directive-capacity-${record.hospital}-${record.planta}-${timestamp}`,
        category: 'capacity',
        priority: record.porcentajeOcupacion >= 95 ? 'urgent' : 'high',
        status: 'pending',
        title: `Gestionar saturación en ${record.planta} - ${record.hospital}`,
        description: `Ocupación crítica del ${record.porcentajeOcupacion.toFixed(1)}% con ${record.pacientesEsperando} pacientes esperando`,
        metric: 'Ocupación',
        currentValue: record.porcentajeOcupacion,
        targetValue: CAPACITY_THRESHOLDS.ocupacion.verde,
        improvement: record.porcentajeOcupacion - CAPACITY_THRESHOLDS.ocupacion.verde,
        hospital: record.hospital,
        departamento: record.planta,
        actions: [
          record.recomendacionApertura !== 'No necesario'
            ? record.recomendacionApertura
            : 'Evaluar apertura de planta adicional',
          `Acelerar ${record.altosTramite} altas en trámite`,
          'Derivar nuevos ingresos a centros con capacidad',
          'Activar protocolo de gestión de crisis',
        ],
        estimatedImpact: {
          efficiency: record.porcentajeOcupacion - CAPACITY_THRESHOLDS.ocupacion.verde,
        },
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    // Directiva para alto tiempo de espera en urgencias
    if (
      record.tiempoEsperaMedioHoras > CAPACITY_THRESHOLDS.tiempoEspera.elevado &&
      record.planta.toLowerCase().includes('urgencia')
    ) {
      directives.push({
        id: `directive-waittime-${record.hospital}-${record.planta}-${timestamp}`,
        category: 'operational',
        priority:
          record.tiempoEsperaMedioHoras > CAPACITY_THRESHOLDS.tiempoEspera.critico
            ? 'urgent'
            : 'high',
        status: 'pending',
        title: `Reducir espera en Urgencias - ${record.hospital}`,
        description: `Tiempo de espera medio de ${record.tiempoEsperaMedioHoras.toFixed(1)} horas`,
        metric: 'Tiempo de Espera',
        currentValue: record.tiempoEsperaMedioHoras,
        targetValue: CAPACITY_THRESHOLDS.tiempoEspera.aceptable,
        improvement:
          ((record.tiempoEsperaMedioHoras - CAPACITY_THRESHOLDS.tiempoEspera.aceptable) /
            record.tiempoEsperaMedioHoras) *
          100,
        hospital: record.hospital,
        departamento: record.planta,
        actions: [
          'Reforzar personal en triaje',
          'Activar boxes adicionales si es posible',
          'Derivar casos no urgentes a Atención Primaria',
          'Notificar a dirección médica',
        ],
        estimatedImpact: {
          quality:
            (record.tiempoEsperaMedioHoras - CAPACITY_THRESHOLDS.tiempoEspera.aceptable) /
            record.tiempoEsperaMedioHoras,
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
  });

  return directives;
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

function calculateEstimatedImpact(anomaly: Anomaly): Directive['estimatedImpact'] {
  const impact: Directive['estimatedImpact'] = {};

  if (anomaly.metric.includes('Coste')) {
    // Estimación de impacto financiero basado en la desviación
    impact.financial = Math.abs(anomaly.value - anomaly.expectedValue) * 100; // Multiplicador estimado
  }

  if (anomaly.metric.includes('Eficiencia')) {
    impact.efficiency = Math.abs(anomaly.deviation) * 5; // Porcentaje de mejora potencial
  }

  if (anomaly.metric.includes('Satisfacción')) {
    impact.quality = Math.abs(anomaly.deviation) * 0.5; // Puntos de mejora potencial
  }

  return impact;
}

function generateActionsForTrend(metric: string, _trend: TrendResult): string[] {
  const actions: string[] = [];

  switch (metric) {
    case 'ingresos':
      actions.push(
        'Revisar cartera de servicios y oportunidades de crecimiento',
        'Analizar tendencias de demanda por especialidad',
        'Evaluar estrategia de captación de pacientes',
        'Revisar acuerdos con aseguradoras y mutuas'
      );
      break;
    case 'margen':
      actions.push(
        'Analizar estructura de costes por departamento',
        'Identificar áreas de optimización de recursos',
        'Revisar política de compras y contratos',
        'Evaluar oportunidades de eficiencia energética'
      );
      break;
    case 'roi':
      actions.push(
        'Revisar inversiones en curso y su retorno',
        'Priorizar proyectos con mayor impacto',
        'Analizar ciclo de cobro y gestión de deuda',
        'Evaluar reasignación de capital'
      );
      break;
    case 'ebitda':
      actions.push(
        'Optimizar costes operativos no esenciales',
        'Revisar eficiencia de procesos core',
        'Analizar productividad por departamento',
        'Implementar programa de reducción de desperdicios'
      );
      break;
    default:
      actions.push(
        'Realizar análisis detallado de causas',
        'Establecer plan de acción correctivo',
        'Definir indicadores de seguimiento',
        'Asignar responsables y plazos'
      );
  }

  return actions;
}

/**
 * Formatea una directiva para mostrar en texto
 */
export function formatDirective(directive: Directive): string {
  const priorityEmoji: Record<DirectivePriority, string> = {
    urgent: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
  };

  const lines = [
    `${priorityEmoji[directive.priority]} **${directive.title}**`,
    ``,
    `📝 ${directive.description}`,
    ``,
    `**Métricas:**`,
    `- Valor actual: ${directive.currentValue.toFixed(2)}`,
    `- Objetivo: ${directive.targetValue.toFixed(2)}`,
    `- Mejora esperada: ${directive.improvement.toFixed(1)}%`,
    ``,
    `**Acciones recomendadas:**`,
    ...directive.actions.map((action, i) => `${i + 1}. ${action}`),
  ];

  if (directive.deadline) {
    lines.push(``, `⏰ Plazo: ${new Date(directive.deadline).toLocaleDateString('es-ES')}`);
  }

  return lines.join('\n');
}

/**
 * Genera todas las directivas combinando diferentes fuentes
 */
export function generateAllDirectives(
  anomalies: Anomaly[],
  comparisons: ComparisonInsight[],
  trends: Record<string, TrendResult>,
  budgets: DepartmentBudget[],
  capacity: BedCapacityRecord[]
): Directive[] {
  const allDirectives: Directive[] = [
    ...generateDirectivesFromAnomalies(anomalies),
    ...generateDirectivesFromComparisons(comparisons),
    ...generateDirectivesFromTrends(trends),
    ...generateDirectivesFromBudgets(budgets),
    ...generateDirectivesFromCapacity(capacity),
  ];

  // Ordenar por prioridad
  const priorityOrder: Record<DirectivePriority, number> = {
    urgent: 1,
    high: 2,
    medium: 3,
    low: 4,
  };

  return allDirectives.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

// Exportar servicio como objeto
export const directivesGeneratorService = {
  generateDirectivesFromAnomalies,
  generateDirectivesFromComparisons,
  generateDirectivesFromTrends,
  generateDirectivesFromBudgets,
  generateDirectivesFromCapacity,
  generateAllDirectives,
  formatDirective,
};
