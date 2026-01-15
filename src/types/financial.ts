// Tipos para el sistema de Gestión Financiera Hospitalaria

// ============================================================================
// PRESUPUESTO POR DEPARTAMENTO
// ============================================================================

export interface DepartmentBudget {
  hospital: string;
  departamento: string;
  presupuestoAnualEuros: number;
  personalPlantilla: number;
  costePersonal: number;
  costeEquipamiento: number;
  costeMedicamentos: number;
  costeOperativo: number;
  pacientesEstimados: number;
  costePorPaciente: number;
  ingresosEstimados: number;
  margenOperativo: number;
  eficienciaCoste: number;
  tasaOcupacion: number;
  tiempoEsperaMedioDias: number;
  satisfaccionPaciente: number;
}

// ============================================================================
// KPIs FINANCIEROS MENSUALES
// ============================================================================

export interface FinancialKPI {
  hospital: string;
  mes: string; // formato: "YYYY-MM"
  ingresosTotales: number;
  gastosTotales: number;
  margenNeto: number;
  roi: number; // Return on Investment (%)
  ebitda: number;
  flujoCaja: number;
  deudaTotal: number;
  ratioLiquidez: number;
  diasCobroMedio: number;
  rotacionInventario: number;
  costeAdquisicionPaciente: number;
  valorVidaPaciente: number;
  tasaRetencion: number;
  pacientesNuevos: number;
  pacientesTotales: number;
}

// ============================================================================
// TENDENCIAS HISTÓRICAS
// ============================================================================

export interface HistoricalTrend {
  año: number;
  hospital: string;
  departamento: string;
  presupuestoTotal: number;
  pacientesAtendidos: number;
  costePorPaciente: number;
  satisfaccionMedia: number;
  eficienciaOperativa: number;
  margenNeto: number;
  ingresosTotales: number;
  personalTotal: number;
}

// ============================================================================
// ANÁLISIS DE EFICIENCIA
// ============================================================================

export type InnovacionLevel = 'Baja' | 'Media' | 'Alta' | 'Muy Alta';

export interface EfficiencyAnalysis {
  hospital: string;
  departamento: string;
  scoreEficiencia: number; // 0-10
  rankingNacional: number;
  ratioCosteBeneficio: number;
  tiempoMedioAtencionMin: number | null; // null para UCI
  tasaErrorClinico: number;
  reingresos30Dias: number;
  cumplimientoProtocolos: number; // porcentaje
  certificacionesCalidad: string[]; // Array de certificaciones
  innovacionTecnologica: InnovacionLevel;
  formacionContinuaHoras: number;
  publicacionesCientificas: number;
  colaboracionesInternacionales: number;
}

// ============================================================================
// ESTADÍSTICAS FINANCIERAS AGREGADAS
// ============================================================================

export interface FinancialStats {
  // Totales del sistema
  totalPresupuesto: number;
  totalIngresos: number;
  totalGastos: number;
  margenNetoTotal: number;
  roiPromedio: number;

  // Por hospital
  porHospital: {
    hospital: string;
    presupuesto: number;
    ingresos: number;
    gastos: number;
    margen: number;
    roi: number;
  }[];

  // Por departamento
  porDepartamento: {
    departamento: string;
    presupuestoTotal: number;
    eficienciaPromedio: number;
    costePorPacientePromedio: number;
  }[];

  // Tendencias
  tendencia: {
    direccion: 'up' | 'down' | 'stable';
    porcentajeCambio: number;
  };
}

// ============================================================================
// CONFIGURACIÓN DE HOSPITALES
// ============================================================================

export const HOSPITAL_CONFIGS = {
  'Hospital Regional Málaga': {
    id: 'hrm',
    nombre: 'Hospital Regional Málaga',
    nombreCorto: 'H. Regional',
    color: '#3B82F6',
    icon: '🏥',
  },
  'Hospital Costa del Sol': {
    id: 'hcs',
    nombre: 'Hospital Costa del Sol',
    nombreCorto: 'Costa del Sol',
    color: '#10B981',
    icon: '🌊',
  },
  'Hospital Clínico Universitario': {
    id: 'hcu',
    nombre: 'Hospital Clínico Universitario',
    nombreCorto: 'H. Clínico',
    color: '#8B5CF6',
    icon: '🎓',
  },
  'Hospital Virgen de la Victoria': {
    id: 'hvv',
    nombre: 'Hospital Virgen de la Victoria',
    nombreCorto: 'Virgen Victoria',
    color: '#F59E0B',
    icon: '⭐',
  },
} as const;

export type HospitalName = keyof typeof HOSPITAL_CONFIGS;

// ============================================================================
// CONFIGURACIÓN DE DEPARTAMENTOS
// ============================================================================

export const DEPARTMENT_CONFIGS = {
  Oncología: { color: '#EC4899', icon: '🎗️' },
  Radiología: { color: '#6366F1', icon: '📡' },
  'Farmacia Hospitalaria': { color: '#14B8A6', icon: '💊' },
  Telemedicina: { color: '#06B6D4', icon: '💻' },
  Urgencias: { color: '#EF4444', icon: '🚨' },
  UCI: { color: '#DC2626', icon: '❤️‍🩹' },
  Quirófano: { color: '#7C3AED', icon: '🔪' },
  Laboratorio: { color: '#059669', icon: '🔬' },
  Cardiología: { color: '#F43F5E', icon: '❤️' },
  Pediatría: { color: '#F97316', icon: '👶' },
  'Cirugía General': { color: '#8B5CF6', icon: '⚕️' },
  Traumatología: { color: '#64748B', icon: '🦴' },
  'Medicina Interna': { color: '#0EA5E9', icon: '🩺' },
  Neurología: { color: '#A855F7', icon: '🧠' },
} as const;

export type DepartmentName = keyof typeof DEPARTMENT_CONFIGS;

// ============================================================================
// FILTROS FINANCIEROS
// ============================================================================

export interface FinancialFilters {
  hospital?: string;
  departamento?: string;
  periodoInicio?: string; // formato: "YYYY-MM"
  periodoFin?: string;
  minROI?: number;
  maxROI?: number;
  estadoMargen?: 'positivo' | 'negativo' | 'todos';
}

// ============================================================================
// UMBRALES Y CONFIGURACIÓN
// ============================================================================

export const FINANCIAL_THRESHOLDS = {
  roi: {
    bueno: 8, // > 8% es bueno
    regular: 5, // 5-8% es regular
    malo: 0, // < 5% es malo
  },
  margen: {
    bueno: 0, // > 0 es positivo
    malo: -500000, // < -500k es crítico
  },
  eficiencia: {
    bueno: 1.0, // > 1.0 es eficiente
    malo: 0.95, // < 0.95 es ineficiente
  },
  satisfaccion: {
    bueno: 4.0, // > 4.0 es bueno
    regular: 3.5, // 3.5-4.0 es regular
    malo: 0, // < 3.5 es malo
  },
} as const;

// ============================================================================
// HELPERS DE COLOR SEGÚN VALOR
// ============================================================================

export function getROIColor(roi: number): string {
  if (roi >= FINANCIAL_THRESHOLDS.roi.bueno) return '#10B981'; // verde
  if (roi >= FINANCIAL_THRESHOLDS.roi.regular) return '#F59E0B'; // amarillo
  return '#EF4444'; // rojo
}

export function getMarginColor(margin: number): string {
  if (margin >= FINANCIAL_THRESHOLDS.margen.bueno) return '#10B981'; // verde
  if (margin >= FINANCIAL_THRESHOLDS.margen.malo) return '#F59E0B'; // amarillo
  return '#EF4444'; // rojo
}

export function getEfficiencyColor(efficiency: number): string {
  if (efficiency >= FINANCIAL_THRESHOLDS.eficiencia.bueno) return '#10B981'; // verde
  if (efficiency >= FINANCIAL_THRESHOLDS.eficiencia.malo) return '#F59E0B'; // amarillo
  return '#EF4444'; // rojo
}

export function getSatisfactionColor(satisfaction: number): string {
  if (satisfaction >= FINANCIAL_THRESHOLDS.satisfaccion.bueno) return '#10B981'; // verde
  if (satisfaction >= FINANCIAL_THRESHOLDS.satisfaccion.regular) return '#F59E0B'; // amarillo
  return '#EF4444'; // rojo
}
