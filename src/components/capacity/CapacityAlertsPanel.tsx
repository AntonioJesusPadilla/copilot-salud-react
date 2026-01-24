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
  onResolveAlert?: (alertId: string, notes?: string) => void;
  onViewDetail?: (alert: CapacityAlert) => void;
}

// ============================================================================
// MODAL DE CONFIRMACIÓN PARA RESOLVER ALERTA
// ============================================================================

interface ResolveAlertModalProps {
  alert: CapacityAlert | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
}

function ResolveAlertModal({ alert, isOpen, onClose, onConfirm }: ResolveAlertModalProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !alert) return null;

  const config = ALERT_LEVEL_CONFIGS[alert.nivel];

  const handleConfirm = () => {
    setIsSubmitting(true);
    onConfirm(notes);
    setNotes('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-4 border-b border-gray-200 dark:border-gray-700"
          style={{ borderLeftWidth: '4px', borderLeftColor: config.color }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Resolver Alerta</h3>
            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-6 py-4">
          {/* Info de la alerta */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">{config.icon}</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${config.color}20`, color: config.color }}
              >
                {config.label}
              </span>
            </div>
            <p className="font-medium text-gray-800 dark:text-gray-100">{alert.planta}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{alert.hospital}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Ocupación:{' '}
              <span className="font-bold" style={{ color: config.color }}>
                {alert.ocupacionActual.toFixed(1)}%
              </span>
            </p>
          </div>

          {/* Campo de notas */}
          <div className="mb-4">
            <label
              htmlFor="resolve-notes"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Notas de resolución (opcional)
            </label>
            <textarea
              id="resolve-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Se han dado de alta 5 pacientes, ocupación normalizada..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Advertencia */}
          <div className="flex items-start space-x-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
            <span className="text-lg">⚠️</span>
            <p>
              Al marcar como resuelta, esta alerta dejará de aparecer en la lista de alertas
              activas.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <span>✓</span>
                <span>Confirmar resolución</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
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

      {/* Acción recomendada (solo si no está resuelta) */}
      {!alert.resuelta && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Acción recomendada:</p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {alert.accionRecomendada}
          </p>
        </div>
      )}

      {/* Información de resolución (solo si está resuelta) */}
      {alert.resuelta && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-3 border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <p className="text-xs font-medium text-green-700 dark:text-green-300">
              Alerta resuelta
            </p>
          </div>
          <div className="space-y-1 text-sm">
            {alert.resolvidaPor && (
              <p className="text-gray-600 dark:text-gray-400">
                <span className="text-gray-500 dark:text-gray-500">Resuelto por:</span>{' '}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {alert.resolvidaPor}
                </span>
              </p>
            )}
            {alert.fechaResolucion && (
              <p className="text-gray-600 dark:text-gray-400">
                <span className="text-gray-500 dark:text-gray-500">Fecha:</span>{' '}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {new Date(alert.fechaResolucion).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </p>
            )}
            {alert.notasResolucion && (
              <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Notas:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "{alert.notasResolucion}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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
            <span className="text-xs px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md flex items-center space-x-1">
              <span>✓</span>
              <span>Resuelta</span>
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
// TOAST DE CONFIRMACIÓN
// ============================================================================

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

function SuccessToast({ message, isVisible, onClose }: ToastProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="flex items-center space-x-3 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">
        <span className="text-xl">✅</span>
        <p className="font-medium">{message}</p>
        <button onClick={onClose} className="ml-2 p-1 hover:bg-green-700 rounded transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

type ViewMode = 'activas' | 'resueltas';

function CapacityAlertsPanel({
  alerts,
  title = 'Alertas de Capacidad',
  maxItems = 10,
  showFilters = true,
  onResolveAlert,
  onViewDetail,
}: CapacityAlertsPanelProps) {
  const [levelFilter, setLevelFilter] = useState<AlertLevel | 'all'>('all');
  const [alertToResolve, setAlertToResolve] = useState<CapacityAlert | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('activas');

  // Filtrar y ordenar alertas según el modo de vista
  const filteredAlerts = useMemo(() => {
    let filtered =
      viewMode === 'activas' ? alerts.filter((a) => !a.resuelta) : alerts.filter((a) => a.resuelta);

    if (levelFilter !== 'all') {
      filtered = filtered.filter((a) => a.nivel === levelFilter);
    }

    // Ordenar por nivel (rojo primero) y luego por ocupación
    // Para resueltas, ordenar por fecha de resolución (más recientes primero)
    return filtered
      .sort((a, b) => {
        if (viewMode === 'resueltas' && a.fechaResolucion && b.fechaResolucion) {
          return new Date(b.fechaResolucion).getTime() - new Date(a.fechaResolucion).getTime();
        }
        if (a.nivel === 'rojo' && b.nivel !== 'rojo') return -1;
        if (a.nivel !== 'rojo' && b.nivel === 'rojo') return 1;
        return b.ocupacionActual - a.ocupacionActual;
      })
      .slice(0, maxItems);
  }, [alerts, levelFilter, maxItems, viewMode]);

  // Contadores
  const alertCounts = useMemo(
    () => ({
      amarillas: alerts.filter((a) => a.nivel === 'amarillo' && !a.resuelta).length,
      rojas: alerts.filter((a) => a.nivel === 'rojo' && !a.resuelta).length,
      resueltas: alerts.filter((a) => a.resuelta).length,
    }),
    [alerts]
  );

  const totalActiveAlerts = alertCounts.amarillas + alertCounts.rojas;

  // Manejar apertura del modal de resolución
  const handleOpenResolveModal = (alert: CapacityAlert) => {
    setAlertToResolve(alert);
  };

  // Manejar cierre del modal
  const handleCloseResolveModal = () => {
    setAlertToResolve(null);
  };

  // Manejar confirmación de resolución
  const handleConfirmResolve = (notes: string) => {
    if (alertToResolve && onResolveAlert) {
      onResolveAlert(alertToResolve.id, notes);
      setToastMessage(`Alerta de ${alertToResolve.planta} marcada como resuelta`);
      setShowToast(true);

      // Auto-ocultar toast después de 4 segundos
      setTimeout(() => setShowToast(false), 4000);
    }
    setAlertToResolve(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {viewMode === 'activas'
              ? `${totalActiveAlerts} alerta${totalActiveAlerts !== 1 ? 's' : ''} activa${totalActiveAlerts !== 1 ? 's' : ''}`
              : `${alertCounts.resueltas} alerta${alertCounts.resueltas !== 1 ? 's' : ''} resuelta${alertCounts.resueltas !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Indicadores de urgencia (solo en modo activas) */}
        {viewMode === 'activas' && (
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
        )}
      </div>

      {/* Tabs para cambiar entre activas y resueltas */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          onClick={() => setViewMode('activas')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'activas'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Activas ({totalActiveAlerts})
        </button>
        <button
          onClick={() => setViewMode('resueltas')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'resueltas'
              ? 'border-green-600 text-green-600 dark:text-green-400 dark:border-green-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Resueltas ({alertCounts.resueltas})
        </button>
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
            {viewMode === 'activas' ? (
              <>
                <p className="text-4xl mb-2">✅</p>
                <p className="text-lg">Sin alertas activas</p>
                <p className="text-sm">Todos los sistemas funcionando con normalidad</p>
              </>
            ) : (
              <>
                <p className="text-4xl mb-2">📋</p>
                <p className="text-lg">Sin alertas resueltas</p>
                <p className="text-sm">No hay historial de alertas resueltas</p>
              </>
            )}
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onResolve={onResolveAlert ? () => handleOpenResolveModal(alert) : undefined}
              onViewDetail={onViewDetail ? () => onViewDetail(alert) : undefined}
            />
          ))
        )}
      </div>

      {/* Ver más */}
      {((viewMode === 'activas' && totalActiveAlerts > maxItems) ||
        (viewMode === 'resueltas' && alertCounts.resueltas > maxItems)) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Ver todas las alertas (
            {viewMode === 'activas' ? totalActiveAlerts : alertCounts.resueltas})
          </button>
        </div>
      )}

      {/* Modal de resolución */}
      <ResolveAlertModal
        alert={alertToResolve}
        isOpen={alertToResolve !== null}
        onClose={handleCloseResolveModal}
        onConfirm={handleConfirmResolve}
      />

      {/* Toast de confirmación */}
      <SuccessToast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

export default CapacityAlertsPanel;
