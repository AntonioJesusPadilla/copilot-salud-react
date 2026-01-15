import { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendResult, TREND_CONFIGS, TrendDirection } from '../../types/analysis';

// ============================================================================
// TIPOS
// ============================================================================

export interface TrendAnalysisWidgetProps {
  trends: Record<string, TrendResult>;
  title?: string;
  compact?: boolean;
  showSparklines?: boolean;
  onTrendClick?: (metric: string, trend: TrendResult) => void;
}

interface TrendItemProps {
  metric: string;
  trend: TrendResult;
  compact?: boolean;
  showSparkline?: boolean;
  onClick?: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

const METRIC_LABELS: Record<string, { label: string; icon: string }> = {
  financial: { label: 'Financiero', icon: '💰' },
  efficiency: { label: 'Eficiencia', icon: '📊' },
  capacity: { label: 'Capacidad', icon: '🏥' },
  satisfaction: { label: 'Satisfacción', icon: '⭐' },
  ingresosTotales: { label: 'Ingresos', icon: '💵' },
  gastosTotales: { label: 'Gastos', icon: '💸' },
  margenNeto: { label: 'Margen Neto', icon: '📈' },
  roi: { label: 'ROI', icon: '🎯' },
  ocupacion: { label: 'Ocupación', icon: '🛏️' },
  pacientes: { label: 'Pacientes', icon: '👥' },
};

function getMetricConfig(metric: string): { label: string; icon: string } {
  return METRIC_LABELS[metric] || { label: metric, icon: '📌' };
}

function generateMockSparklineData(trend: TrendResult): number[] {
  const points = trend.dataPoints || 6;
  const data: number[] = [];
  const step = (trend.endValue - trend.startValue) / (points - 1);

  for (let i = 0; i < points; i++) {
    const noise = (Math.random() - 0.5) * Math.abs(step) * 0.3;
    data.push(trend.startValue + step * i + noise);
  }

  return data;
}

// ============================================================================
// COMPONENTE DE ITEM DE TENDENCIA
// ============================================================================

function TrendItem({
  metric,
  trend,
  compact = false,
  showSparkline = true,
  onClick,
}: TrendItemProps) {
  const metricConfig = getMetricConfig(metric);
  const trendConfig = TREND_CONFIGS[trend.direction];

  const sparklineData = useMemo(() => {
    if (!showSparkline) return [];
    return generateMockSparklineData(trend).map((value, index) => ({ value, index }));
  }, [trend, showSparkline]);

  const formatValue = (value: number): string => {
    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(1);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${
        compact ? 'p-3' : 'p-4'
      } ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        {/* Info de la métrica */}
        <div className="flex items-center space-x-3">
          <span className={compact ? 'text-lg' : 'text-2xl'}>{metricConfig.icon}</span>
          <div>
            <h4
              className={`font-semibold text-gray-800 dark:text-gray-100 ${compact ? 'text-sm' : 'text-base'}`}
            >
              {metricConfig.label}
            </h4>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatValue(trend.startValue)} → {formatValue(trend.endValue)}
              </span>
            </div>
          </div>
        </div>

        {/* Indicador de tendencia */}
        <div className="flex items-center space-x-3">
          {/* Sparkline */}
          {showSparkline && sparklineData.length > 0 && (
            <div className={compact ? 'w-12 h-6' : 'w-16 h-8'}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={trendConfig.color}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Badge de tendencia */}
          <div
            className="flex items-center space-x-1 px-2 py-1 rounded-full"
            style={{ backgroundColor: `${trendConfig.color}20` }}
          >
            <span className="text-sm">{trendConfig.icon}</span>
            <span
              className={`font-semibold ${compact ? 'text-xs' : 'text-sm'}`}
              style={{ color: trendConfig.color }}
            >
              {trend.changePercent > 0 ? '+' : ''}
              {trend.changePercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Barra de confianza (solo si no es compact) */}
      {!compact && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Confianza del análisis</span>
            <span>{trend.confidence}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${trend.confidence}%`,
                backgroundColor:
                  trend.confidence > 70 ? '#10B981' : trend.confidence > 40 ? '#F59E0B' : '#EF4444',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE RESUMEN DE TENDENCIAS
// ============================================================================

interface TrendSummaryProps {
  trends: Record<string, TrendResult>;
}

function TrendSummary({ trends }: TrendSummaryProps) {
  const summary = useMemo(() => {
    const values = Object.values(trends);
    const up = values.filter((t) => t.direction === 'up').length;
    const down = values.filter((t) => t.direction === 'down').length;
    const stable = values.filter((t) => t.direction === 'stable').length;
    const avgConfidence = values.reduce((sum, t) => sum + t.confidence, 0) / values.length || 0;

    // Determinar tendencia general
    let overall: TrendDirection = 'stable';
    if (up > down + stable) overall = 'up';
    if (down > up + stable) overall = 'down';

    return { up, down, stable, avgConfidence, overall };
  }, [trends]);

  const overallConfig = TREND_CONFIGS[summary.overall];

  return (
    <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
      <div className="text-center">
        <p className="text-2xl font-bold text-green-600">{summary.up}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Subiendo</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-red-600">{summary.down}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Bajando</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-600">{summary.stable}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Estable</p>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center space-x-1">
          <span className="text-lg">{overallConfig.icon}</span>
          <span className="text-2xl font-bold" style={{ color: overallConfig.color }}>
            {summary.avgConfidence.toFixed(0)}%
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Confianza</p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

function TrendAnalysisWidget({
  trends,
  title = 'Análisis de Tendencias',
  compact = false,
  showSparklines = true,
  onTrendClick,
}: TrendAnalysisWidgetProps) {
  const trendEntries = useMemo(() => {
    return Object.entries(trends).sort(([, a], [, b]) => {
      // Ordenar por cambio absoluto descendente
      return Math.abs(b.changePercent) - Math.abs(a.changePercent);
    });
  }, [trends]);

  if (trendEntries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No hay datos de tendencias disponibles</p>
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
          {trendEntries.length} métricas analizadas
        </p>
      </div>

      {/* Resumen */}
      {!compact && <TrendSummary trends={trends} />}

      {/* Lista de tendencias */}
      <div className={`space-y-3 ${compact ? '' : 'max-h-[400px] overflow-y-auto'}`}>
        {trendEntries.map(([metric, trend]) => (
          <TrendItem
            key={metric}
            metric={metric}
            trend={trend}
            compact={compact}
            showSparkline={showSparklines}
            onClick={onTrendClick ? () => onTrendClick(metric, trend) : undefined}
          />
        ))}
      </div>

      {/* Tooltip de información */}
      {!compact && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 Las tendencias se calculan usando regresión lineal sobre los últimos 6 meses de datos
          </p>
        </div>
      )}
    </div>
  );
}

export default TrendAnalysisWidget;
export { TrendItem };
