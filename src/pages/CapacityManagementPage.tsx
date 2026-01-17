import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useCapacityStore from '../store/capacityStore';
import useAuthStore from '../store/authStore';
import {
  BedCapacityMonitor,
  CapacityAlertsPanel,
  CapacityPredictionChart,
  PlantOpeningRecommendations,
  CapacityHeatmap,
} from '../components/capacity';
import ThemeToggle from '../components/common/ThemeToggle';
import { BedCapacityRecord, CapacityAlert, ALERT_LEVEL_CONFIGS } from '../types/capacity';
import { ROLE_CONFIGS } from '../types';

// ============================================================================
// TIPOS
// ============================================================================

type TabId = 'general' | 'alertas' | 'prediccion' | 'recomendaciones' | 'heatmap';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const TABS: Tab[] = [
  { id: 'general', label: 'Vista General', icon: '📊' },
  { id: 'alertas', label: 'Alertas', icon: '🚨' },
  { id: 'prediccion', label: 'Predicción', icon: '📈' },
  { id: 'recomendaciones', label: 'Recomendaciones', icon: '💡' },
  { id: 'heatmap', label: 'Mapa de Calor', icon: '🗺️' },
];

// ============================================================================
// COMPONENTE DE MÉTRICAS GLOBALES
// ============================================================================

interface GlobalMetricsProps {
  totalCamas: number;
  camasOcupadas: number;
  camasDisponibles: number;
  ocupacionPromedio: number;
  alertasActivas: number;
  alertasCriticas: number;
}

function GlobalMetrics({
  totalCamas,
  camasOcupadas,
  camasDisponibles,
  ocupacionPromedio,
  alertasActivas,
  alertasCriticas,
}: GlobalMetricsProps) {
  const getOccupancyColor = (value: number) => {
    if (value < 85) return 'text-green-600 dark:text-green-400';
    if (value < 90) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Total Camas</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{totalCamas}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Ocupadas</p>
        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{camasOcupadas}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Disponibles</p>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{camasDisponibles}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Ocupación</p>
        <p className={`text-2xl font-bold ${getOccupancyColor(ocupacionPromedio)}`}>
          {ocupacionPromedio.toFixed(1)}%
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Alertas Activas</p>
        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{alertasActivas}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Críticas</p>
        <p
          className={`text-2xl font-bold ${alertasCriticas > 0 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-gray-600 dark:text-gray-400'}`}
        >
          {alertasCriticas}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE DE TABS
// ============================================================================

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  alertCount: number;
}

function TabNavigation({ activeTab, onTabChange, alertCount }: TabNavigationProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }
          `}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
          {tab.id === 'alertas' && alertCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {alertCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// COMPONENTE MODAL DE DETALLE DE ALERTA
// ============================================================================

interface AlertDetailModalProps {
  alert: CapacityAlert | null;
  onClose: () => void;
}

function AlertDetailModal({ alert, onClose }: AlertDetailModalProps) {
  if (!alert) return null;

  const config = ALERT_LEVEL_CONFIGS[alert.nivel];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className="p-4 border-b border-gray-200 dark:border-gray-700"
          style={{ backgroundColor: `${config.color}15` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{config.icon}</span>
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  Detalle de Alerta
                </h2>
                <span className="text-sm font-medium" style={{ color: config.color }}>
                  {config.label}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-4">
          {/* Ubicación */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ubicación</h3>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{alert.planta}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{alert.hospital}</p>
          </div>

          {/* Mensaje */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Descripción
            </h3>
            <p className="text-gray-700 dark:text-gray-300">{alert.mensaje}</p>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold" style={{ color: config.color }}>
                {alert.ocupacionActual.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ocupación Actual</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {alert.umbralSuperado}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Umbral Superado</p>
            </div>
          </div>

          {/* Acción recomendada */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
              Acción Recomendada
            </h3>
            <p className="text-blue-800 dark:text-blue-200 font-medium">
              {alert.accionRecomendada}
            </p>
          </div>

          {/* Timestamp */}
          <div className="text-xs text-gray-400 dark:text-gray-500 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
            Generada: {new Date(alert.timestamp).toLocaleString('es-ES')}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE MODAL DE DETALLE DE CAPACIDAD
// ============================================================================

interface CapacityDetailModalProps {
  record: BedCapacityRecord | null;
  onClose: () => void;
}

function CapacityDetailModal({ record, onClose }: CapacityDetailModalProps) {
  if (!record) return null;

  const ocupacion =
    record.camasTotales > 0 ? (record.camasOcupadas / record.camasTotales) * 100 : 0;

  const getOccupancyColor = () => {
    if (ocupacion >= 90) return '#EF4444';
    if (ocupacion >= 85) return '#F59E0B';
    return '#22C55E';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">{record.planta}</h2>
              <p className="text-blue-100 text-sm">{record.hospital}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-4">
          {/* Ocupación */}
          <div className="text-center">
            <p className="text-4xl font-bold" style={{ color: getOccupancyColor() }}>
              {ocupacion.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ocupación</p>
          </div>

          {/* Métricas de camas */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {record.camasTotales}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-orange-600">{record.camasOcupadas}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ocupadas</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-green-600">{record.camasDisponibles}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Disponibles</p>
            </div>
          </div>

          {/* Otras métricas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-orange-600">{record.pacientesEsperando}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pacientes en espera</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-blue-600">{record.altosTramite}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Altas en trámite</p>
            </div>
          </div>

          {/* Recomendación */}
          {record.recomendacionApertura && record.recomendacionApertura !== 'No necesario' && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
              <h3 className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">
                Recomendación
              </h3>
              <p className="text-amber-800 dark:text-amber-200 font-medium">
                {record.recomendacionApertura}
              </p>
            </div>
          )}

          {/* Última actualización */}
          <div className="text-xs text-gray-400 dark:text-gray-500 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
            Actualizado: {new Date(record.fechaActualizacion).toLocaleString('es-ES')}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE DE ÚLTIMA ACTUALIZACIÓN
// ============================================================================

interface LastUpdateProps {
  lastUpdate: Date | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

function LastUpdate({ lastUpdate, onRefresh, isRefreshing }: LastUpdateProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastUpdate) {
        setTimeAgo('Nunca');
        return;
      }

      const now = new Date();
      const diffMs = now.getTime() - lastUpdate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);

      if (diffMins < 1) {
        setTimeAgo('Ahora mismo');
      } else if (diffMins < 60) {
        setTimeAgo(`Hace ${diffMins} min`);
      } else if (diffHours < 24) {
        setTimeAgo(`Hace ${diffHours}h`);
      } else {
        setTimeAgo(lastUpdate.toLocaleString('es-ES'));
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Última actualización: {timeAgo}
      </span>
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className={`
          flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium
          hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
        <span>{isRefreshing ? 'Actualizando...' : 'Actualizar Datos'}</span>
      </button>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

function CapacityManagementPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<CapacityAlert | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<BedCapacityRecord | null>(null);

  // Store de autenticación
  const { user } = useAuthStore();
  const roleConfig = user ? ROLE_CONFIGS[user.role] : ROLE_CONFIGS.invitado;

  // Store de capacidad
  const { bedCapacity, alerts, isLoading, error, loadCapacityData, refreshCapacity } =
    useCapacityStore();

  // Cargar datos iniciales
  useEffect(() => {
    loadCapacityData();
    setLastUpdate(new Date());
  }, [loadCapacityData]);

  // Calcular métricas globales
  const globalMetrics = useMemo(() => {
    const totalCamas = bedCapacity.reduce(
      (sum: number, r: BedCapacityRecord) => sum + r.camasTotales,
      0
    );
    const camasOcupadas = bedCapacity.reduce(
      (sum: number, r: BedCapacityRecord) => sum + r.camasOcupadas,
      0
    );
    const camasDisponibles = bedCapacity.reduce(
      (sum: number, r: BedCapacityRecord) => sum + r.camasDisponibles,
      0
    );
    const ocupacionPromedio = totalCamas > 0 ? (camasOcupadas / totalCamas) * 100 : 0;
    const alertasActivas = alerts.filter((a: CapacityAlert) => !a.resuelta).length;
    const alertasCriticas = alerts.filter(
      (a: CapacityAlert) => a.nivel === 'rojo' && !a.resuelta
    ).length;

    return {
      totalCamas,
      camasOcupadas,
      camasDisponibles,
      ocupacionPromedio,
      alertasActivas,
      alertasCriticas,
    };
  }, [bedCapacity, alerts]);

  // Manejar actualización manual
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshCapacity();
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error al actualizar datos de capacidad:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handlers para componentes
  const handleResolveAlert = (alertId: string) => {
    console.log('Resolver alerta:', alertId);
    // TODO: Implementar lógica de resolución de alerta
  };

  const handleViewAlertDetail = (alert: CapacityAlert) => {
    setSelectedAlert(alert);
  };

  const handleCellClick = (record: BedCapacityRecord) => {
    setSelectedRecord(record);
  };

  const handleViewRecordDetail = (record: BedCapacityRecord) => {
    setSelectedRecord(record);
  };

  // Renderizar contenido de la tab activa
  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">🔄</div>
            <p className="text-gray-500 dark:text-gray-400">Cargando datos de capacidad...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'general':
        return (
          <BedCapacityMonitor data={bedCapacity} title="Monitorización de Capacidad por Unidad" />
        );

      case 'alertas':
        return (
          <CapacityAlertsPanel
            alerts={alerts}
            title="Alertas de Capacidad Activas"
            onResolveAlert={handleResolveAlert}
            onViewDetail={handleViewAlertDetail}
          />
        );

      case 'prediccion':
        return (
          <CapacityPredictionChart
            currentData={bedCapacity}
            title="Predicción de Ocupación a 72 horas"
            height={400}
            showConfidenceBand={true}
          />
        );

      case 'recomendaciones':
        return (
          <PlantOpeningRecommendations
            data={bedCapacity}
            title="Recomendaciones de Apertura de Planta"
            maxItems={8}
            onViewDetail={handleViewRecordDetail}
          />
        );

      case 'heatmap':
        return (
          <CapacityHeatmap
            data={bedCapacity}
            title="Mapa de Calor de Ocupación Hospitalaria"
            onCellClick={handleCellClick}
            showLegend={true}
            cellSize="medium"
          />
        );

      default:
        return null;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header - Estilo consistente con Chat y Mapas */}
      <header
        className="bg-white dark:bg-gray-800 shadow-sm border-b-4 transition-colors"
        style={{ borderColor: roleConfig.color }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Lado izquierdo: Volver + Título */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink min-w-0">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                title="Volver al Dashboard"
                aria-label="Volver al Dashboard"
              >
                ← <span className="hidden sm:inline">Volver</span>
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-secondary dark:text-gray-100 truncate">
                  🏥 Gestión de Capacidad
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {bedCapacity.length} unidades • {globalMetrics.alertasActivas} alertas
                </p>
              </div>
            </div>

            {/* Lado derecho: Info usuario + Theme Toggle + Avatar */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="text-right hidden md:block">
                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{roleConfig.name}</p>
              </div>
              <ThemeToggle />
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl"
                style={{ backgroundColor: `${roleConfig.color}20` }}
              >
                {roleConfig.icon}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mostrar error si existe */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-red-700 dark:text-red-400 font-medium">Error al cargar datos</p>
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Controles superiores con botón de actualización */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-end mb-6">
          <LastUpdate
            lastUpdate={lastUpdate}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </div>

        {/* Métricas globales */}
        <GlobalMetrics {...globalMetrics} />

        {/* Navegación por tabs */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          alertCount={globalMetrics.alertasActivas}
        />

        {/* Contenido de la tab activa */}
        {renderTabContent()}
      </main>

      {/* Modales */}
      <AlertDetailModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      <CapacityDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  );
}

export default CapacityManagementPage;
