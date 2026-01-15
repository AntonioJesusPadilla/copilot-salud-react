import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import FinancialKPICard from './FinancialKPICard';
import { FinancialKPI, FinancialStats, HOSPITAL_CONFIGS } from '../../types/financial';
import { TrendResult, TREND_CONFIGS } from '../../types/analysis';

// ============================================================================
// TIPOS
// ============================================================================

export interface FinancialExecutiveDashboardProps {
  kpis: FinancialKPI[];
  stats: FinancialStats | null;
  trends?: Record<string, TrendResult>;
  selectedHospital?: string | null;
  onHospitalSelect?: (hospital: string | null) => void;
  loading?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(2)}M €`;
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}K €`;
  return `${value.toLocaleString('es-ES')} €`;
}

function getHospitalColor(hospital: string): string {
  const config = HOSPITAL_CONFIGS[hospital as keyof typeof HOSPITAL_CONFIGS];
  return config?.color || '#6B7280';
}

// ============================================================================
// COMPONENTE DE RESUMEN EJECUTIVO
// ============================================================================

interface ExecutiveSummaryProps {
  stats: FinancialStats;
  trends?: Record<string, TrendResult>;
}

function ExecutiveSummary({ stats, trends }: ExecutiveSummaryProps) {
  const trendConfig = stats.tendencia?.direccion ? TREND_CONFIGS[stats.tendencia.direccion] : null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 rounded-xl p-6 text-white mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Resumen Financiero</h2>
          <p className="text-blue-100 text-sm">
            Datos consolidados de {stats.porHospital?.length || 0} hospitales
          </p>
        </div>
        {trendConfig && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-full">
            <span className="text-xl">{trendConfig.icon}</span>
            <span className="text-sm font-semibold">
              {stats.tendencia.porcentajeCambio > 0 ? '+' : ''}
              {stats.tendencia.porcentajeCambio.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-blue-200 text-xs uppercase tracking-wide">Presupuesto Total</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalPresupuesto)}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-blue-200 text-xs uppercase tracking-wide">Ingresos</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalIngresos)}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-blue-200 text-xs uppercase tracking-wide">Gastos</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalGastos)}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-blue-200 text-xs uppercase tracking-wide">Margen Neto</p>
          <p
            className={`text-2xl font-bold mt-1 ${stats.margenNetoTotal >= 0 ? 'text-green-300' : 'text-red-300'}`}
          >
            {formatCurrency(stats.margenNetoTotal)}
          </p>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-blue-200 text-xs uppercase tracking-wide">ROI Promedio</p>
          <p
            className={`text-2xl font-bold mt-1 ${stats.roiPromedio >= 5 ? 'text-green-300' : 'text-yellow-300'}`}
          >
            {stats.roiPromedio.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Tendencias rápidas */}
      {trends && Object.keys(trends).length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-xs text-blue-200 mb-2">Tendencias clave:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(trends)
              .slice(0, 4)
              .map(([key, trend]) => (
                <span key={key} className="px-3 py-1 bg-white/10 rounded-full text-xs">
                  {key}: {trend.changePercent > 0 ? '+' : ''}
                  {trend.changePercent.toFixed(1)}%
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE DE EVOLUCIÓN MENSUAL
// ============================================================================

interface MonthlyEvolutionChartProps {
  kpis: FinancialKPI[];
  selectedHospital?: string | null;
  height?: number;
}

function MonthlyEvolutionChart({
  kpis,
  selectedHospital,
  height = 300,
}: MonthlyEvolutionChartProps) {
  const chartData = useMemo(() => {
    // Agrupar por mes
    const monthMap = new Map<
      string,
      { mes: string; ingresos: number; gastos: number; margen: number }
    >();

    const filteredKpis = selectedHospital
      ? kpis.filter((k) => k.hospital === selectedHospital)
      : kpis;

    filteredKpis.forEach((kpi) => {
      if (!monthMap.has(kpi.mes)) {
        monthMap.set(kpi.mes, {
          mes: kpi.mes,
          ingresos: 0,
          gastos: 0,
          margen: 0,
        });
      }

      const monthData = monthMap.get(kpi.mes)!;
      monthData.ingresos += kpi.ingresosTotales;
      monthData.gastos += kpi.gastosTotales;
      monthData.margen += kpi.margenNeto;
    });

    return Array.from(monthMap.values())
      .sort((a, b) => a.mes.localeCompare(b.mes))
      .map((m) => ({
        ...m,
        mesLabel: new Date(m.mes + '-01').toLocaleDateString('es-ES', {
          month: 'short',
          year: '2-digit',
        }),
      }));
  }, [kpis, selectedHospital]);

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
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between space-x-4">
            <span className="text-xs" style={{ color: entry.color }}>
              {entry.name}:
            </span>
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Evolución Mensual</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="mesLabel" tick={{ fontSize: 12, fill: '#6B7280' }} />
          <YAxis
            tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="ingresos"
            name="Ingresos"
            stroke="#10B981"
            fill="url(#colorIngresos)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="gastos"
            name="Gastos"
            stroke="#EF4444"
            fill="url(#colorGastos)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================================
// COMPONENTE DE COMPARACIÓN POR HOSPITAL
// ============================================================================

interface HospitalComparisonProps {
  stats: FinancialStats;
  onHospitalSelect?: (hospital: string | null) => void;
  selectedHospital?: string | null;
}

function HospitalComparison({
  stats,
  onHospitalSelect,
  selectedHospital,
}: HospitalComparisonProps) {
  if (!stats.porHospital || stats.porHospital.length === 0) return null;

  // Calcular el máximo para las barras
  const maxPresupuesto = Math.max(...stats.porHospital.map((h) => h.presupuesto));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
        Comparación por Hospital
      </h3>
      <div className="space-y-4">
        {stats.porHospital.map((hospital) => {
          const config = HOSPITAL_CONFIGS[hospital.hospital as keyof typeof HOSPITAL_CONFIGS];
          const isSelected = selectedHospital === hospital.hospital;

          return (
            <div
              key={hospital.hospital}
              onClick={() => onHospitalSelect?.(isSelected ? null : hospital.hospital)}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700'
                  : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{config?.icon || '🏥'}</span>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {config?.nombreCorto || hospital.hospital}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ROI: {hospital.roi.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: getHospitalColor(hospital.hospital) }}>
                    {formatCurrency(hospital.presupuesto)}
                  </p>
                  <p
                    className={`text-xs ${hospital.margen >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    Margen: {formatCurrency(hospital.margen)}
                  </p>
                </div>
              </div>

              {/* Barra de presupuesto */}
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(hospital.presupuesto / maxPresupuesto) * 100}%`,
                    backgroundColor: getHospitalColor(hospital.hospital),
                  }}
                />
              </div>

              {/* Métricas rápidas */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ingresos</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {formatCurrency(hospital.ingresos)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Gastos</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {formatCurrency(hospital.gastos)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Margen</p>
                  <p
                    className={`text-sm font-semibold ${hospital.margen >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {formatCurrency(hospital.margen)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

function FinancialExecutiveDashboard({
  kpis,
  stats,
  trends,
  selectedHospital,
  onHospitalSelect,
  loading = false,
}: FinancialExecutiveDashboardProps) {
  // Calcular KPIs agregados para las cards
  const aggregatedKPIs = useMemo(() => {
    const filteredKpis = selectedHospital
      ? kpis.filter((k) => k.hospital === selectedHospital)
      : kpis;

    if (filteredKpis.length === 0) return null;

    // Obtener el último mes de datos
    const latestMonth = filteredKpis.reduce((max, k) => (k.mes > max ? k.mes : max), '');
    const latestKpis = filteredKpis.filter((k) => k.mes === latestMonth);

    // Agregar valores
    const totals = latestKpis.reduce(
      (acc, k) => ({
        ingresos: acc.ingresos + k.ingresosTotales,
        gastos: acc.gastos + k.gastosTotales,
        margen: acc.margen + k.margenNeto,
        ebitda: acc.ebitda + k.ebitda,
        flujoCaja: acc.flujoCaja + k.flujoCaja,
        roi: acc.roi + k.roi,
        liquidez: acc.liquidez + k.ratioLiquidez,
        count: acc.count + 1,
      }),
      { ingresos: 0, gastos: 0, margen: 0, ebitda: 0, flujoCaja: 0, roi: 0, liquidez: 0, count: 0 }
    );

    return {
      ingresos: totals.ingresos,
      gastos: totals.gastos,
      margen: totals.margen,
      ebitda: totals.ebitda,
      flujoCaja: totals.flujoCaja,
      roiPromedio: totals.roi / totals.count,
      liquidezPromedio: totals.liquidez / totals.count,
    };
  }, [kpis, selectedHospital]);

  // Sparkline data para cada KPI
  const sparklineData = useMemo(() => {
    const filteredKpis = selectedHospital
      ? kpis.filter((k) => k.hospital === selectedHospital)
      : kpis;

    // Agrupar por mes y calcular totales
    const monthlyData = new Map<
      string,
      { ingresos: number; gastos: number; roi: number; count: number }
    >();

    filteredKpis.forEach((k) => {
      const existing = monthlyData.get(k.mes) || { ingresos: 0, gastos: 0, roi: 0, count: 0 };
      monthlyData.set(k.mes, {
        ingresos: existing.ingresos + k.ingresosTotales,
        gastos: existing.gastos + k.gastosTotales,
        roi: existing.roi + k.roi,
        count: existing.count + 1,
      });
    });

    const sorted = Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);

    return {
      ingresos: sorted.map(([, v]) => v.ingresos),
      gastos: sorted.map(([, v]) => v.gastos),
      roi: sorted.map(([, v]) => v.roi / v.count),
    };
  }, [kpis, selectedHospital]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen Ejecutivo */}
      {stats && <ExecutiveSummary stats={stats} trends={trends} />}

      {/* Grid de KPIs principales */}
      {aggregatedKPIs && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FinancialKPICard
            title="Ingresos Totales"
            value={aggregatedKPIs.ingresos}
            format="currency"
            trend={trends?.ingresosTotales?.direction}
            changePercent={trends?.ingresosTotales?.changePercent}
            sparklineData={sparklineData.ingresos}
            color="#10B981"
            icon="💵"
          />
          <FinancialKPICard
            title="Gastos Totales"
            value={aggregatedKPIs.gastos}
            format="currency"
            trend={trends?.gastosTotales?.direction}
            changePercent={trends?.gastosTotales?.changePercent}
            sparklineData={sparklineData.gastos}
            color="#EF4444"
            icon="💸"
          />
          <FinancialKPICard
            title="Margen Neto"
            value={aggregatedKPIs.margen}
            format="currency"
            trend={trends?.margenNeto?.direction}
            changePercent={trends?.margenNeto?.changePercent}
            color={aggregatedKPIs.margen >= 0 ? '#10B981' : '#EF4444'}
            icon="📈"
          />
          <FinancialKPICard
            title="ROI Promedio"
            value={aggregatedKPIs.roiPromedio}
            format="percentage"
            trend={trends?.roi?.direction}
            changePercent={trends?.roi?.changePercent}
            sparklineData={sparklineData.roi}
            color="#8B5CF6"
            icon="🎯"
          />
        </div>
      )}

      {/* Segunda fila de KPIs */}
      {aggregatedKPIs && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FinancialKPICard
            title="EBITDA"
            value={aggregatedKPIs.ebitda}
            format="currency"
            color="#3B82F6"
            icon="📊"
            compact
          />
          <FinancialKPICard
            title="Flujo de Caja"
            value={aggregatedKPIs.flujoCaja}
            format="currency"
            color={aggregatedKPIs.flujoCaja >= 0 ? '#10B981' : '#EF4444'}
            icon="💰"
            compact
          />
          <FinancialKPICard
            title="Ratio Liquidez"
            value={aggregatedKPIs.liquidezPromedio}
            format="decimal"
            color={aggregatedKPIs.liquidezPromedio >= 1 ? '#10B981' : '#F59E0B'}
            icon="💧"
            compact
          />
        </div>
      )}

      {/* Gráficos y comparación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyEvolutionChart kpis={kpis} selectedHospital={selectedHospital} />
        {stats && (
          <HospitalComparison
            stats={stats}
            onHospitalSelect={onHospitalSelect}
            selectedHospital={selectedHospital}
          />
        )}
      </div>
    </div>
  );
}

export default FinancialExecutiveDashboard;
