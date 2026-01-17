import { useMemo } from 'react';
import {
  BedCapacityRecord,
  PlantOpeningRecommendation,
  RecomendacionApertura,
  PLANT_CONFIGS,
  PlantName,
  calculateOpeningUrgency,
} from '../../types/capacity';
import { HOSPITAL_CONFIGS } from '../../types/financial';

// ============================================================================
// TIPOS
// ============================================================================

export interface PlantOpeningRecommendationsProps {
  data: BedCapacityRecord[];
  recommendations?: PlantOpeningRecommendation[];
  title?: string;
  maxItems?: number;
  onActivateProtocol?: (record: BedCapacityRecord) => void;
  onViewDetail?: (record: BedCapacityRecord) => void;
}

// ============================================================================
// CONFIGURACIÓN DE URGENCIAS
// ============================================================================

const URGENCY_CONFIGS = {
  baja: {
    color: '#10B981',
    bgColor: '#D1FAE5',
    darkBgColor: '#064E3B',
    label: 'Baja',
    icon: '🟢',
  },
  media: {
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    darkBgColor: '#78350F',
    label: 'Media',
    icon: '🟡',
  },
  alta: {
    color: '#F97316',
    bgColor: '#FFEDD5',
    darkBgColor: '#7C2D12',
    label: 'Alta',
    icon: '🟠',
  },
  critica: {
    color: '#EF4444',
    bgColor: '#FEE2E2',
    darkBgColor: '#7F1D1D',
    label: 'Crítica',
    icon: '🔴',
  },
} as const;

const RECOMMENDATION_CONFIGS: Record<
  RecomendacionApertura,
  { icon: string; color: string; priority: number }
> = {
  'No necesario': { icon: '✅', color: '#10B981', priority: 4 },
  'Preparar apertura': { icon: '⏳', color: '#F59E0B', priority: 3 },
  'Abrir planta adicional': { icon: '🚨', color: '#F97316', priority: 2 },
  'Emergencia: todas las plantas': { icon: '🆘', color: '#EF4444', priority: 1 },
};

// ============================================================================
// HELPERS
// ============================================================================

function getPlantIcon(plant: string): string {
  const config = PLANT_CONFIGS[plant as PlantName];
  return config?.icon || '🏥';
}

function getPlantPrepTime(plant: string): number {
  const config = PLANT_CONFIGS[plant as PlantName];
  return config?.tiempoPreparacionHoras || 6;
}

function getHospitalColor(hospital: string): string {
  const config = HOSPITAL_CONFIGS[hospital as keyof typeof HOSPITAL_CONFIGS];
  return config?.color || '#6B7280';
}

function generateRecommendationFromRecord(record: BedCapacityRecord): PlantOpeningRecommendation {
  const urgency = calculateOpeningUrgency(
    record.porcentajeOcupacion,
    record.pacientesEsperando,
    record.ingresosProgramados
  );

  const personalNeeded = Math.ceil(record.camasTotales * 0.3);

  return {
    hospital: record.hospital,
    planta: record.planta,
    recomendacion: (record.recomendacionApertura as RecomendacionApertura) || 'No necesario',
    urgencia: urgency,
    justificacion: generateJustification(record),
    recursosNecesarios: {
      personal: personalNeeded,
      equipamiento: generateEquipmentList(record.planta),
      tiempoPreparacionHoras: getPlantPrepTime(record.planta),
    },
    fechaRecomendacion: new Date().toISOString(),
  };
}

function generateJustification(record: BedCapacityRecord): string {
  const reasons: string[] = [];

  if (record.porcentajeOcupacion >= 90) {
    reasons.push(`Ocupación crítica del ${record.porcentajeOcupacion.toFixed(1)}%`);
  } else if (record.porcentajeOcupacion >= 85) {
    reasons.push(`Ocupación elevada del ${record.porcentajeOcupacion.toFixed(1)}%`);
  }

  if (record.pacientesEsperando > 10) {
    reasons.push(`${record.pacientesEsperando} pacientes en lista de espera`);
  }

  if (record.ingresosProgramados > 5) {
    reasons.push(`${record.ingresosProgramados} ingresos programados en 24h`);
  }

  if (record.camasDisponibles < 5) {
    reasons.push(`Solo ${record.camasDisponibles} camas disponibles`);
  }

  return reasons.length > 0 ? reasons.join('. ') + '.' : 'Situación bajo control.';
}

function generateEquipmentList(plant: string): string[] {
  const baseEquipment = [
    'Camas hospitalarias',
    'Monitores de signos vitales',
    'Material desechable',
  ];

  const plantSpecific: Record<string, string[]> = {
    UCI: ['Ventiladores mecánicos', 'Bombas de infusión', 'Desfibriladores'],
    Urgencias: ['Carros de parada', 'Equipos de sutura', 'Material de inmovilización'],
    Cirugía: ['Equipos de anestesia', 'Instrumental quirúrgico', 'Lámparas quirúrgicas'],
    Cardiología: ['Monitores cardíacos', 'Desfibriladores', 'ECG portátiles'],
  };

  return [...baseEquipment, ...(plantSpecific[plant] || [])];
}

// ============================================================================
// COMPONENTE DE CARD DE RECOMENDACIÓN
// ============================================================================

interface RecommendationCardProps {
  record: BedCapacityRecord;
  recommendation: PlantOpeningRecommendation;
  onActivate?: () => void;
  onViewDetail?: () => void;
}

function RecommendationCard({
  record,
  recommendation,
  onActivate,
  onViewDetail,
}: RecommendationCardProps) {
  const urgencyConfig = URGENCY_CONFIGS[recommendation.urgencia];
  const recConfig = RECOMMENDATION_CONFIGS[recommendation.recomendacion];

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all p-4"
      style={{ borderLeftColor: urgencyConfig.color }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getPlantIcon(record.planta)}</span>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-100">{record.planta}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <span
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: getHospitalColor(record.hospital) }}
              />
              {record.hospital}
            </p>
          </div>
        </div>

        {/* Badge de urgencia */}
        <span
          className="px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
          style={{
            backgroundColor: `${urgencyConfig.color}20`,
            color: urgencyConfig.color,
          }}
        >
          <span>{urgencyConfig.icon}</span>
          <span>Urgencia {urgencyConfig.label}</span>
        </span>
      </div>

      {/* Recomendación */}
      <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: `${recConfig.color}10` }}>
        <div className="flex items-center space-x-2 mb-1">
          <span>{recConfig.icon}</span>
          <span className="font-semibold" style={{ color: recConfig.color }}>
            {recommendation.recomendacion}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{recommendation.justificacion}</p>
      </div>

      {/* Métricas actuales */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
            {record.porcentajeOcupacion.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Ocupación</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <p className="text-sm font-bold text-orange-600">{record.pacientesEsperando}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">En espera</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <p className="text-sm font-bold text-blue-600">{record.ingresosProgramados}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Ingresos 24h</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <p className="text-sm font-bold text-green-600">{record.camasDisponibles}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Disponibles</p>
        </div>
      </div>

      {/* Recursos necesarios */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-3">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Recursos necesarios:
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <span>👥</span>
            <span>{recommendation.recursosNecesarios.personal} profesionales</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>⏱️</span>
            <span>{recommendation.recursosNecesarios.tiempoPreparacionHoras}h preparación</span>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Equipamiento: {recommendation.recursosNecesarios.equipamiento.slice(0, 3).join(', ')}
            {recommendation.recursosNecesarios.equipamiento.length > 3 && '...'}
          </p>
        </div>
      </div>

      {/* Botones de acción */}
      {recommendation.recomendacion !== 'No necesario' && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onActivate}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
          >
            <span>🚀</span>
            <span>Activar Protocolo</span>
          </button>
          {onViewDetail && (
            <button
              onClick={onViewDetail}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Ver detalles
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

function PlantOpeningRecommendations({
  data,
  title = 'Recomendaciones de Apertura de Planta',
  maxItems = 6,
  onActivateProtocol,
  onViewDetail,
}: PlantOpeningRecommendationsProps) {
  // Filtrar y ordenar por necesidad de apertura
  const recommendationsData = useMemo(() => {
    // Determinar recomendación basada en ocupación si no hay una explícita
    const getEffectiveRecommendation = (r: BedCapacityRecord): RecomendacionApertura => {
      // Si hay recomendación explícita que coincide con las conocidas, usarla
      if (r.recomendacionApertura === 'Emergencia: todas las plantas')
        return 'Emergencia: todas las plantas';
      if (r.recomendacionApertura === 'Abrir planta adicional') return 'Abrir planta adicional';
      if (r.recomendacionApertura === 'Preparar apertura') return 'Preparar apertura';
      if (r.recomendacionApertura === 'No necesario') return 'No necesario';

      // Si la recomendación contiene "Abrir", es una apertura
      if (r.recomendacionApertura?.toLowerCase().includes('abrir')) return 'Abrir planta adicional';
      if (r.recomendacionApertura?.toLowerCase().includes('apertura')) return 'Preparar apertura';

      // Determinar por ocupación
      const ocupacion =
        r.camasTotales > 0 ? (r.camasOcupadas / r.camasTotales) * 100 : r.porcentajeOcupacion;
      if (ocupacion >= 95) return 'Emergencia: todas las plantas';
      if (ocupacion >= 90) return 'Abrir planta adicional';
      if (ocupacion >= 85) return 'Preparar apertura';
      return 'No necesario';
    };

    return data
      .map((r) => {
        const effectiveRec = getEffectiveRecommendation(r);
        return {
          record: { ...r, recomendacionApertura: effectiveRec },
          recommendation: generateRecommendationFromRecord({
            ...r,
            recomendacionApertura: effectiveRec,
          }),
          effectiveRecommendation: effectiveRec,
        };
      })
      .filter((item) => item.effectiveRecommendation !== 'No necesario')
      .sort((a, b) => {
        const priorityA = RECOMMENDATION_CONFIGS[a.recommendation.recomendacion].priority;
        const priorityB = RECOMMENDATION_CONFIGS[b.recommendation.recomendacion].priority;
        if (priorityA !== priorityB) return priorityA - priorityB;
        return b.record.porcentajeOcupacion - a.record.porcentajeOcupacion;
      })
      .slice(0, maxItems);
  }, [data, maxItems]);

  // Contadores basados en los datos procesados
  const counts = useMemo(
    () => ({
      emergencia: recommendationsData.filter(
        (item) => item.effectiveRecommendation === 'Emergencia: todas las plantas'
      ).length,
      abrir: recommendationsData.filter(
        (item) => item.effectiveRecommendation === 'Abrir planta adicional'
      ).length,
      preparar: recommendationsData.filter(
        (item) => item.effectiveRecommendation === 'Preparar apertura'
      ).length,
    }),
    [recommendationsData]
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {recommendationsData.length} planta{recommendationsData.length !== 1 ? 's' : ''}{' '}
            requieren atención
          </p>
        </div>

        {/* Indicadores */}
        <div className="flex items-center space-x-2">
          {counts.emergencia > 0 && (
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-xs font-medium animate-pulse">
              🆘 {counts.emergencia} emergencia
            </span>
          )}
          {counts.abrir > 0 && (
            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
              🚨 {counts.abrir} abrir
            </span>
          )}
          {counts.preparar > 0 && (
            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium">
              ⏳ {counts.preparar} preparar
            </span>
          )}
        </div>
      </div>

      {/* Lista de recomendaciones */}
      {recommendationsData.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-4xl mb-2">✅</p>
          <p className="text-lg">Sin necesidad de aperturas</p>
          <p className="text-sm">Todas las plantas operan con capacidad suficiente</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {recommendationsData.map(({ record, recommendation }) => (
            <RecommendationCard
              key={`${record.hospital}-${record.planta}`}
              record={record}
              recommendation={recommendation}
              onActivate={onActivateProtocol ? () => onActivateProtocol(record) : undefined}
              onViewDetail={onViewDetail ? () => onViewDetail(record) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PlantOpeningRecommendations;
