import { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendDirection, TREND_CONFIGS } from '../../types/analysis';

// ============================================================================
// TIPOS
// ============================================================================

export interface FinancialKPICardProps {
  title: string;
  value: number;
  format?: 'currency' | 'percentage' | 'number' | 'decimal';
  trend?: TrendDirection;
  changePercent?: number;
  sparklineData?: number[];
  color?: string;
  icon?: string;
  subtitle?: string;
  target?: number;
  onClick?: () => void;
  compact?: boolean;
  loading?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatValue(value: number, format: FinancialKPICardProps['format']): string {
  switch (format) {
    case 'currency':
      if (Math.abs(value) >= 1000000) {
        return `${(value / 1000000).toFixed(2)}M €`;
      }
      if (Math.abs(value) >= 1000) {
        return `${(value / 1000).toFixed(1)}K €`;
      }
      return `${value.toLocaleString('es-ES')} €`;
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'decimal':
      return value.toFixed(2);
    case 'number':
    default:
      return value.toLocaleString('es-ES');
  }
}

function getProgressToTarget(value: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, Math.max(0, (value / target) * 100));
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

function FinancialKPICard({
  title,
  value,
  format = 'number',
  trend,
  changePercent,
  sparklineData,
  color = '#3B82F6',
  icon,
  subtitle,
  target,
  onClick,
  compact = false,
  loading = false,
}: FinancialKPICardProps) {
  // Preparar datos del sparkline
  const chartData = useMemo(() => {
    if (!sparklineData || sparklineData.length === 0) return null;
    return sparklineData.map((val, idx) => ({ value: val, index: idx }));
  }, [sparklineData]);

  // Configuración de tendencia
  const trendConfig = trend ? TREND_CONFIGS[trend] : null;

  // Progreso hacia objetivo
  const progress = target ? getProgressToTarget(value, target) : null;

  if (loading) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 ${
          compact ? 'p-4' : 'p-6'
        } animate-pulse`}
      >
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all border-l-4 border border-gray-200 dark:border-gray-700 ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      } ${compact ? 'p-4' : 'p-6'}`}
      style={{ borderLeftColor: color }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <div>
            <h3
              className={`font-bold text-gray-800 dark:text-gray-100 ${
                compact ? 'text-sm' : 'text-base'
              }`}
              title={title}
            >
              {title}
            </h3>
            {subtitle && !compact && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Sparkline mini */}
        {chartData && chartData.length > 1 && (
          <div className="w-20 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Valor principal */}
      <div className="mb-3">
        <div className="flex items-baseline space-x-2">
          <span className={`font-bold ${compact ? 'text-2xl' : 'text-3xl'}`} style={{ color }}>
            {formatValue(value, format)}
          </span>
        </div>

        {/* Tendencia y cambio */}
        {trendConfig && changePercent !== undefined && (
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-lg">{trendConfig.icon}</span>
            <span className="text-sm font-semibold" style={{ color: trendConfig.color }}>
              {changePercent > 0 ? '+' : ''}
              {changePercent.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {trendConfig.labelShort}
            </span>
          </div>
        )}
      </div>

      {/* Sparkline completo (solo si no está en compact y hay datos) */}
      {!compact && chartData && chartData.length > 1 && (
        <div className="h-16 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(val) => [formatValue(val as number, format), 'Valor']}
                labelFormatter={() => ''}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Barra de progreso hacia objetivo */}
      {target !== undefined && progress !== null && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Objetivo: {formatValue(target, format)}</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: progress >= 100 ? '#10B981' : color,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialKPICard;
