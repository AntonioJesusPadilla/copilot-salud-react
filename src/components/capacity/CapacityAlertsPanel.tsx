import { useMemo, useState } from 'react';
import {
  CapacityAlert,
  AlertLevel,
  ALERT_LEVEL_CONFIGS,
  PLANT_CONFIGS,
  PlantName,
} from '../../types/capacity';

// ============================================================================
// TIPOS
// ============================================================================

export interface CapacityAlertsPanelProps {
  alerts: CapacityAlert[];
  title?: string;
  maxItems?: number;
  showFilters?: boolean;
  onResolveAlert?: (alertId: string) => void;
  onViewDetail?: (alert: CapacityAlert) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

function getPlantIcon(plant: string): string {
  const config = PLANT_CONFIGS[plant as PlantName];
  return config?.icon || '🏥';
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  return then.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

// ============================================================================
// COMPONENTE DE FILTROS
// ============================================================================

interface FiltersProps {
  levelFilter: AlertLevel | 'all';
  onLevelChange: (level: AlertLevel | 'all') => void;
  alertCounts: { amarillas: number; rojas: number };
}

function Filters({ levelFilter, onLevelChange, alertCounts }: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => onLevelChange('all')}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          levelFilter === 'all'
            ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        Todas ({alertCounts.amarillas + alertCounts.rojas})
      </button>
      <button
        onClick={() => onLevelChange('rojo')}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 ${
          levelFilter === 'rojo'
            ? 'bg-red-600 text-white'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
        }`}
      >
        <span>🚨</span>
        <span>Críticas ({alertCounts.rojas})</span>
      </button>
      <button
        onClick={() => onLevelChange('amarillo')}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 ${
          levelFilter === 'amarillo'
            ? 'bg-yellow-500 text-white'
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
        }`}
      >
        <span>⚠️</span>
        <span>Advertencias ({alertCounts.amarillas})</span>
      </button>
    </div>
  );
}

// ============================================================================
// COMPONENTE DE ITEM DE ALERTA
// ============================================================================

interface AlertItemProps {
  alert: CapacityAlert;
  onResolve?: () => void;
  onViewDetail?: () => void;
}

function AlertItem({ alert, onResolve, onViewDetail }: AlertItemProps) {
  const config = ALERT_LEVEL_CONFIGS[alert.nivel];

  return (
    <div
      className="border-l-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-4"
      style={{ borderLeftColor: config.color }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getPlantIcon(alert.planta)}</span>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-100">{alert.planta}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{alert.hospital}</p>
          </div>
        </div>

        {/* Badge y tiempo */}
        <div className="flex flex-col items-end space-y-1">
          <span
            className="px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
            style={{
              backgroundColor: `${config.color}20`,
              color: config.color,
            }}
          >
            <span>{config.icon}</span>
            <span>{config.label}</span>
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatTimeAgo(alert.timestamp)}
          </span>
        </div>
      </div>

      {/* Mensaje */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{alert.mensaje}</p>

      {/* Métricas - Responsive: columna en móvil pequeño, fila en resto */}
      <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 mb-3">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-500 dark:text-gray-400">Ocupación:</span>
          <span className="text-sm font-bold" style={{ color: config.color }}>
            {alert.ocupacionActual.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-500 dark:text-gray-400">Umbral:</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {alert.umbralSuperado}%
          </span>
        </div>
      </div>

      {/* Acción recomendada */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Acción recomendada:</p>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
          {alert.accionRecomendada}
        </p>
      </div>

      {/* Botones de acción - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          {onResolve && !alert.resuelta && (
            <button
              onClick={onResolve}
              className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Marcar resuelta
            </button>
          )}
          {alert.resuelta && (
            <span className="text-xs px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md">
              Resuelta
            </span>
          )}
        </div>
        {onViewDetail && (
          <button
            onClick={onViewDetail}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline text-left sm:text-right"
          >
            Ver detalles
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

function CapacityAlertsPanel({
  alerts,
  title = 'Alertas de Capacidad',
  maxItems = 10,
  showFilters = true,
  onResolveAlert,
  onViewDetail,
}: CapacityAlertsPanelProps) {
  const [levelFilter, setLevelFilter] = useState<AlertLevel | 'all'>('all');

  // Filtrar y ordenar alertas
  const filteredAlerts = useMemo(() => {
    let filtered = alerts.filter((a) => !a.resuelta);

    if (levelFilter !== 'all') {
      filtered = filtered.filter((a) => a.nivel === levelFilter);
    }

    // Ordenar por nivel (rojo primero) y luego por ocupación
    return filtered
      .sort((a, b) => {
        if (a.nivel === 'rojo' && b.nivel !== 'rojo') return -1;
        if (a.nivel !== 'rojo' && b.nivel === 'rojo') return 1;
        return b.ocupacionActual - a.ocupacionActual;
      })
      .slice(0, maxItems);
  }, [alerts, levelFilter, maxItems]);

  // Contadores
  const alertCounts = useMemo(
    () => ({
      amarillas: alerts.filter((a) => a.nivel === 'amarillo' && !a.resuelta).length,
      rojas: alerts.filter((a) => a.nivel === 'rojo' && !a.resuelta).length,
    }),
    [alerts]
  );

  const totalActiveAlerts = alertCounts.amarillas + alertCounts.rojas;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalActiveAlerts} alerta{totalActiveAlerts !== 1 ? 's' : ''} activa
            {totalActiveAlerts !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Indicadores de urgencia */}
        <div className="flex items-center space-x-2">
          {alertCounts.rojas > 0 && (
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-xs font-medium animate-pulse">
              {alertCounts.rojas} críticas
            </span>
          )}
          {alertCounts.amarillas > 0 && (
            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium">
              {alertCounts.amarillas} advertencias
            </span>
          )}
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Filters
          levelFilter={levelFilter}
          onLevelChange={setLevelFilter}
          alertCounts={alertCounts}
        />
      )}

      {/* Lista de alertas */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-4xl mb-2">✅</p>
            <p className="text-lg">Sin alertas activas</p>
            <p className="text-sm">Todos los sistemas funcionando con normalidad</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onResolve={onResolveAlert ? () => onResolveAlert(alert.id) : undefined}
              onViewDetail={onViewDetail ? () => onViewDetail(alert) : undefined}
            />
          ))
        )}
      </div>

      {/* Ver más */}
      {totalActiveAlerts > maxItems && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Ver todas las alertas ({totalActiveAlerts})
          </button>
        </div>
      )}
    </div>
  );
}

export default CapacityAlertsPanel;
