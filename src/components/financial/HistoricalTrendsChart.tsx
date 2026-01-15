import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { HistoricalTrend, HOSPITAL_CONFIGS } from '../../types/financial';
import { TrendResult, TREND_CONFIGS } from '../../types/analysis';
import { Prediction } from '../../services/predictionService';

// ============================================================================
// TIPOS
// ============================================================================

export interface HistoricalTrendsChartProps {
  data: HistoricalTrend[];
  metric:
    | 'presupuestoTotal'
    | 'pacientesAtendidos'
    | 'costePorPaciente'
    | 'satisfaccionMedia'
    | 'eficienciaOperativa'
    | 'margenNeto'
    | 'ingresosTotales';
  title?: string;
  height?: number;
  showPrediction?: boolean;
  prediction?: Prediction;
  trend?: TrendResult;
  groupBy?: 'hospital' | 'departamento';
}

// ============================================================================
// HELPERS
// ============================================================================

const METRIC_CONFIG: Record<
  string,
  { label: string; format: 'currency' | 'percentage' | 'number' | 'decimal'; unit?: string }
> = {
  presupuestoTotal: { label: 'Presupuesto Total', format: 'currency' },
  pacientesAtendidos: { label: 'Pacientes Atendidos', format: 'number' },
  costePorPaciente: { label: 'Coste por Paciente', format: 'currency' },
  satisfaccionMedia: { label: 'Satisfacción Media', format: 'decimal', unit: '/5' },
  eficienciaOperativa: { label: 'Eficiencia Operativa', format: 'percentage' },
  margenNeto: { label: 'Margen Neto', format: 'currency' },
  ingresosTotales: { label: 'Ingresos Totales', format: 'currency' },
};

function formatMetricValue(
  value: number,
  format: 'currency' | 'percentage' | 'number' | 'decimal'
): string {
  switch (format) {
    case 'currency':
      if (Math.abs(value) >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M €`;
      }
      return `${(value / 1000).toFixed(0)}K €`;
    case 'percentage':
      return `${(value * 100).toFixed(1)}%`;
    case 'decimal':
      return value.toFixed(2);
    default:
      return value.toLocaleString('es-ES');
  }
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

function HistoricalTrendsChart({
  data,
  metric,
  title,
  height = 350,
  showPrediction = false,
  prediction,
  trend,
  groupBy = 'hospital',
}: HistoricalTrendsChartProps) {
  const metricConfig = METRIC_CONFIG[metric];

  // Procesar datos agrupados
  const chartData = useMemo(() => {
    // Agrupar datos por año
    const yearMap = new Map<number, Record<string, number>>();
    const entities = new Set<string>();

    data.forEach((item) => {
      const entity = groupBy === 'hospital' ? item.hospital : item.departamento;
      entities.add(entity);

      if (!yearMap.has(item.año)) {
        yearMap.set(item.año, { año: item.año });
      }

      const yearData = yearMap.get(item.año)!;
      yearData[entity] = (yearData[entity] || 0) + item[metric];
    });

    // Si hay predicción, añadir puntos futuros
    const processedData = Array.from(yearMap.values()).sort((a, b) => a.año - b.año);

    if (showPrediction && prediction && prediction.values.length > 0) {
      const lastYear = processedData[processedData.length - 1]?.año || 2025;
      prediction.values.forEach((val, idx) => {
        const futureYear = lastYear + idx + 1;
        processedData.push({
          año: futureYear,
          Predicción: val,
        } as unknown as Record<string, number>);
      });
    }

    return { data: processedData, entities: Array.from(entities) };
  }, [data, metric, groupBy, showPrediction, prediction]);

  // Obtener colores para cada entidad
  const getEntityColor = (entity: string): string => {
    if (entity === 'Predicción') return '#9CA3AF';
    const hospitalConfig = HOSPITAL_CONFIGS[entity as keyof typeof HOSPITAL_CONFIGS];
    return hospitalConfig?.color || '#6B7280';
  };

  // Tooltip personalizado
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; color: string }>;
    label?: string;
  }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Año {label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between space-x-4">
            <span className="text-xs" style={{ color: entry.color }}>
              {entry.name}:
            </span>
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
              {formatMetricValue(entry.value, metricConfig.format)}
              {metricConfig.unit || ''}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {title || metricConfig.label}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Evolución histórica por {groupBy === 'hospital' ? 'hospital' : 'departamento'}
          </p>
        </div>

        {/* Indicador de tendencia */}
        {trend && (
          <div
            className="flex items-center space-x-2 px-3 py-1 rounded-full"
            style={{ backgroundColor: `${TREND_CONFIGS[trend.direction].color}20` }}
          >
            <span>{TREND_CONFIGS[trend.direction].icon}</span>
            <span
              className="text-sm font-semibold"
              style={{ color: TREND_CONFIGS[trend.direction].color }}
            >
              {trend.changePercent > 0 ? '+' : ''}
              {trend.changePercent.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:opacity-30" />
          <XAxis dataKey="año" tick={{ fontSize: 12, fill: '#6B7280' }} stroke="#9CA3AF" />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            stroke="#9CA3AF"
            tickFormatter={(value) => formatMetricValue(value, metricConfig.format)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 20 }}
            formatter={(value) => (
              <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
            )}
          />

          {/* Línea de referencia si hay predicción */}
          {showPrediction && prediction && (
            <ReferenceLine
              x={chartData.data[chartData.data.length - prediction.values.length - 1]?.año}
              stroke="#9CA3AF"
              strokeDasharray="5 5"
              label={{ value: 'Predicción', position: 'top', fill: '#9CA3AF', fontSize: 10 }}
            />
          )}

          {/* Líneas para cada entidad */}
          {chartData.entities.map((entity) => (
            <Line
              key={entity}
              type="monotone"
              dataKey={entity}
              stroke={getEntityColor(entity)}
              strokeWidth={2}
              dot={{ fill: getEntityColor(entity), r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          ))}

          {/* Línea de predicción si existe */}
          {showPrediction && prediction && (
            <Line
              type="monotone"
              dataKey="Predicción"
              stroke="#9CA3AF"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#9CA3AF', r: 4 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Footer con confianza de predicción */}
      {showPrediction && prediction && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Predicción basada en regresión lineal
            </span>
            <span className="text-gray-700 dark:text-gray-300">
              Confianza:{' '}
              <strong className={prediction.confidence > 70 ? 'text-green-600' : 'text-yellow-600'}>
                {prediction.confidence}%
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoricalTrendsChart;
