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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-4" style={{ borderColor: roleConfig.color }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${roleConfig.color}20` }}
              >
                {roleConfig.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-secondary">
                  Copilot Salud Andalucía
                </h1>
                <p className="text-sm text-gray-600">
                  Dashboard {roleConfig.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              <button
                onClick={handleSettings}
                className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                title="Configuración"
              >
                ⚙️
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="dashboard-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de bienvenida */}
        <div
          className="rounded-xl p-8 mb-8 text-white"
          style={{ background: `linear-gradient(135deg, ${roleConfig.color}, ${roleConfig.color}DD)` }}
        >
          <h2 className="text-3xl font-bold mb-2">
            {roleConfig.icon} Bienvenido, {user.name}
          </h2>
          <p className="text-lg opacity-90">
            Dashboard personalizado para {roleConfig.name}
          </p>
        </div>

        {/* Permisos del usuario */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4 text-secondary">🔐 Permisos de Acceso</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-700">
                {roleConfig.permissions.canViewAllData ? '✅' : '❌'}
                <span className="ml-2">Ver todos los datos</span>
              </li>
              <li className="flex items-center text-gray-700">
                {roleConfig.permissions.canExport ? '✅' : '❌'}
                <span className="ml-2">Exportar reportes</span>
              </li>
              <li className="flex items-center text-gray-700">
                {roleConfig.permissions.canManageUsers ? '✅' : '❌'}
                <span className="ml-2">Gestionar usuarios</span>
              </li>
              <li className="flex items-center text-gray-700">
                {roleConfig.permissions.canAccessChat ? '✅' : '❌'}
                <span className="ml-2">Acceso a Chat AI</span>
              </li>
              <li className="flex items-center text-gray-700">
                {roleConfig.permissions.canViewMaps ? '✅' : '❌'}
                <span className="ml-2">Ver mapas interactivos</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4 text-secondary">📊 Estadísticas</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">KPIs disponibles</p>
                <p className="text-2xl font-bold" style={{ color: roleConfig.color }}>
                  {stats?.total || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tendencia positiva</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.trending.up || 0} ↑
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Última actualización</p>
                <p className="text-sm font-medium">Hoy, {new Date().toLocaleTimeString('es-ES')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4 text-secondary">🚀 Acciones Rápidas</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-medium">
                📈 Ver KPIs
              </button>
              {roleConfig.permissions.canViewMaps && (
                <button
                  onClick={() => navigate('/maps')}
                  className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-medium"
                >
                  🗺️ Ver Mapas
                </button>
              )}
              {roleConfig.permissions.canAccessChat && (
                <button
                  onClick={() => navigate('/chat')}
                  className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-medium"
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
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-primary hover:shadow-md transition-all font-bold text-gray-700"
          >
            ⚙️ Filtros Avanzados {showAdvancedFilters ? '▲' : '▼'}
          </button>
          <button
            onClick={() => setShowComparator(!showComparator)}
            className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-primary hover:shadow-md transition-all font-bold text-gray-700"
          >
            📊 Comparar KPIs {showComparator ? '▲' : '▼'}
          </button>
          <div className="text-center py-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <span className="text-sm font-bold text-blue-800">
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
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-secondary">
                📊 Indicadores de Salud - Málaga
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Tienes acceso a {stats?.total || 0} KPIs según tu rol de {roleConfig.name}
              </p>
            </div>
          </div>

          <KPIGrid kpis={displayedKPIs} isLoading={isLoading} />
        </div>

        {/* Información del subsistema */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-2 text-green-900">
            ✅ Subsistema 12: Búsqueda y Filtros Avanzados Integrado
          </h3>
          <p className="text-green-800">
            Sistema completo de búsqueda global, filtros avanzados combinados, filtros guardados con persistencia
            y comparador de KPIs entre períodos. Mejora significativa en la experiencia de usuario para análisis de datos.
          </p>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
