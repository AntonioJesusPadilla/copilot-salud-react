import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useKPIStore from '../../store/kpiStore';
import useMapStore from '../../store/mapStore';
import useFilterStore from '../../store/filterStore';
import { ROLE_CONFIGS } from '../../types';
import { KPI_CATEGORY_CONFIGS } from '../../types/kpi';
import { KPICategory } from '../../types/kpi';
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

function DashboardAnalista() {
  const { user, logout } = useAuthStore();
  const { filteredKPIs, stats, isLoading, loadKPIs } = useKPIStore();
  const { centers } = useMapStore();
  const { activeFilters, setActiveFilters, clearActiveFilters } = useFilterStore();
  const navigate = useNavigate();

  const [displayedKPIs, setDisplayedKPIs] = useState(filteredKPIs);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showComparator, setShowComparator] = useState(true); // Abierto por defecto para analistas
  const [selectedCategory, setSelectedCategory] = useState<KPICategory | 'todas'>('todas');

  const roleConfig = ROLE_CONFIGS.analista;

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

  const handleCategoryFilter = (category: KPICategory | 'todas') => {
    setSelectedCategory(category);
    if (category === 'todas') {
      setDisplayedKPIs(filteredKPIs);
    } else {
      setDisplayedKPIs(filteredKPIs.filter(kpi => kpi.category === category));
    }
  };

  if (!user) return null;

  // Contar KPIs por categoría
  const kpisByCategory = filteredKPIs.reduce((acc, kpi) => {
    acc[kpi.category] = (acc[kpi.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calcular tendencias
  const positiveKPIs = filteredKPIs.filter(kpi => kpi.trend === 'up').length;
  const negativeKPIs = filteredKPIs.filter(kpi => kpi.trend === 'down').length;
  const stableKPIs = filteredKPIs.filter(kpi => kpi.trend === 'stable').length;

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
            {roleConfig.icon} Panel de Análisis Avanzado
          </h2>
          <p className="text-base sm:text-lg opacity-90">
            Vista optimizada para análisis detallado y comparativas de datos
          </p>
        </div>

        {/* Grid de tarjetas de información */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Análisis de tendencias */}
          <StatsCard
            title="Análisis de Tendencias"
            icon="📈"
            stats={[
              { label: 'Tendencia positiva', value: positiveKPIs, color: '#10B981' },
              { label: 'Tendencia negativa', value: negativeKPIs, color: '#EF4444' },
              { label: 'Estables', value: stableKPIs, color: '#6B7280' }
            ]}
          />

          {/* Distribución por categoría */}
          <StatsCard
            title="Por Categoría"
            icon="📁"
            stats={[
              {
                label: 'Categorías activas',
                value: Object.keys(kpisByCategory).length,
                color: roleConfig.color
              },
              {
                label: 'Mayor categoría',
                value: Math.max(...Object.values(kpisByCategory), 0),
                color: '#3B82F6',
                subtitle: 'KPIs en la categoría más grande'
              }
            ]}
          />

          {/* Estadísticas generales */}
          <StatsCard
            title="Indicadores"
            icon="📊"
            stats={[
              { label: 'Total KPIs', value: stats?.total || 0, color: roleConfig.color },
              { label: 'Mostrados', value: displayedKPIs.length, color: '#3B82F6' },
              {
                label: 'Cambio promedio',
                value: `${((positiveKPIs - negativeKPIs) / (stats?.total || 1) * 100).toFixed(1)}%`,
                color: positiveKPIs > negativeKPIs ? '#10B981' : '#EF4444'
              }
            ]}
          />

          {/* Acciones rápidas */}
          <QuickActions
            roleConfig={roleConfig}
            exportOptions={exportOptions}
          />
        </div>

        {/* Filtros por categoría */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 transition-colors">
          <h3 className="text-lg font-bold mb-4 text-secondary dark:text-gray-100">
            🔍 Análisis por Categoría
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-3">
            <button
              onClick={() => handleCategoryFilter('todas')}
              className={`p-3 rounded-lg font-medium transition-all ${
                selectedCategory === 'todas'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-2 border-purple-500'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <div className="text-2xl mb-1">📊</div>
              <div className="text-xs">Todas</div>
              <div className="text-lg font-bold">{filteredKPIs.length}</div>
            </button>
            {Object.entries(KPI_CATEGORY_CONFIGS).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleCategoryFilter(config.category)}
                className={`p-3 rounded-lg font-medium transition-all ${
                  selectedCategory === config.category
                    ? 'border-2 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                style={
                  selectedCategory === config.category
                    ? { backgroundColor: config.color, borderColor: config.color }
                    : {}
                }
              >
                <div className="text-2xl mb-1">{config.icon}</div>
                <div className="text-xs">{config.name.split(' ')[0]}</div>
                <div className="text-lg font-bold">{kpisByCategory[config.category] || 0}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Panel de comparación - Abierto por defecto */}
        {showComparator && (
          <div className="mb-6">
            <KPIComparator />
          </div>
        )}

        {/* Búsqueda Global */}
        <div className="mb-6">
          <SearchBar
            placeholder="Buscar KPIs por nombre, descripción o categoría..."
            defaultScope="kpis"
          />
        </div>

        {/* Controles de filtros */}
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
            📊 Comparador de KPIs {showComparator ? '▲' : '▼'}
          </button>
          <div className="text-center py-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg">
            <span className="text-sm font-bold text-blue-800 dark:text-blue-300">
              {displayedKPIs.length} de {stats?.total || 0} KPIs
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

        {/* Sección de KPIs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-secondary dark:text-gray-100">
                📊 Vista Analítica de KPIs
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Análisis detallado de {displayedKPIs.length} indicadores
                {selectedCategory !== 'todas' && ` en ${KPI_CATEGORY_CONFIGS[selectedCategory].name}`}
              </p>
            </div>
          </div>

          <KPIGrid kpis={displayedKPIs} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}

export default DashboardAnalista;
