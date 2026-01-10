import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useKPIStore from '../../store/kpiStore';
import useMapStore from '../../store/mapStore';
import useFilterStore from '../../store/filterStore';
import { ROLE_CONFIGS } from '../../types';
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

function DashboardAdmin() {
  const { user, logout } = useAuthStore();
  const { filteredKPIs, stats, isLoading, loadKPIs } = useKPIStore();
  const { centers } = useMapStore();
  const { activeFilters, setActiveFilters, clearActiveFilters } = useFilterStore();
  const navigate = useNavigate();

  const [displayedKPIs, setDisplayedKPIs] = useState(filteredKPIs);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showComparator, setShowComparator] = useState(false);

  const roleConfig = ROLE_CONFIGS.admin;

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

  // KPIs críticos (con tendencia negativa)
  const criticalKPIs = displayedKPIs.filter(kpi => kpi.trend === 'down').length;

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
            {roleConfig.icon} Panel de Administración
          </h2>
          <p className="text-base sm:text-lg opacity-90">
            Vista ejecutiva completa del sistema de salud de Andalucía
          </p>
        </div>

        {/* Grid de tarjetas de información */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Estadísticas de KPIs */}
          <StatsCard
            title="KPIs del Sistema"
            icon="📊"
            stats={[
              { label: 'Total de indicadores', value: stats?.total || 0, color: roleConfig.color },
              { label: 'Tendencia positiva', value: `${stats?.trending.up || 0} ↑`, color: '#10B981' },
              { label: 'Requieren atención', value: criticalKPIs, color: '#EF4444' }
            ]}
          />

          {/* Información de centros */}
          <StatsCard
            title="Centros de Salud"
            icon="🏥"
            stats={[
              { label: 'Total centros', value: centers.length, color: roleConfig.color },
              { label: 'Hospitales', value: centers.filter(c => c.type === 'hospital').length, color: '#3B82F6' },
              { label: 'Centros de salud', value: centers.filter(c => c.type === 'centro_salud').length, color: '#10B981' }
            ]}
          />

          {/* Estadísticas del sistema */}
          <StatsCard
            title="Sistema"
            icon="⚙️"
            stats={[
              { label: 'Usuarios activos', value: '4', color: roleConfig.color, subtitle: 'Admin, Gestor, Analista, Invitado' },
              { label: 'Última actualización', value: new Date().toLocaleDateString('es-ES'), color: '#6B7280' }
            ]}
          />

          {/* Acciones rápidas */}
          <QuickActions
            roleConfig={roleConfig}
            exportOptions={exportOptions}
            customActions={
              <button
                onClick={() => navigate('/users')}
                className="w-full text-left px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-red-700 dark:text-red-300 font-medium"
              >
                👥 Gestionar Usuarios
              </button>
            }
          />
        </div>

        {/* Acceso rápido a Gestión de Usuarios */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg p-6 mb-6 transition-colors hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2 text-white flex items-center gap-2">
                👥 Gestión de Usuarios
              </h3>
              <p className="text-white/90 text-sm">
                Administra usuarios del sistema con capacidades CRUD completas
              </p>
            </div>
            <button
              onClick={() => navigate('/users')}
              className="px-6 py-3 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold flex items-center gap-2"
            >
              Abrir Panel
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Sistema de alertas */}
        {criticalKPIs > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg p-4 sm:p-6 mb-6 transition-colors">
            <h3 className="font-bold text-base sm:text-lg mb-2 text-red-900 dark:text-red-300 flex items-center gap-2">
              🚨 Alertas del Sistema
            </h3>
            <p className="text-sm sm:text-base text-red-800 dark:text-red-200">
              Hay <strong>{criticalKPIs} indicadores</strong> con tendencia negativa que requieren atención inmediata.
              Revisa los KPIs marcados en rojo para tomar medidas correctivas.
            </p>
          </div>
        )}

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
                📊 Todos los Indicadores de Salud
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Vista ejecutiva completa de los {stats?.total || 0} KPIs del sistema
              </p>
            </div>
          </div>

          <KPIGrid kpis={displayedKPIs} isLoading={isLoading} />
        </div>

        {/* Información del subsistema */}
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg p-4 sm:p-6 transition-colors">
          <h3 className="font-bold text-base sm:text-lg mb-2 text-green-900 dark:text-green-300">
            ✅ Subsistema 7: Dashboard Administrador Implementado
          </h3>
          <p className="text-sm sm:text-base text-green-800 dark:text-green-200">
            Vista ejecutiva completa con gestión de usuarios, alertas del sistema y acceso total a todos los KPIs y funcionalidades.
          </p>
        </div>
      </main>
    </div>
  );
}

export default DashboardAdmin;
