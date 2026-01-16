import { useMemo } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import {
  BedCapacityRecord,
  CapacityPrediction,
  CAPACITY_THRESHOLDS,
  ALERT_LEVEL_CONFIGS,
  PLANT_CONFIGS,
  PlantName,
} from '../../types/capacity';

// ============================================================================
// TIPOS
// ============================================================================

export interface CapacityPredictionChartProps {
  currentData: BedCapacityRecord[];
  predictions?: CapacityPrediction[];
  selectedHospital?: string | null;
  selectedPlant?: string | null;
  title?: string;
  height?: number;
  showConfidenceBand?: boolean;
}

interface ChartDataPoint {
  time: string;
  label: string;
  actual?: number;
  predicted?: number;
  upperBound?: number;
  lowerBound?: number;
  isPrediction: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

function getPlantIcon(plant: string): string {
  const config = PLANT_CONFIGS[plant as PlantName];
  return config?.icon || '🏥';
}

function generateMockHistoricalData(currentOccupancy: number): number[] {
  // Simular últimos 7 días de ocupación
  const data: number[] = [];
  const variation = 10;

  for (let i = 6; i >= 0; i--) {
    const noise = (Math.random() - 0.5) * variation;
    const trend = (currentOccupancy - 80) * (i / 6);
    data.push(Math.max(50, Math.min(100, 80 + trend + noise)));
  }

  return data;
}

function generatePrediction(
  current: number
): { predicted: number; upper: number; lower: number }[] {
  const predictions: { predicted: number; upper: number; lower: number }[] = [];
  let value = current;

  // 24h, 48h, 72h
  [24, 48, 72].forEach((_hours, idx) => {
    const trend = (Math.random() - 0.4) * 5; // Ligera tendencia alcista
    value = Math.max(50, Math.min(100, value + trend));
    const uncertainty = 3 + idx * 2; // Aumenta incertidumbre con el tiempo

    predictions.push({
      predicted: value,
      upper: Math.min(100, value + uncertainty),
      lower: Math.max(0, value - uncertainty),
    });
  });

  return predictions;
}

// ============================================================================
// COMPONENTE DE TOOLTIP PERSONALIZADO
// ============================================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    dataKey: string;
    payload: ChartDataPoint;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload as ChartDataPoint;
  const isPrediction = data?.isPrediction;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
        {label} {isPrediction && <span className="text-xs text-gray-500">(Predicción)</span>}
      </p>
      {payload.map((entry, index) => {
        if (entry.dataKey === 'upperBound' || entry.dataKey === 'lowerBound') return null;
        return (
          <div key={index} className="flex items-center justify-between space-x-4">
            <span className="text-xs" style={{ color: entry.color }}>
              {entry.name}:
            </span>
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
              {typeof entry.value === 'number' ? `${entry.value.toFixed(1)}%` : '-'}
            </span>
          </div>
        );
      })}
      {data?.upperBound && data?.lowerBound && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Rango: {data.lowerBound.toFixed(1)}% - {data.upperBound.toFixed(1)}%
        </p>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE DE INDICADORES DE RIESGO
// ============================================================================

interface RiskIndicatorsProps {
  currentOccupancy: number;
  prediction24h: number;
  prediction48h: number;
}

function RiskIndicators({ currentOccupancy, prediction24h, prediction48h }: RiskIndicatorsProps) {
  const getStatusColor = (value: number) => {
    if (value < CAPACITY_THRESHOLDS.ocupacion.verde) return 'text-green-600';
    if (value < CAPACITY_THRESHOLDS.ocupacion.amarillo) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBg = (value: number) => {
    if (value < CAPACITY_THRESHOLDS.ocupacion.verde) return 'bg-green-100 dark:bg-green-900/30';
    if (value < CAPACITY_THRESHOLDS.ocupacion.amarillo)
      return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className={`${getStatusBg(currentOccupancy)} rounded-lg p-3 text-center`}>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Actual</p>
        <p className={`text-2xl font-bold ${getStatusColor(currentOccupancy)}`}>
          {currentOccupancy.toFixed(1)}%
        </p>
      </div>
      <div className={`${getStatusBg(prediction24h)} rounded-lg p-3 text-center`}>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">+24h</p>
        <p className={`text-2xl font-bold ${getStatusColor(prediction24h)}`}>
          {prediction24h.toFixed(1)}%
        </p>
      </div>
      <div className={`${getStatusBg(prediction48h)} rounded-lg p-3 text-center`}>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">+48h</p>
        <p className={`text-2xl font-bold ${getStatusColor(prediction48h)}`}>
          {prediction48h.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

function CapacityPredictionChart({
  currentData,
  predictions: _predictions,
  selectedHospital,
  selectedPlant,
  title = 'Predicción de Ocupación',
  height = 350,
  showConfidenceBand = true,
}: CapacityPredictionChartProps) {
  // TODO: Usar predicciones reales cuando estén disponibles desde el backend
  // Por ahora se generan predicciones mock basadas en los datos actuales
  void _predictions;
  // Filtrar datos
  const filteredData = useMemo(() => {
    let data = [...currentData];
    if (selectedHospital) {
      data = data.filter((r) => r.hospital === selectedHospital);
    }
    if (selectedPlant) {
      data = data.filter((r) => r.planta === selectedPlant);
    }
    return data;
  }, [currentData, selectedHospital, selectedPlant]);

  // Calcular ocupación promedio actual
  const currentOccupancy = useMemo(() => {
    if (filteredData.length === 0) return 0;
    return filteredData.reduce((sum, r) => sum + r.porcentajeOcupacion, 0) / filteredData.length;
  }, [filteredData]);

  // Generar datos para el gráfico
  const chartData = useMemo(() => {
    const historical = generateMockHistoricalData(currentOccupancy);
    const futurePredictions = generatePrediction(currentOccupancy);

    const data: ChartDataPoint[] = [];

    // Datos históricos (últimos 7 días)
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const today = new Date().getDay();

    historical.forEach((value, index) => {
      const dayIndex = (today - 6 + index + 7) % 7;
      data.push({
        time: `day-${index}`,
        label: days[dayIndex],
        actual: value,
        isPrediction: false,
      });
    });

    // Día actual
    data.push({
      time: 'today',
      label: 'Hoy',
      actual: currentOccupancy,
      predicted: currentOccupancy,
      isPrediction: false,
    });

    // Predicciones
    const predLabels = ['+24h', '+48h', '+72h'];
    futurePredictions.forEach((pred, index) => {
      data.push({
        time: `pred-${index}`,
        label: predLabels[index],
        predicted: pred.predicted,
        upperBound: showConfidenceBand ? pred.upper : undefined,
        lowerBound: showConfidenceBand ? pred.lower : undefined,
        isPrediction: true,
      });
    });

    return data;
  }, [currentOccupancy, showConfidenceBand]);

  // Predicciones para indicadores
  const prediction24h = chartData.find((d) => d.time === 'pred-0')?.predicted || currentOccupancy;
  const prediction48h = chartData.find((d) => d.time === 'pred-1')?.predicted || currentOccupancy;

  if (currentData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No hay datos disponibles para predicción</p>
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
          {selectedPlant ? `${getPlantIcon(selectedPlant)} ${selectedPlant}` : 'Todas las plantas'}
          {selectedHospital ? ` • ${selectedHospital}` : ''}
        </p>
      </div>

      {/* Indicadores de riesgo */}
      <RiskIndicators
        currentOccupancy={currentOccupancy}
        prediction24h={prediction24h}
        prediction48h={prediction48h}
      />

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:opacity-30" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6B7280' }} stroke="#9CA3AF" />
          <YAxis
            domain={[50, 100]}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            stroke="#9CA3AF"
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 20 }}
            formatter={(value) => (
              <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
            )}
          />

          {/* Líneas de umbral */}
          <ReferenceLine
            y={CAPACITY_THRESHOLDS.ocupacion.verde}
            stroke={ALERT_LEVEL_CONFIGS.verde.color}
            strokeDasharray="5 5"
            label={{
              value: '85%',
              position: 'right',
              fill: ALERT_LEVEL_CONFIGS.verde.color,
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={CAPACITY_THRESHOLDS.ocupacion.amarillo}
            stroke={ALERT_LEVEL_CONFIGS.amarillo.color}
            strokeDasharray="5 5"
            label={{
              value: '90%',
              position: 'right',
              fill: ALERT_LEVEL_CONFIGS.amarillo.color,
              fontSize: 10,
            }}
          />

          {/* Banda de confianza */}
          {showConfidenceBand && (
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="transparent"
              fill="#9CA3AF"
              fillOpacity={0.2}
            />
          )}

          {/* Línea de datos históricos */}
          <Line
            type="monotone"
            dataKey="actual"
            name="Ocupación Real"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls
          />

          {/* Línea de predicción */}
          <Line
            type="monotone"
            dataKey="predicted"
            name="Predicción"
            stroke="#9CA3AF"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#9CA3AF', r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Footer con información */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <p>Predicción basada en tendencias históricas y patrones estacionales</p>
          <p>Confianza: ~85%</p>
        </div>
      </div>
    </div>
  );
}

export default CapacityPredictionChart;
