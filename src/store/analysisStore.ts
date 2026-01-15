import { create } from 'zustand';
import {
  TrendResult,
  Anomaly,
  Directive,
  ComparisonInsight,
  AnalysisResult,
  DirectivePriority,
  DirectiveCategory,
  AnomalySeverity,
  sortDirectivesByPriority,
  filterAnomaliesBySeverity,
} from '../types/analysis';

interface AnalysisStore {
  // Estado - Resultados de análisis
  trends: Record<string, TrendResult>;
  anomalies: Anomaly[];
  directives: Directive[];
  comparisons: ComparisonInsight[];
  analysisResult: AnalysisResult | null;

  // Estado - UI
  isAnalyzing: boolean;
  error: string | null;
  lastAnalysisDate: string | null;

  // Estado - Filtros
  directivePriorityFilter: DirectivePriority | 'all';
  directiveCategoryFilter: DirectiveCategory | 'all';
  anomalySeverityFilter: AnomalySeverity | 'all';

  // Acciones - Análisis
  setAnalysisResult: (result: AnalysisResult) => void;
  setTrends: (trends: Record<string, TrendResult>) => void;
  setAnomalies: (anomalies: Anomaly[]) => void;
  setDirectives: (directives: Directive[]) => void;
  setComparisons: (comparisons: ComparisonInsight[]) => void;
  clearAnalysis: () => void;

  // Acciones - Directivas
  updateDirectiveStatus: (
    id: string,
    status: 'pending' | 'in_progress' | 'completed' | 'dismissed'
  ) => void;
  assignDirective: (id: string, assignedTo: string) => void;

  // Acciones - Filtros
  setDirectivePriorityFilter: (priority: DirectivePriority | 'all') => void;
  setDirectiveCategoryFilter: (category: DirectiveCategory | 'all') => void;
  setAnomalySeverityFilter: (severity: AnomalySeverity | 'all') => void;

  // Acciones - Getters filtrados
  getFilteredDirectives: () => Directive[];
  getFilteredAnomalies: () => Anomaly[];
  getHighPriorityDirectives: () => Directive[];
  getCriticalAnomalies: () => Anomaly[];
  getPendingDirectives: () => Directive[];

  // Acciones - Utilidades
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  // Estado inicial - Resultados
  trends: {},
  anomalies: [],
  directives: [],
  comparisons: [],
  analysisResult: null,

  // Estado inicial - UI
  isAnalyzing: false,
  error: null,
  lastAnalysisDate: null,

  // Estado inicial - Filtros
  directivePriorityFilter: 'all',
  directiveCategoryFilter: 'all',
  anomalySeverityFilter: 'all',

  // Establecer resultado completo de análisis
  setAnalysisResult: (result: AnalysisResult) => {
    set({
      analysisResult: result,
      trends: result.trends,
      anomalies: result.anomalies,
      directives: result.directives,
      comparisons: [
        ...result.comparisons.vsLastMonth,
        ...result.comparisons.vsLastYear,
        ...result.comparisons.vsBenchmark,
      ],
      lastAnalysisDate: result.timestamp,
      isAnalyzing: false,
      error: null,
    });
  },

  // Establecer tendencias
  setTrends: (trends: Record<string, TrendResult>) => {
    set({ trends });
  },

  // Establecer anomalías
  setAnomalies: (anomalies: Anomaly[]) => {
    set({ anomalies });
  },

  // Establecer directivas
  setDirectives: (directives: Directive[]) => {
    set({ directives: sortDirectivesByPriority(directives) });
  },

  // Establecer comparaciones
  setComparisons: (comparisons: ComparisonInsight[]) => {
    set({ comparisons });
  },

  // Limpiar análisis
  clearAnalysis: () => {
    set({
      trends: {},
      anomalies: [],
      directives: [],
      comparisons: [],
      analysisResult: null,
      lastAnalysisDate: null,
    });
  },

  // Actualizar estado de directiva
  updateDirectiveStatus: (
    id: string,
    status: 'pending' | 'in_progress' | 'completed' | 'dismissed'
  ) => {
    const { directives } = get();
    const updatedDirectives = directives.map((d) =>
      d.id === id ? { ...d, status, updatedAt: new Date().toISOString() } : d
    );
    set({ directives: updatedDirectives });
  },

  // Asignar directiva a usuario
  assignDirective: (id: string, assignedTo: string) => {
    const { directives } = get();
    const updatedDirectives = directives.map((d) =>
      d.id === id ? { ...d, assignedTo, updatedAt: new Date().toISOString() } : d
    );
    set({ directives: updatedDirectives });
  },

  // Establecer filtro de prioridad de directiva
  setDirectivePriorityFilter: (priority: DirectivePriority | 'all') => {
    set({ directivePriorityFilter: priority });
  },

  // Establecer filtro de categoría de directiva
  setDirectiveCategoryFilter: (category: DirectiveCategory | 'all') => {
    set({ directiveCategoryFilter: category });
  },

  // Establecer filtro de severidad de anomalía
  setAnomalySeverityFilter: (severity: AnomalySeverity | 'all') => {
    set({ anomalySeverityFilter: severity });
  },

  // Obtener directivas filtradas
  getFilteredDirectives: () => {
    const { directives, directivePriorityFilter, directiveCategoryFilter } = get();
    let filtered = [...directives];

    if (directivePriorityFilter !== 'all') {
      filtered = filtered.filter((d) => d.priority === directivePriorityFilter);
    }

    if (directiveCategoryFilter !== 'all') {
      filtered = filtered.filter((d) => d.category === directiveCategoryFilter);
    }

    return sortDirectivesByPriority(filtered);
  },

  // Obtener anomalías filtradas
  getFilteredAnomalies: () => {
    const { anomalies, anomalySeverityFilter } = get();

    if (anomalySeverityFilter === 'all') {
      return anomalies;
    }

    return filterAnomaliesBySeverity(anomalies, anomalySeverityFilter);
  },

  // Obtener directivas de alta prioridad
  getHighPriorityDirectives: () => {
    const { directives } = get();
    return directives.filter((d) => d.priority === 'high' || d.priority === 'urgent');
  },

  // Obtener anomalías críticas
  getCriticalAnomalies: () => {
    const { anomalies } = get();
    return anomalies.filter((a) => a.severity === 'critical' || a.severity === 'high');
  },

  // Obtener directivas pendientes
  getPendingDirectives: () => {
    const { directives } = get();
    return directives.filter((d) => d.status === 'pending' || d.status === 'in_progress');
  },

  // Establecer estado de análisis
  setIsAnalyzing: (isAnalyzing: boolean) => {
    set({ isAnalyzing });
  },

  // Establecer error
  setError: (error: string | null) => {
    set({ error, isAnalyzing: false });
  },

  // Limpiar error
  clearError: () => {
    set({ error: null });
  },
}));

export default useAnalysisStore;
