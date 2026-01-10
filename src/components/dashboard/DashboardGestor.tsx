import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useKPIStore from '../../store/kpiStore';
import useMapStore from '../../store/mapStore';
import useFilterStore from '../../store/filterStore';
import { ROLE_CONFIGS } from '../../types';
import { KPI_CATEGORY_CONFIGS } from '../../types/kpi';
import KPIGrid from '../kpi/KPIGrid';
import DashboardHeader from './DashboardHeader';
import QuickActions from './QuickActions';
import StatsCard from './StatsCard';
import SearchBar from '../filters/SearchBar';
import AdvancedFilters from '../filters/AdvancedFilters';
import SavedFilters from '../filters/SavedFilters';
import KPIComparator from '../filters/KPIComparator';
import { ExportOption } from '../common/ExportMenu';
import {
  exportDashboardToPDF,
  exportKPIsToCSV,
  exportKPIsToExcel,
  exportFullReport,
  validateExportPermission
} from '../../services/exportService';
import { filterService } from '../../services/filterService';

function DashboardGestor() {
  const { user, logout } = useAuthStore();
  const { filteredKPIs, stats, isLoading, loadKPIs } = useKPIStore();
  const { centers } = useMapStore();
  const { activeFilters, setActiveFilters, clearActiveFilters } = useFilterStore();
  const navigate = useNavigate();

  const [displayedKPIs, setDisplayedKPIs] = useState(filteredKPIs);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showComparator, setShowComparator] = useState(false);

  const roleConfig = ROLE_CONFIGS.gestor;

  useEffect(() => {
    if (user) {
      loadKPIs(user.role);
    }
  }, [user, loadKPIs]);

  useEffect(() => {
    setDisplayedKPIs(filteredKPIs);
  }, [filteredKPIs]);

  const handleApplyFilters = async () => {
    if (user) {
      const filtered = await filterService.applyAdvancedFilters(activeFilters, user.role);
      setDisplayedKPIs(filtered);
    }
  };

  const handleClearFilters = () => {
    clearActiveFilters();
    setDisplayedKPIs(filteredKPIs);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  if (!user) return null;

  // KPIs prioritarios para gestores (asistencia sanitaria y urgencias)
  const priorityKPIs = displayedKPIs.filter(
    kpi => kpi.category === 'asistencia_sanitaria' || kpi.category === 'urgencias'
  );

  // Contar KPIs por categoría
  const kpisByCategory = displayedKPIs.reduce((acc, kpi) => {
    acc[kpi.category] = (acc[kpi.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top 5 centros con más servicios
  const topCenters = centers
    .sort((a, b) => (b.services?.length || 0) - (a.services?.length || 0))
    .slice(0, 5);

  // Opciones de exportación
  const exportOptions: ExportOption[] = [
    {
      id: 'dashboard-pdf',
      label: 'Dashboard completo (PDF)',
      icon: '📄',
      onClick: async () => {
        validateExportPermission(roleConfig.permissions.canExport);
        await exportDashboardToPDF(user.name);
      },
      disabled: !roleConfig.permissions.canExport
    },
    {
      id: 'kpis-excel',
      label: 'KPIs a Excel',
      icon: '📊',
      onClick: () => {
        validateExportPermission(roleConfig.permissions.canExport);
        exportKPIsToExcel(filteredKPIs);
      },
      disabled: !roleConfig.permissions.canExport || filteredKPIs.length === 0
    },
    {
      id: 'kpis-csv',
      label: 'KPIs a CSV',
      icon: '📋',
      onClick: () => {
        validateExportPermission(roleConfig.permissions.canExport);
        exportKPIsToCSV(filteredKPIs);
      },
      disabled: !roleConfig.permissions.canExport || filteredKPIs.length === 0
    },
    {
      id: 'full-report',
      label: 'Reporte completo (Excel)',
      icon: '📦',
      onClick: () => {
        validateExportPermission(roleConfig.permissions.canExport);
        exportFullReport(filteredKPIs, centers, user.name);
      },
      disabled: !roleConfig.permissions.canExport || filteredKPIs.length === 0
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <DashboardHeader
        user={user}
        roleConfig={roleConfig}
        onLogout={handleLogout}
        onSettings={handleSettings}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de bienvenida */}
        <div
          className="rounded-xl p-6 sm:p-8 mb-6 sm:mb-8 text-white"
          style={{ background: `linear-gradient(135deg, ${roleConfig.color}, ${roleConfig.color}DD)` }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            {roleConfig.icon} Panel de Gestión Operativa
          </h2>
          <p className="text-base sm:text-lg opacity-90">
            Vista optimizada para gestión diaria del sistema de salud
          </p>
        </div>

        {/* Grid de tarjetas de información */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Estadísticas de KPIs */}
          <StatsCard
            title="Indicadores Clave"
            icon="📊"
            stats={[
              { label: 'KPIs disponibles', value: stats?.total || 0, color: roleConfig.color },
              { label: 'KPIs prioritarios', value: priorityKPIs.length, color: '#EF4444' },
              { label: 'Tendencia positiva', value: `${stats?.trending.up || 0} ↑`, color: '#10B981' }
            ]}
          />

          {/* Métricas por categoría */}
          <StatsCard
            title="Por Categoría"
            icon="📁"
            stats={[
              {
                label: 'Asist. Sanitaria',
                value: kpisByCategory['asistencia_sanitaria'] || 0,
                color: KPI_CATEGORY_CONFIGS.asistencia_sanitaria.color
              },
              {
                label: 'Urgencias',
                value: kpisByCategory['urgencias'] || 0,
                color: KPI_CATEGORY_CONFIGS.urgencias.color
              },
              {
                label: 'Recursos Humanos',
                value: kpisByCategory['recursos_humanos'] || 0,
                color: KPI_CATEGORY_CONFIGS.recursos_humanos.color
              }
            ]}
          />

          {/* Centros activos */}
          <StatsCard
            title="Centros Activos"
            icon="🏥"
            stats={[
              { label: 'Total centros', value: centers.length, color: roleConfig.color },
              { label: 'Con urgencias', value: centers.filter(c => c.emergencyService).length, color: '#EF4444' },
              { label: 'Centros de salud', value: centers.filter(c => c.type === 'centro_salud').length, color: '#10B981' }
            ]}
          />

          {/* Acciones rápidas */}
          <QuickActions
            roleConfig={roleConfig}
            exportOptions={exportOptions}
          />
        </div>

        {/* Top 5 centros */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 transition-colors">
          <h3 className="text-lg sm:text-xl font-bold mb-4 text-secondary dark:text-gray-100">
            🏆 Top 5 Centros con Más Servicios
          </h3>
          <div className="space-y-3">
            {topCenters.map((center, index) => (
              <div
                key={center.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{center.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {center.city} - {center.type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: roleConfig.color }}>
                    {center.services?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">servicios</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Búsqueda Global */}
        <div className="mb-6">
          <SearchBar
            placeholder="Buscar KPIs, centros de salud, datos..."
            defaultScope="kpis"
          />
        </div>

        {/* Controles de filtros y comparación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="px-4 sm:px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary hover:shadow-md transition-all font-bold text-gray-700 dark:text-gray-200"
          >
            ⚙️ Filtros Avanzados {showAdvancedFilters ? '▲' : '▼'}
          </button>
          <button
            onClick={() => setShowComparator(!showComparator)}
            className="px-4 sm:px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary hover:shadow-md transition-all font-bold text-gray-700 dark:text-gray-200"
          >
            📊 Comparar KPIs {showComparator ? '▲' : '▼'}
          </button>
          <div className="text-center py-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg">
            <span className="text-sm font-bold text-blue-800 dark:text-blue-300">
              {displayedKPIs.length} de {stats?.total || 0} KPIs mostrados
            </span>
          </div>
        </div>

        {/* Panel de filtros avanzados */}
        {showAdvancedFilters && (
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <AdvancedFilters
              filters={activeFilters}
              onFiltersChange={setActiveFilters}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
              mode="kpi"
            />
            <SavedFilters onFilterLoad={handleApplyFilters} />
          </div>
        )}

        {/* Panel de comparación */}
        {showComparator && (
          <div className="mb-6">
            <KPIComparator />
          </div>
        )}

        {/* Sección de KPIs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-secondary dark:text-gray-100">
                📊 Indicadores Operativos
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Vista de {stats?.total || 0} KPIs para gestión diaria del sistema
              </p>
            </div>
          </div>

          <KPIGrid kpis={displayedKPIs} isLoading={isLoading} />
        </div>

        {/* Información del subsistema */}
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg p-4 sm:p-6 transition-colors">
          <h3 className="font-bold text-base sm:text-lg mb-2 text-green-900 dark:text-green-300">
            ✅ Subsistema 8: Dashboard Gestor Implementado
          </h3>
          <p className="text-sm sm:text-base text-green-800 dark:text-green-200">
            Vista operativa optimizada con KPIs prioritarios, top centros activos y herramientas de exportación avanzadas.
          </p>
        </div>
      </main>
    </div>
  );
}

export default DashboardGestor;
