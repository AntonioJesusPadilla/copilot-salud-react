import { useMemo, useState } from 'react';
import {
  BedCapacityRecord,
  PLANT_CONFIGS,
  PlantName,
  AlertLevel,
  getAlertLevel,
} from '../../types/capacity';
import { HOSPITAL_CONFIGS } from '../../types/financial';

// ============================================================================
// TIPOS
// ============================================================================

export interface CapacityHeatmapProps {
  data: BedCapacityRecord[];
  title?: string;
  onCellClick?: (record: BedCapacityRecord) => void;
  showLegend?: boolean;
  cellSize?: 'small' | 'medium' | 'large';
}

interface HeatmapCell {
  hospital: string;
  planta: string;
  record: BedCapacityRecord | null;
  occupancy: number | null;
  alertLevel: AlertLevel | null;
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

function getOccupancyColor(occupancy: number | null): string {
  if (occupancy === null) return '#E5E7EB'; // gray-200
  if (occupancy < 70) return '#86EFAC'; // green-300
  if (occupancy < 80) return '#4ADE80'; // green-400
  if (occupancy < 85) return '#22C55E'; // green-500
  if (occupancy < 88) return '#FDE047'; // yellow-300
  if (occupancy < 90) return '#FACC15'; // yellow-400
  if (occupancy < 93) return '#FB923C'; // orange-400
  if (occupancy < 95) return '#F87171'; // red-400
  return '#EF4444'; // red-500
}

function getTextColor(occupancy: number | null): string {
  if (occupancy === null) return '#9CA3AF';
  // Solo usar blanco para fondos muy oscuros (naranja oscuro y rojos)
  if (occupancy >= 93) return '#FFFFFF'; // orange-400 y rojos
  // Para amarillos y naranjas claros, usar texto oscuro
  return '#1F2937';
}

/**
 * Calcula el porcentaje de ocupación real
 * Si porcentajeOcupacion es 0 pero hay camas, calcula manualmente
 */
function calculateOccupancy(record: BedCapacityRecord): number {
  if (record.porcentajeOcupacion > 0) {
    return record.porcentajeOcupacion;
  }
  // Si el porcentaje viene como 0, calcularlo manualmente
  if (record.camasTotales > 0) {
    return (record.camasOcupadas / record.camasTotales) * 100;
  }
  return 0;
}

// ============================================================================
// COMPONENTE DE CELDA
// ============================================================================

interface HeatmapCellProps {
  cell: HeatmapCell;
  size: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

function HeatmapCellComponent({ cell, size, onClick }: HeatmapCellProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    small: 'w-12 h-12 text-xs',
    medium: 'w-16 h-16 text-sm',
    large: 'w-20 h-20 text-base',
  };

  const bgColor = getOccupancyColor(cell.occupancy);
  const textColor = getTextColor(cell.occupancy);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={!cell.record}
        className={`
          ${sizeClasses[size]}
          rounded-lg transition-all duration-200
          flex items-center justify-center font-bold
          ${cell.record ? 'hover:scale-105 hover:shadow-lg cursor-pointer' : 'cursor-default opacity-50'}
          ${isHovered && cell.record ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
        `}
        style={{
          backgroundColor: bgColor,
          color: textColor,
        }}
      >
        {cell.occupancy !== null ? `${cell.occupancy.toFixed(0)}%` : '-'}
      </button>

      {/* Tooltip */}
      {isHovered && cell.record && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56">
          <div className="bg-gray-900 dark:bg-gray-700 text-white rounded-lg shadow-xl p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span>{getPlantIcon(cell.planta)}</span>
              <div>
                <p className="font-semibold text-sm">{cell.planta}</p>
                <p className="text-xs text-gray-300">{cell.hospital}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-400">Ocupación</p>
                <p className="font-bold" style={{ color: bgColor }}>
                  {cell.occupancy?.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-gray-400">Disponibles</p>
                <p className="font-bold text-green-400">{cell.record.camasDisponibles}</p>
              </div>
              <div>
                <p className="text-gray-400">Ocupadas</p>
                <p className="font-bold">{cell.record.camasOcupadas}</p>
              </div>
              <div>
                <p className="text-gray-400">Total</p>
                <p className="font-bold">{cell.record.camasTotales}</p>
              </div>
            </div>

            {cell.record.pacientesEsperando > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-xs text-orange-400">
                  ⚠️ {cell.record.pacientesEsperando} pacientes en espera
                </p>
              </div>
            )}

            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="border-8 border-transparent border-t-gray-900 dark:border-t-gray-700" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE DE LEYENDA
// ============================================================================

function Legend() {
  const gradientStops = [
    { value: '<70%', color: '#86EFAC' },
    { value: '70-85%', color: '#22C55E' },
    { value: '85-90%', color: '#FACC15' },
    { value: '90-95%', color: '#FB923C' },
    { value: '>95%', color: '#EF4444' },
  ];

  return (
    <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
        Nivel de ocupación:
      </span>
      <div className="flex items-center space-x-3">
        {gradientStops.map((stop, index) => (
          <div key={index} className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: stop.color }} />
            <span className="text-xs text-gray-600 dark:text-gray-400">{stop.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE DE BARRAS COMPARATIVAS POR HOSPITAL
// ============================================================================

interface HospitalComparisonBarsProps {
  data: BedCapacityRecord[];
}

function HospitalComparisonBars({ data }: HospitalComparisonBarsProps) {
  const hospitalStats = useMemo(() => {
    const statsMap = new Map<
      string,
      { totalCamas: number; camasOcupadas: number; plantas: number }
    >();

    data.forEach((record) => {
      const current = statsMap.get(record.hospital) || {
        totalCamas: 0,
        camasOcupadas: 0,
        plantas: 0,
      };
      statsMap.set(record.hospital, {
        totalCamas: current.totalCamas + record.camasTotales,
        camasOcupadas: current.camasOcupadas + record.camasOcupadas,
        plantas: current.plantas + 1,
      });
    });

    return Array.from(statsMap.entries())
      .map(([hospital, stats]) => ({
        hospital,
        ...stats,
        occupancy: stats.totalCamas > 0 ? (stats.camasOcupadas / stats.totalCamas) * 100 : 0,
      }))
      .sort((a, b) => b.occupancy - a.occupancy);
  }, [data]);

  const maxOccupancy = Math.max(...hospitalStats.map((h) => h.occupancy), 100);

  return (
    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Comparativa de Ocupación por Hospital
      </h4>
      <div className="space-y-3">
        {hospitalStats.map((hospital) => {
          const barColor = getOccupancyColor(hospital.occupancy);
          const barWidth = (hospital.occupancy / maxOccupancy) * 100;

          return (
            <div key={hospital.hospital} className="flex items-center space-x-3">
              <div className="w-40 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getHospitalColor(hospital.hospital) }}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {hospital.hospital}
                  </span>
                </div>
              </div>
              <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: barColor,
                    minWidth: '40px',
                  }}
                >
                  <span
                    className="text-xs font-bold"
                    style={{ color: hospital.occupancy >= 93 ? '#FFFFFF' : '#1F2937' }}
                  >
                    {hospital.occupancy.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-24 flex-shrink-0 text-right">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {hospital.camasOcupadas}/{hospital.totalCamas} camas
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE DE ESTADÍSTICAS RÁPIDAS
// ============================================================================

interface QuickStatsProps {
  data: BedCapacityRecord[];
}

function QuickStats({ data }: QuickStatsProps) {
  const stats = useMemo(() => {
    // Calcular ocupación real para cada registro
    const occupancies = data.map((r) => calculateOccupancy(r));

    const critical = occupancies.filter((occ) => occ >= 90).length;
    const warning = occupancies.filter((occ) => occ >= 85 && occ < 90).length;
    const normal = occupancies.filter((occ) => occ < 85).length;
    const avgOccupancy =
      occupancies.length > 0
        ? occupancies.reduce((sum, occ) => sum + occ, 0) / occupancies.length
        : 0;

    return { critical, warning, normal, avgOccupancy };
  }, [data]);

  return (
    <div className="grid grid-cols-4 gap-3 mb-4">
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.critical}</p>
        <p className="text-xs text-red-600 dark:text-red-400">Críticas</p>
      </div>
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.warning}</p>
        <p className="text-xs text-yellow-600 dark:text-yellow-400">En alerta</p>
      </div>
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.normal}</p>
        <p className="text-xs text-green-600 dark:text-green-400">Normales</p>
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {stats.avgOccupancy.toFixed(0)}%
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400">Promedio</p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

function CapacityHeatmap({
  data,
  title = 'Mapa de Calor de Ocupación',
  onCellClick,
  showLegend = true,
  cellSize = 'medium',
}: CapacityHeatmapProps) {
  // Extraer hospitales y plantas únicos
  const { hospitals, plants, heatmapData } = useMemo(() => {
    const hospitalsSet = new Set<string>();
    const plantsSet = new Set<string>();

    data.forEach((record) => {
      hospitalsSet.add(record.hospital);
      plantsSet.add(record.planta);
    });

    const hospitalsList = Array.from(hospitalsSet).sort();
    const plantsList = Array.from(plantsSet).sort((a, b) => {
      // Ordenar por prioridad de planta
      const priorityOrder: Record<string, number> = {
        UCI: 1,
        Urgencias: 2,
        Cardiología: 3,
        Cirugía: 4,
        'Medicina Interna': 5,
        Pediatría: 6,
        Maternidad: 7,
        Oncología: 8,
        Traumatología: 9,
        Neurología: 10,
      };
      return (priorityOrder[a] || 99) - (priorityOrder[b] || 99);
    });

    // Crear matriz de datos
    const matrix: HeatmapCell[][] = hospitalsList.map((hospital) =>
      plantsList.map((planta) => {
        const record = data.find((r) => r.hospital === hospital && r.planta === planta);
        const occupancy = record ? calculateOccupancy(record) : null;
        return {
          hospital,
          planta,
          record: record || null,
          occupancy,
          alertLevel: occupancy !== null ? getAlertLevel(occupancy) : null,
        };
      })
    );

    return { hospitals: hospitalsList, plants: plantsList, heatmapData: matrix };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-4xl mb-2">📊</p>
          <p>No hay datos para mostrar en el mapa de calor</p>
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
          {hospitals.length} hospitales × {plants.length} plantas
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <QuickStats data={data} />

      {/* Mapa de calor */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 min-w-[180px]">
                Hospital
              </th>
              {plants.map((plant) => (
                <th key={plant} className="p-2 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-lg">{getPlantIcon(plant)}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 max-w-[60px] truncate">
                      {plant}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hospitals.map((hospital, rowIndex) => (
              <tr key={hospital}>
                <td className="p-2 min-w-[180px]">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getHospitalColor(hospital) }}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {hospital}
                    </span>
                  </div>
                </td>
                {heatmapData[rowIndex].map((cell) => (
                  <td key={`${hospital}-${cell.planta}`} className="p-2">
                    <div className="flex justify-center">
                      <HeatmapCellComponent
                        cell={cell}
                        size={cellSize}
                        onClick={
                          cell.record && onCellClick ? () => onCellClick(cell.record!) : undefined
                        }
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      {showLegend && <Legend />}

      {/* Barras comparativas por hospital */}
      <HospitalComparisonBars data={data} />

      {/* Nota */}
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">
        Haz clic en una celda para ver más detalles. Las celdas vacías indican que no hay datos
        disponibles.
      </p>
    </div>
  );
}

export default CapacityHeatmap;
