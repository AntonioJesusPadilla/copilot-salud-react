// ============================================================================
// COMPONENTES DE CAPACIDAD HOSPITALARIA
// ============================================================================
// Exportaciones de todos los componentes del módulo de gestión de capacidad
// para facilitar su uso en otras partes de la aplicación.

export { default as BedCapacityMonitor } from './BedCapacityMonitor';
export { default as CapacityAlertsPanel } from './CapacityAlertsPanel';
export { default as CapacityPredictionChart } from './CapacityPredictionChart';
export { default as PlantOpeningRecommendations } from './PlantOpeningRecommendations';
export { default as CapacityHeatmap } from './CapacityHeatmap';

// Exportar tipos de props
export type { BedCapacityMonitorProps } from './BedCapacityMonitor';
export type { CapacityAlertsPanelProps } from './CapacityAlertsPanel';
export type { CapacityPredictionChartProps } from './CapacityPredictionChart';
export type { PlantOpeningRecommendationsProps } from './PlantOpeningRecommendations';
export type { CapacityHeatmapProps } from './CapacityHeatmap';
