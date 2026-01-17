import { useMemo } from 'react';
import {
  BedCapacityRecord,
  AlertLevel,
  ALERT_LEVEL_CONFIGS,
  PLANT_CONFIGS,
  PlantName,
  getAlertLevel,
} from '../../types/capacity';
import { HOSPITAL_CONFIGS } from '../../types/financial';

// ============================================================================
// TIPOS
// ============================================================================

export interface BedCapacityMonitorProps {
  data: BedCapacityRecord[];
  selectedHospital?: string | null;
  selectedPlant?: string | null;
  title?: string;
  compact?: boolean;
  onCardClick?: (record: BedCapacityRecord) => void;
  showFilters?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

function getPlantIcon(plant: string): string {
  const config = PLANT_CONFIGS[plant as PlantName];
  return config?.icon || '🏥';
}

function getHospitalColor(hospital: string): string {
  const config = HOSPITAL_CONFIGS[hospital as keyof typeof HOSPITAL_CONFIGS];
  return config?.color || '#6B7280';
}

// ============================================================================
// COMPONENTE DE BARRA DE OCUPACIÓN
// ============================================================================

interface OccupancyBarProps {
  percentage: number;
  alertLevel: AlertLevel;
  showLabel?: boolean;
}

function OccupancyBar({ percentage, alertLevel, showLabel = true }: OccupancyBarProps) {
  const config = ALERT_LEVEL_CONFIGS[alertLevel];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        {showLabel && <span className="text-xs text-gray-500 dark:text-gray-400">Ocupación</span>}
        <span className="text-sm font-bold" style={{ color: config.color }}>
          {percentage.toFixed(1)}%
        </span>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: config.color,
          }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE DE TARJETA DE CAPACIDAD
// ============================================================================

interface CapacityCardProps {
  record: BedCapacityRecord;
  compact?: boolean;
  onClick?: () => void;
}

function CapacityCard({ record, compact = false, onClick }: CapacityCardProps) {
  const alertConfig = ALERT_LEVEL_CONFIGS[record.alertaCapacidad];

  // Calcular porcentaje de ocupación real en caso de que venga incorrecto
  const ocupacionCalculada =
    record.camasTotales > 0
      ? (record.camasOcupadas / record.camasTotales) * 100
      : record.porcentajeOcupacion;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all ${
        compact ? 'p-3' : 'p-4'
      } ${onClick ? 'cursor-pointer' : ''}`}
      style={{ borderLeftWidth: '4px', borderLeftColor: alertConfig.color }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{getPlantIcon(record.planta)}</span>
          <div>
            <h4
              className={`font-semibold text-gray-800 dark:text-gray-100 ${compact ? 'text-sm' : 'text-base'}`}
            >
              {record.planta}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <span
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: getHospitalColor(record.hospital) }}
              />
              {record.hospital}
            </p>
          </div>
        </div>

        {/* Badge de estado */}
        <span
          className="px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
          style={{
            backgroundColor: `${alertConfig.color}20`,
            color: alertConfig.color,
          }}
        >
          <span>{alertConfig.icon}</span>
          <span>{alertConfig.label}</span>
        </span>
      </div>

      {/* Barra de ocupación con porcentaje calculado */}
      <OccupancyBar percentage={ocupacionCalculada} alertLevel={record.alertaCapacidad} />

      {/* Métricas - Ahora incluye Total */}
      <div className={`grid gap-2 mt-3 ${compact ? 'grid-cols-2' : 'grid-cols-5'}`}>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-100 dark:border-gray-600">
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {record.camasTotales}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-100 dark:border-gray-600">
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {record.camasOcupadas}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Ocupadas</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-100 dark:border-gray-600">
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {record.camasDisponibles}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Disponibles</p>
        </div>
        {!compact && (
          <>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-100 dark:border-gray-600">
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {record.pacientesEsperando}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">En espera</p>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-100 dark:border-gray-600">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {record.altosTramite}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Altas</p>
            </div>
          </>
        )}
      </div>

      {/* Info adicional (solo si no es compact) */}
      {!compact && record.recomendacionApertura !== 'No necesario' && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            {record.recomendacionApertura}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE DE RESUMEN
// ============================================================================

interface SummaryProps {
  data: BedCapacityRecord[];
}

function Summary({ data }: SummaryProps) {
  const stats = useMemo(() => {
    const totalCamas = data.reduce((sum, r) => sum + r.camasTotales, 0);
    const totalOcupadas = data.reduce((sum, r) => sum + r.camasOcupadas, 0);
    const totalDisponibles = data.reduce((sum, r) => sum + r.camasDisponibles, 0);
    const totalEsperando = data.reduce((sum, r) => sum + r.pacientesEsperando, 0);
    const ocupacionPromedio = totalCamas > 0 ? (totalOcupadas / totalCamas) * 100 : 0;

    const alertas = {
      verdes: data.filter((r) => r.alertaCapacidad === 'verde').length,
      amarillas: data.filter((r) => r.alertaCapacidad === 'amarillo').length,
      rojas: data.filter((r) => r.alertaCapacidad === 'rojo').length,
    };

    return {
      totalCamas,
      totalOcupadas,
      totalDisponibles,
      totalEsperando,
      ocupacionPromedio,
      alertas,
    };
  }, [data]);

  const globalAlertLevel = getAlertLevel(stats.ocupacionPromedio);
  const globalConfig = ALERT_LEVEL_CONFIGS[globalAlertLevel];

  return (
    <div className="bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 text-white mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Estado General del Sistema</h2>
        <div
          className="flex items-center space-x-2 px-3 py-1 rounded-full"
          style={{ backgroundColor: `${globalConfig.color}30` }}
        >
          <span className="text-lg">{globalConfig.icon}</span>
          <span className="font-medium">{stats.ocupacionPromedio.toFixed(1)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{stats.totalCamas}</p>
          <p className="text-xs text-slate-300">Total Camas</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{stats.totalOcupadas}</p>
          <p className="text-xs text-slate-300">Ocupadas</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{stats.totalDisponibles}</p>
          <p className="text-xs text-slate-300">Disponibles</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-orange-400">{stats.totalEsperando}</p>
          <p className="text-xs text-slate-300">En Espera</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <div className="flex justify-center space-x-2">
            <span className="text-green-400">{stats.alertas.verdes}</span>
            <span className="text-yellow-400">{stats.alertas.amarillas}</span>
            <span className="text-red-400">{stats.alertas.rojas}</span>
          </div>
          <p className="text-xs text-slate-300">Alertas</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

function BedCapacityMonitor({
  data,
  selectedHospital,
  selectedPlant,
  title = 'Monitor de Capacidad Hospitalaria',
  compact = false,
  onCardClick,
}: BedCapacityMonitorProps) {
  // Filtrar datos
  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (selectedHospital) {
      filtered = filtered.filter((r) => r.hospital === selectedHospital);
    }

    if (selectedPlant) {
      filtered = filtered.filter((r) => r.planta === selectedPlant);
    }

    // Ordenar: críticos primero
    return filtered.sort((a, b) => {
      const order: Record<AlertLevel, number> = { rojo: 1, amarillo: 2, verde: 3 };
      return order[a.alertaCapacidad] - order[b.alertaCapacidad];
    });
  }, [data, selectedHospital, selectedPlant]);

  // Agrupar por hospital si no hay hospital seleccionado
  const groupedData = useMemo(() => {
    if (selectedHospital) return null;

    const groups = new Map<string, BedCapacityRecord[]>();
    filteredData.forEach((record) => {
      if (!groups.has(record.hospital)) {
        groups.set(record.hospital, []);
      }
      groups.get(record.hospital)!.push(record);
    });
    return groups;
  }, [filteredData, selectedHospital]);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-4xl mb-4">🏥</p>
          <p>No hay datos de capacidad disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen global */}
      {!compact && <Summary data={filteredData} />}

      {/* Contenedor principal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredData.length} unidades monitorizadas
            </p>
          </div>
        </div>

        {/* Vista agrupada por hospital */}
        {groupedData ? (
          <div className="space-y-6">
            {Array.from(groupedData.entries()).map(([hospital, records]) => (
              <div key={hospital}>
                <div className="flex items-center space-x-2 mb-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getHospitalColor(hospital) }}
                  />
                  <h4 className="font-semibold text-gray-700 dark:text-gray-200">{hospital}</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({records.length} plantas)
                  </span>
                </div>
                <div
                  className={`grid gap-4 ${compact ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}
                >
                  {records.map((record) => (
                    <CapacityCard
                      key={`${record.hospital}-${record.planta}`}
                      record={record}
                      compact={compact}
                      onClick={onCardClick ? () => onCardClick(record) : undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Vista plana */
          <div
            className={`grid gap-4 ${compact ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}
          >
            {filteredData.map((record) => (
              <CapacityCard
                key={`${record.hospital}-${record.planta}`}
                record={record}
                compact={compact}
                onClick={onCardClick ? () => onCardClick(record) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BedCapacityMonitor;
