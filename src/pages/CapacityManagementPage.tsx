import { useState, useEffect, useMemo } from 'react';
import useCapacityStore from '../store/capacityStore';
import {
  BedCapacityMonitor,
  CapacityAlertsPanel,
  CapacityPredictionChart,
  PlantOpeningRecommendations,
  CapacityHeatmap,
} from '../components/capacity';
import { BedCapacityRecord, CapacityAlert } from '../types/capacity';

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
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Store de capacidad
  const { bedCapacity, alerts, isLoading, loadCapacityData, refreshCapacity } = useCapacityStore();

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
    await refreshCapacity();
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  // Handlers para componentes
  const handleResolveAlert = (alertId: string) => {
    console.log('Resolver alerta:', alertId);
    // TODO: Implementar lógica de resolución de alerta
  };

  const handleViewAlertDetail = (alert: unknown) => {
    console.log('Ver detalle de alerta:', alert);
    // TODO: Abrir modal o navegar a detalle
  };

  const handleCellClick = (record: unknown) => {
    console.log('Click en celda:', record);
    // TODO: Abrir modal de detalle
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Gestión de Capacidad Hospitalaria
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitorización en tiempo real de ocupación de camas y alertas del sistema
          </p>
        </div>

        {/* Controles superiores */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {bedCapacity.length} unidades monitorizadas • {globalMetrics.alertasActivas} alertas
              activas
            </p>
          </div>
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
      </div>
    </div>
  );
}

export default CapacityManagementPage;
