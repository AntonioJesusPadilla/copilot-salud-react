import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from 'recharts';
import { HOSPITAL_CONFIGS, DepartmentBudget, FinancialKPI } from '../../types/financial';

// ============================================================================
// TIPOS
// ============================================================================

export type ChartType = 'bar' | 'radar' | 'horizontal';

export interface BenchmarkingChartProps {
  data: DepartmentBudget[] | FinancialKPI[];
  metrics: string[];
  title?: string;
  height?: number;
  chartType?: ChartType;
  showBenchmark?: boolean;
  benchmarkValues?: Record<string, number>;
  normalizeData?: boolean;
}

interface ProcessedData {
  hospital: string;
  color: string;
  [key: string]: string | number;
}

// ============================================================================
// HELPERS
// ============================================================================

const METRIC_LABELS: Record<string, string> = {
  // De DepartmentBudget
  presupuestoAnualEuros: 'Presupuesto Anual',
  costePersonal: 'Coste Personal',
  costePorPaciente: 'Coste/Paciente',
  margenOperativo: 'Margen Operativo',
  eficienciaCoste: 'Eficiencia',
  satisfaccionPaciente: 'Satisfacción',
  tasaOcupacion: 'Ocupación',
  // De FinancialKPI
  ingresosTotales: 'Ingresos',
  gastosTotales: 'Gastos',
  margenNeto: 'Margen Neto',
  roi: 'ROI',
  ebitda: 'EBITDA',
  ratioLiquidez: 'Liquidez',
  tasaRetencion: 'Retención',
};

function getMetricLabel(metric: string): string {
  return METRIC_LABELS[metric] || metric;
}

function formatValue(value: number, metric: string): string {
  if (['roi', 'tasaRetencion', 'tasaOcupacion', 'eficienciaCoste'].includes(metric)) {
    return `${value.toFixed(1)}%`;
  }
  if (['satisfaccionPaciente'].includes(metric)) {
    return value.toFixed(2);
  }
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M €`;
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(0)}K €`;
  }
  return value.toLocaleString('es-ES');
}

function normalizeValue(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return ((value - min) / (max - min)) * 100;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

function BenchmarkingChart({
  data,
  metrics,
  title = 'Comparación entre Hospitales',
  height = 400,
  chartType = 'bar',
  showBenchmark = false,
  benchmarkValues,
  normalizeData = false,
}: BenchmarkingChartProps) {
  // Procesar datos por hospital
  const processedData = useMemo(() => {
    const hospitalMap = new Map<string, ProcessedData>();

    // Agrupar y agregar datos por hospital
    data.forEach((item) => {
      const hospital = item.hospital;
      const config = HOSPITAL_CONFIGS[hospital as keyof typeof HOSPITAL_CONFIGS];

      if (!hospitalMap.has(hospital)) {
        hospitalMap.set(hospital, {
          hospital: config?.nombreCorto || hospital,
          fullName: hospital,
          color: config?.color || '#6B7280',
        } as ProcessedData);
      }

      const hospitalData = hospitalMap.get(hospital)!;

      // Sumar o promediar métricas según el tipo
      metrics.forEach((metric) => {
        const value = (item as unknown as Record<string, unknown>)[metric] as number | undefined;
        if (value !== undefined) {
          if (hospitalData[metric] === undefined) {
            hospitalData[metric] = value;
            hospitalData[`${metric}_count`] = 1;
          } else {
            hospitalData[metric] = (hospitalData[metric] as number) + value;
            hospitalData[`${metric}_count`] = (hospitalData[`${metric}_count`] as number) + 1;
          }
        }
      });
    });

    // Calcular promedios y normalizar si es necesario
    let result = Array.from(hospitalMap.values()).map((h) => {
      metrics.forEach((metric) => {
        const count = h[`${metric}_count`] as number;
        if (count > 1) {
          h[metric] = (h[metric] as number) / count;
        }
        delete h[`${metric}_count`];
      });
      return h;
    });

    // Normalizar datos si se requiere (para radar chart)
    if (normalizeData && result.length > 0) {
      metrics.forEach((metric) => {
        const values = result.map((h) => h[metric] as number).filter((v) => v !== undefined);
        const min = Math.min(...values);
        const max = Math.max(...values);
        result = result.map((h) => ({
          ...h,
          [metric]: normalizeValue(h[metric] as number, min, max),
        }));
      });
    }

    return result;
  }, [data, metrics, normalizeData]);

  // Datos para radar chart
  const radarData = useMemo(() => {
    if (chartType !== 'radar') return [];

    return metrics.map((metric) => {
      const dataPoint: Record<string, string | number> = {
        metric: getMetricLabel(metric),
        fullMetric: metric,
      };
      processedData.forEach((hospital) => {
        dataPoint[hospital.hospital] = (hospital[metric] as number) || 0;
      });
      return dataPoint;
    });
  }, [chartType, metrics, processedData]);

  // Tooltip personalizado
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      name: string;
      color?: string;
      dataKey?: string;
      payload?: ProcessedData;
    }>;
    label?: string;
  }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {chartType === 'radar' ? label : payload[0]?.payload?.fullName || label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between space-x-4">
            <span className="text-xs" style={{ color: entry.color }}>
              {chartType === 'radar' ? entry.name : getMetricLabel(entry.dataKey || '')}:
            </span>
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
              {normalizeData
                ? `${entry.value.toFixed(0)}%`
                : formatValue(entry.value, entry.dataKey || '')}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Renderizar según tipo de gráfico
  const renderChart = () => {
    switch (chartType) {
      case 'radar':
        return (
          <RadarChart data={radarData}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#6B7280' }} />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
            />
            {processedData.map((hospital) => (
              <Radar
                key={hospital.hospital}
                name={hospital.hospital}
                dataKey={hospital.hospital}
                stroke={hospital.color}
                fill={hospital.color}
                fillOpacity={0.2}
              />
            ))}
            <Legend
              formatter={(value) => (
                <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
              )}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        );

      case 'horizontal':
        return (
          <BarChart data={processedData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} />
            <YAxis
              type="category"
              dataKey="hospital"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {getMetricLabel(value)}
                </span>
              )}
            />
            {metrics.map((metric, index) => (
              <Bar
                key={metric}
                dataKey={metric}
                name={getMetricLabel(metric)}
                fill={`hsl(${index * 60}, 70%, 50%)`}
              />
            ))}
          </BarChart>
        );

      default: // 'bar'
        return (
          <BarChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="hospital" tick={{ fontSize: 12, fill: '#6B7280' }} />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickFormatter={(value) => formatValue(value, metrics[0])}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {getMetricLabel(value)}
                </span>
              )}
            />
            {metrics.map((metric) => (
              <Bar key={metric} dataKey={metric} name={getMetricLabel(metric)}>
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            ))}
            {showBenchmark &&
              benchmarkValues &&
              metrics.map(
                (metric) =>
                  benchmarkValues[metric] && (
                    <Bar
                      key={`benchmark-${metric}`}
                      dataKey={() => benchmarkValues[metric]}
                      name={`Benchmark ${getMetricLabel(metric)}`}
                      fill="#9CA3AF"
                      fillOpacity={0.3}
                    />
                  )
              )}
          </BarChart>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Comparativa de {metrics.length} métrica{metrics.length > 1 ? 's' : ''} entre hospitales
        </p>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>

      {/* Leyenda de hospitales */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 justify-center">
          {processedData.map((hospital) => (
            <div key={hospital.hospital} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hospital.color }} />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {hospital.fullName as string}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BenchmarkingChart;
