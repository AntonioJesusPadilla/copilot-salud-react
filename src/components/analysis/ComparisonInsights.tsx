import { useMemo } from 'react';
import { ComparisonInsight } from '../../types/analysis';

// ============================================================================
// TIPOS
// ============================================================================

export interface ComparisonInsightsProps {
  insights: ComparisonInsight[];
  title?: string;
  groupBy?: 'type' | 'metric';
  maxItems?: number;
  compact?: boolean;
  onInsightClick?: (insight: ComparisonInsight) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

const COMPARISON_TYPE_CONFIG = {
  better: {
    icon: '📈',
    color: '#10B981',
    bgColor: '#D1FAE5',
    darkBgColor: '#064E3B',
    label: 'Mejor rendimiento',
  },
  worse: {
    icon: '📉',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    darkBgColor: '#7F1D1D',
    label: 'Peor rendimiento',
  },
  similar: {
    icon: '➡️',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    darkBgColor: '#374151',
    label: 'Similar',
  },
};

function formatValue(value: number): string {
  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString('es-ES', { maximumFractionDigits: 2 });
}

function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

// ============================================================================
// COMPONENTE DE CARD DE INSIGHT
// ============================================================================

interface InsightCardProps {
  insight: ComparisonInsight;
  compact?: boolean;
  onClick?: () => void;
}

function InsightCard({ insight, compact = false, onClick }: InsightCardProps) {
  const config = COMPARISON_TYPE_CONFIG[insight.type];

  return (
    <div
      className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${
        compact ? 'p-3' : 'p-4'
      } ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      {/* Header con tipo e icono */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span
            className="w-8 h-8 flex items-center justify-center rounded-full text-lg"
            style={{ backgroundColor: `${config.color}20` }}
          >
            {config.icon}
          </span>
          <div>
            <h4
              className={`font-semibold text-gray-800 dark:text-gray-100 ${compact ? 'text-sm' : 'text-base'}`}
            >
              {insight.metric}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{config.label}</p>
          </div>
        </div>

        {/* Badge de diferencia */}
        <span
          className="px-2 py-1 rounded-full text-xs font-bold"
          style={{
            backgroundColor: config.bgColor,
            color: config.color,
          }}
        >
          {formatPercent(insight.percentDifference)}
        </span>
      </div>

      {/* Comparación visual */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <p
            className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate"
            title={insight.entityA}
          >
            {insight.entityA}
          </p>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {formatValue(insight.valueA)}
          </p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <p
            className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate"
            title={insight.entityB}
          >
            {insight.entityB}
          </p>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {formatValue(insight.valueB)}
          </p>
        </div>
      </div>

      {/* Barra de comparación visual */}
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, Math.max(0, (insight.valueA / (insight.valueA + insight.valueB)) * 100))}%`,
            backgroundColor: '#3B82F6',
          }}
        />
        <div
          className="absolute right-0 top-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, Math.max(0, (insight.valueB / (insight.valueA + insight.valueB)) * 100))}%`,
            backgroundColor: '#10B981',
          }}
        />
      </div>

      {/* Insight textual */}
      <p
        className={`text-gray-600 dark:text-gray-300 ${compact ? 'text-xs line-clamp-2' : 'text-sm'}`}
      >
        {insight.insight}
      </p>

      {/* Recomendación (si existe y no es compact) */}
      {!compact && insight.recommendation && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
          <p className="text-xs text-blue-700 dark:text-blue-300">💡 {insight.recommendation}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE RESUMEN
// ============================================================================

interface InsightsSummaryProps {
  insights: ComparisonInsight[];
}

function InsightsSummary({ insights }: InsightsSummaryProps) {
  const summary = useMemo(
    () => ({
      better: insights.filter((i) => i.type === 'better').length,
      worse: insights.filter((i) => i.type === 'worse').length,
      similar: insights.filter((i) => i.type === 'similar').length,
      avgDifference:
        insights.reduce((sum, i) => sum + Math.abs(i.percentDifference), 0) / insights.length || 0,
    }),
    [insights]
  );

  return (
    <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
      <div className="text-center">
        <p className="text-2xl font-bold text-green-600">{summary.better}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Mejor</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-red-600">{summary.worse}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Peor</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-600">{summary.similar}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Similar</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-600">{summary.avgDifference.toFixed(1)}%</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Dif. media</p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

function ComparisonInsights({
  insights,
  title = 'Comparaciones y Insights',
  groupBy = 'type',
  maxItems = 6,
  compact = false,
  onInsightClick,
}: ComparisonInsightsProps) {
  // Agrupar y ordenar insights
  const processedInsights = useMemo(() => {
    const sorted = [...insights];

    if (groupBy === 'type') {
      // Ordenar: worse primero, luego better, luego similar
      const typeOrder = { worse: 1, better: 2, similar: 3 };
      sorted.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);
    } else {
      // Ordenar por métrica alfabéticamente
      sorted.sort((a, b) => a.metric.localeCompare(b.metric));
    }

    return sorted.slice(0, maxItems);
  }, [insights, groupBy, maxItems]);

  // Agrupar por categoría si es necesario
  const groupedInsights = useMemo(() => {
    if (groupBy !== 'type') return null;

    return {
      worse: processedInsights.filter((i) => i.type === 'worse'),
      better: processedInsights.filter((i) => i.type === 'better'),
      similar: processedInsights.filter((i) => i.type === 'similar'),
    };
  }, [processedInsights, groupBy]);

  if (insights.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <span className="text-4xl mb-2 block">📊</span>
          <p>No hay comparaciones disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {insights.length} comparaciones analizadas
        </p>
      </div>

      {/* Resumen */}
      {!compact && <InsightsSummary insights={insights} />}

      {/* Contenido agrupado o lista simple */}
      {groupedInsights ? (
        <div className="space-y-4">
          {/* Peor rendimiento */}
          {groupedInsights.worse.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-600 mb-2 flex items-center space-x-1">
                <span>📉</span>
                <span>Áreas de mejora ({groupedInsights.worse.length})</span>
              </h4>
              <div
                className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}
              >
                {groupedInsights.worse.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    compact={compact}
                    onClick={onInsightClick ? () => onInsightClick(insight) : undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Mejor rendimiento */}
          {groupedInsights.better.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-green-600 mb-2 flex items-center space-x-1">
                <span>📈</span>
                <span>Puntos fuertes ({groupedInsights.better.length})</span>
              </h4>
              <div
                className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}
              >
                {groupedInsights.better.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    compact={compact}
                    onClick={onInsightClick ? () => onInsightClick(insight) : undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Similar */}
          {groupedInsights.similar.length > 0 && !compact && (
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center space-x-1">
                <span>➡️</span>
                <span>Sin cambios significativos ({groupedInsights.similar.length})</span>
              </h4>
              <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                {groupedInsights.similar.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    compact={true}
                    onClick={onInsightClick ? () => onInsightClick(insight) : undefined}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {processedInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              compact={compact}
              onClick={onInsightClick ? () => onInsightClick(insight) : undefined}
            />
          ))}
        </div>
      )}

      {/* Ver más */}
      {insights.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Ver todas las comparaciones ({insights.length})
          </button>
        </div>
      )}
    </div>
  );
}

export default ComparisonInsights;
