import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useKPIStore from '../store/kpiStore';
import useFilterStore from '../store/filterStore';
import { ROLE_CONFIGS } from '../types';
import KPIGrid from '../components/kpi/KPIGrid';
import ExportMenu, { ExportOption } from '../components/common/ExportMenu';
import SearchBar from '../components/filters/SearchBar';
import AdvancedFilters from '../components/filters/AdvancedFilters';
import SavedFilters from '../components/filters/SavedFilters';
import KPIComparator from '../components/filters/KPIComparator';
import ThemeToggle from '../components/common/ThemeToggle';
import {
  exportDashboardToPDF,
  exportKPIsToCSV,
  exportKPIsToExcel,
  exportFullReport,
  validateExportPermission
} from '../services/exportService';
import { filterService } from '../services/filterService';
import useMapStore from '../store/mapStore';

function DashboardPage() {
  const { user, logout } = useAuthStore();
  const { filteredKPIs, stats, isLoading, loadKPIs } = useKPIStore();
  const { centers } = useMapStore();
  const { activeFilters, setActiveFilters, clearActiveFilters } = useFilterStore();
  const navigate = useNavigate();

  // Estados locales
  const [displayedKPIs, setDisplayedKPIs] = useState(filteredKPIs);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showComparator, setShowComparator] = useState(false);

  // Cargar KPIs cuando se monta el componente
  useEffect(() => {
    if (user) {
      loadKPIs(user.role);
    }
  }, [user, loadKPIs]);

  // Actualizar KPIs mostrados cuando cambian los filtrados
  useEffect(() => {
    setDisplayedKPIs(filteredKPIs);
  }, [filteredKPIs]);

  // Aplicar filtros avanzados
  const handleApplyFilters = async () => {
    if (user) {
      const filtered = await filterService.applyAdvancedFilters(activeFilters, user.role);
      setDisplayedKPIs(filtered);
    }
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    clearActiveFilters();
    setDisplayedKPIs(filteredKPIs);
  };

  if (!user) {
    return null;
  }

  const roleConfig = ROLE_CONFIGS[user.role];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

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
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b-4 transition-colors" style={{ borderColor: roleConfig.color }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo y título */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl"
                style={{ backgroundColor: `${roleConfig.color}20` }}
              >
                {roleConfig.icon}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold text-secondary dark:text-gray-100">
                  Copilot Salud Andalucía
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Dashboard {roleConfig.name}
                </p>
              </div>
            </div>

            {/* Controles del header */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Info de usuario (oculta en mobile) */}
              <div className="hidden md:block text-right">
                <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>

              {/* Theme toggle */}
              <ThemeToggle />

              {/* Configuración */}
              <button
                onClick={handleSettings}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Configuración"
                aria-label="Configuración"
              >
                ⚙️
              </button>

              {/* Cerrar sesión */}
              <button
                onClick={handleLogout}
                className="px-3 py-2 sm:px-4 text-sm sm:text-base bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                aria-label="Cerrar sesión"
              >
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="dashboard-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de bienvenida */}
        <div
          className="rounded-xl p-6 sm:p-8 mb-6 sm:mb-8 text-white"
          style={{ background: `linear-gradient(135deg, ${roleConfig.color}, ${roleConfig.color}DD)` }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            {roleConfig.icon} Bienvenido, {user.name}
          </h2>
          <p className="text-base sm:text-lg opacity-90">
            Dashboard personalizado para {roleConfig.name}
          </p>
        </div>

        {/* Permisos del usuario */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
            <h3 className="font-bold text-lg mb-4 text-secondary dark:text-gray-100">🔐 Permisos de Acceso</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                {roleConfig.permissions.canViewAllData ? '✅' : '❌'}
                <span className="ml-2">Ver todos los datos</span>
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                {roleConfig.permissions.canExport ? '✅' : '❌'}
                <span className="ml-2">Exportar reportes</span>
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                {roleConfig.permissions.canManageUsers ? '✅' : '❌'}
                <span className="ml-2">Gestionar usuarios</span>
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                {roleConfig.permissions.canAccessChat ? '✅' : '❌'}
                <span className="ml-2">Acceso a Chat AI</span>
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                {roleConfig.permissions.canViewMaps ? '✅' : '❌'}
                <span className="ml-2">Ver mapas interactivos</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
            <h3 className="font-bold text-lg mb-4 text-secondary dark:text-gray-100">📊 Estadísticas</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">KPIs disponibles</p>
                <p className="text-2xl font-bold" style={{ color: roleConfig.color }}>
                  {stats?.total || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tendencia positiva</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats?.trending.up || 0} ↑
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Última actualización</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Hoy, {new Date().toLocaleTimeString('es-ES')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
            <h3 className="font-bold text-lg mb-4 text-secondary dark:text-gray-100">🚀 Acciones Rápidas</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200 font-medium">
                📈 Ver KPIs
              </button>
              {roleConfig.permissions.canViewMaps && (
                <button
                  onClick={() => navigate('/maps')}
                  className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200 font-medium"
                >
                  🗺️ Ver Mapas
                </button>
              )}
              {roleConfig.permissions.canAccessChat && (
                <button
                  onClick={() => navigate('/chat')}
                  className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200 font-medium"
                >
                  💬 Chat AI
                </button>
              )}
              {roleConfig.permissions.canExport && (
                <div className="w-full">
                  <ExportMenu
                    options={exportOptions}
                    buttonLabel="Exportar Datos"
                    buttonIcon="📥"
                    className="w-full"
                  />
                </div>
              )}
            </div>
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
                📊 Indicadores de Salud - Málaga
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Tienes acceso a {stats?.total || 0} KPIs según tu rol de {roleConfig.name}
              </p>
            </div>
          </div>

          <KPIGrid kpis={displayedKPIs} isLoading={isLoading} />
        </div>

        {/* Información del subsistema */}
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg p-4 sm:p-6 transition-colors">
          <h3 className="font-bold text-base sm:text-lg mb-2 text-green-900 dark:text-green-300">
            ✅ Subsistema 12 y 13: Filtros Avanzados + Responsive Design Completados
          </h3>
          <p className="text-sm sm:text-base text-green-800 dark:text-green-200">
            Sistema completo de búsqueda global, filtros avanzados, comparador de KPIs y diseño responsive con dark mode.
            Experiencia optimizada para todos los dispositivos con accesibilidad WCAG 2.1.
          </p>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
