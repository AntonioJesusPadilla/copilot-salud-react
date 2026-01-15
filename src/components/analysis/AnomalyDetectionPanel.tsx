import { useState, useMemo } from 'react';
import {
  Anomaly,
  AnomalySeverity,
  AnomalyType,
  ANOMALY_TYPE_CONFIGS,
  ANOMALY_SEVERITY_CONFIGS,
} from '../../types/analysis';

// ============================================================================
// TIPOS
// ============================================================================

export interface AnomalyDetectionPanelProps {
  anomalies: Anomaly[];
  title?: string;
  maxItems?: number;
  showFilters?: boolean;
  onAnomalyClick?: (anomaly: Anomaly) => void;
  compact?: boolean;
}

// ============================================================================
// COMPONENTE DE ITEM DE ANOMALÍA
// ============================================================================

interface AnomalyItemProps {
  anomaly: Anomaly;
  compact?: boolean;
  onClick?: () => void;
}

function AnomalyItem({ anomaly, compact = false, onClick }: AnomalyItemProps) {
  const typeConfig = ANOMALY_TYPE_CONFIGS[anomaly.type];
  const severityConfig = ANOMALY_SEVERITY_CONFIGS[anomaly.severity];

  const formatValue = (value: number): string => {
    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString('es-ES', { maximumFractionDigits: 2 });
  };

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const deviationPercent =
    ((anomaly.value - anomaly.expectedValue) / Math.abs(anomaly.expectedValue)) * 100;

  return (
    <div
      className={`border-l-4 rounded-lg bg-white dark:bg-gray-800 ${
        compact ? 'p-3' : 'p-4'
      } ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      style={{ borderLeftColor: severityConfig.color }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{typeConfig.icon}</span>
          <div>
            <h4
              className={`font-semibold text-gray-800 dark:text-gray-100 ${compact ? 'text-sm' : 'text-base'}`}
            >
              {anomaly.metric}
            </h4>
            {!compact && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {anomaly.hospital}
                {anomaly.departamento && ` • ${anomaly.departamento}`}
              </p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center space-x-2">
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: severityConfig.bgColor,
              color: severityConfig.color,
            }}
          >
            {severityConfig.label}
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700"
            style={{ color: typeConfig.color }}
          >
            {typeConfig.label}
          </span>
        </div>
      </div>

      {/* Descripción */}
      <p
        className={`text-gray-600 dark:text-gray-300 mb-3 ${compact ? 'text-xs line-clamp-1' : 'text-sm'}`}
      >
        {anomaly.description}
      </p>

      {/* Valores */}
      <div className={`grid gap-2 mb-3 ${compact ? 'grid-cols-2' : 'grid-cols-4'}`}>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <p className="text-xs text-gray-500 dark:text-gray-400">Valor detectado</p>
          <p className="text-sm font-semibold" style={{ color: severityConfig.color }}>
            {formatValue(anomaly.value)}
          </p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <p className="text-xs text-gray-500 dark:text-gray-400">Valor esperado</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {formatValue(anomaly.expectedValue)}
          </p>
        </div>
        {!compact && (
          <>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
              <p className="text-xs text-gray-500 dark:text-gray-400">Desviación</p>
              <p
                className={`text-sm font-semibold ${deviationPercent > 0 ? 'text-red-600' : 'text-blue-600'}`}
              >
                {deviationPercent > 0 ? '+' : ''}
                {deviationPercent.toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
              <p className="text-xs text-gray-500 dark:text-gray-400">σ (desv. est.)</p>
              <p className="text-sm font-semibold text-purple-600">
                {anomaly.deviation > 0 ? '+' : ''}
                {anomaly.deviation.toFixed(2)}σ
              </p>
            </div>
          </>
        )}
      </div>

      {/* Causas posibles (solo si no es compact) */}
      {!compact && anomaly.possibleCauses.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Posibles causas:
          </p>
          <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
            {anomaly.possibleCauses.slice(0, 2).map((cause, index) => (
              <li key={index}>{cause}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Acciones recomendadas (solo si no es compact) */}
      {!compact && anomaly.recommendedActions.length > 0 && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
            Acciones recomendadas:
          </p>
          <ul className="list-disc list-inside text-xs text-blue-600 dark:text-blue-400 space-y-0.5">
            {anomaly.recommendedActions.slice(0, 2).map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer con fecha */}
      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700">
        <span>ID: {anomaly.id.substring(0, 8)}...</span>
        <span>{formatDate(anomaly.timestamp)}</span>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE RESUMEN
// ============================================================================

interface AnomalySummaryProps {
  anomalies: Anomaly[];
}

function AnomalySummary({ anomalies }: AnomalySummaryProps) {
  const summary = useMemo(
    () => ({
      critical: anomalies.filter((a) => a.severity === 'critical').length,
      high: anomalies.filter((a) => a.severity === 'high').length,
      medium: anomalies.filter((a) => a.severity === 'medium').length,
      low: anomalies.filter((a) => a.severity === 'low').length,
      spikes: anomalies.filter((a) => a.type === 'spike').length,
      drops: anomalies.filter((a) => a.type === 'drop').length,
    }),
    [anomalies]
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p className="text-2xl font-bold text-red-600">{summary.critical}</p>
        <p className="text-xs text-red-700 dark:text-red-400">Críticas</p>
      </div>
      <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
        <p className="text-2xl font-bold text-orange-600">{summary.high}</p>
        <p className="text-xs text-orange-700 dark:text-orange-400">Alta severidad</p>
      </div>
      <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-2xl font-bold text-yellow-600">{summary.medium}</p>
        <p className="text-xs text-yellow-700 dark:text-yellow-400">Media</p>
      </div>
      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p className="text-2xl font-bold text-gray-600">{summary.low}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Baja</p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

function AnomalyDetectionPanel({
  anomalies,
  title = 'Detección de Anomalías',
  maxItems = 10,
  showFilters = true,
  onAnomalyClick,
  compact = false,
}: AnomalyDetectionPanelProps) {
  // Estado de filtros
  const [severityFilter, setSeverityFilter] = useState<AnomalySeverity | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<AnomalyType | 'all'>('all');

  // Filtrar y ordenar anomalías
  const filteredAnomalies = useMemo(() => {
    let filtered = [...anomalies];

    if (severityFilter !== 'all') {
      filtered = filtered.filter((a) => a.severity === severityFilter);
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter((a) => a.type === typeFilter);
    }

    // Ordenar por severidad y luego por fecha
    const severityOrder: Record<AnomalySeverity, number> = {
      critical: 1,
      high: 2,
      medium: 3,
      low: 4,
    };

    return filtered
      .sort((a, b) => {
        const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      })
      .slice(0, maxItems);
  }, [anomalies, severityFilter, typeFilter, maxItems]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {anomalies.length} anomalías detectadas
          </p>
        </div>

        {/* Indicador de alerta si hay críticas */}
        {anomalies.some((a) => a.severity === 'critical') && (
          <div className="flex items-center space-x-1 px-3 py-1 bg-red-100 dark:bg-red-900/50 rounded-full">
            <span className="animate-pulse">🔴</span>
            <span className="text-sm font-medium text-red-700 dark:text-red-300">
              {anomalies.filter((a) => a.severity === 'critical').length} críticas
            </span>
          </div>
        )}
      </div>

      {/* Resumen */}
      {!compact && <AnomalySummary anomalies={anomalies} />}

      {/* Filtros */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as AnomalySeverity | 'all')}
            className="text-sm px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <option value="all">Todas las severidades</option>
            {(Object.keys(ANOMALY_SEVERITY_CONFIGS) as AnomalySeverity[]).map((sev) => (
              <option key={sev} value={sev}>
                {ANOMALY_SEVERITY_CONFIGS[sev].label}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as AnomalyType | 'all')}
            className="text-sm px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <option value="all">Todos los tipos</option>
            {(Object.keys(ANOMALY_TYPE_CONFIGS) as AnomalyType[]).map((type) => (
              <option key={type} value={type}>
                {ANOMALY_TYPE_CONFIGS[type].icon} {ANOMALY_TYPE_CONFIGS[type].label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Lista de anomalías */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {filteredAnomalies.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <span className="text-4xl mb-2 block">✅</span>
            <p className="text-lg">Sin anomalías</p>
            <p className="text-sm">No se han detectado anomalías con los filtros seleccionados</p>
          </div>
        ) : (
          filteredAnomalies.map((anomaly) => (
            <AnomalyItem
              key={anomaly.id}
              anomaly={anomaly}
              compact={compact}
              onClick={onAnomalyClick ? () => onAnomalyClick(anomaly) : undefined}
            />
          ))
        )}
      </div>

      {/* Ver más */}
      {anomalies.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Ver todas las anomalías ({anomalies.length})
          </button>
        </div>
      )}
    </div>
  );
}

export default AnomalyDetectionPanel;
