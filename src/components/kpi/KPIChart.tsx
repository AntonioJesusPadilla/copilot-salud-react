import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { KPI } from '../../types/kpi';

interface KPIChartProps {
  kpi: KPI;
  chartType?: 'line' | 'area';
  height?: number;
  showLegend?: boolean;
}

function KPIChart({ kpi, chartType = 'area', height = 300, showLegend = false }: KPIChartProps) {
  // Preparar datos para Recharts
  const chartData = kpi.historicalData.map((point) => ({
    date: new Date(point.date).toLocaleDateString('es-ES', {
      month: 'short',
      year: '2-digit',
    }),
    value: point.value,
    label: point.label || point.date,
  }));

  // Color del KPI
  const color = kpi.color || '#3B82F6';

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-700">{data.payload.label}</p>
          <p className="text-lg font-bold" style={{ color }}>
            {data.value.toLocaleString('es-ES')} {kpi.unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Header del gráfico */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-1">
          {kpi.icon && <span className="text-xl">{kpi.icon}</span>}
          <h4 className="font-bold text-gray-800">{kpi.name}</h4>
        </div>
        <p className="text-sm text-gray-600">{kpi.description}</p>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={height}>
        {chartType === 'area' ? (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              stroke="#9CA3AF"
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              stroke="#9CA3AF"
              tickFormatter={(value) => value.toLocaleString('es-ES')}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${kpi.id})`}
              name={kpi.name}
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              stroke="#9CA3AF"
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              stroke="#9CA3AF"
              tickFormatter={(value) => value.toLocaleString('es-ES')}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
              name={kpi.name}
            />
          </LineChart>
        )}
      </ResponsiveContainer>

      {/* Footer con información */}
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <span>Fuente: {kpi.source}</span>
        <span>Actualizado: {new Date(kpi.lastUpdated).toLocaleDateString('es-ES')}</span>
      </div>
    </div>
  );
}

export default KPIChart;
