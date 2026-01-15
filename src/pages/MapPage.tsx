import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useMapStore from '../store/mapStore';
import { ROLE_CONFIGS } from '../types';
import InteractiveMap from '../components/map/InteractiveMap';
import MapFilters from '../components/map/MapFilters';
import SearchBar from '../components/filters/SearchBar';
import ThemeToggle from '../components/common/ThemeToggle';
import { HEALTH_CENTER_TYPE_CONFIGS } from '../types/map';
import ExportMenu, { ExportOption } from '../components/common/ExportMenu';
import {
  exportCentrosToCSV,
  exportCentrosToExcel,
  exportElementToPNG,
  validateExportPermission,
} from '../services/exportService';

function MapPage() {
  const { user } = useAuthStore();
  const {
    filteredCenters,
    selectedCenter,
    filters,
    mapView,
    stats,
    isLoading,
    loadCenters,
    setFilters,
    applyFilters,
    selectCenter,
    clearFilters,
    resetMapView,
  } = useMapStore();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(true);

  // Cargar centros al montar
  useEffect(() => {
    loadCenters();
  }, [loadCenters]);

  if (!user) {
    return null;
  }

  const roleConfig = ROLE_CONFIGS[user.role];

  // Opciones de exportación para mapas
  const exportOptions: ExportOption[] = [
    {
      id: 'centros-excel',
      label: 'Centros a Excel',
      icon: '📊',
      onClick: () => {
        validateExportPermission(roleConfig.permissions.canExport);
        exportCentrosToExcel(filteredCenters);
      },
      disabled: !roleConfig.permissions.canExport || filteredCenters.length === 0,
    },
    {
      id: 'centros-csv',
      label: 'Centros a CSV',
      icon: '📋',
      onClick: () => {
        validateExportPermission(roleConfig.permissions.canExport);
        exportCentrosToCSV(filteredCenters);
      },
      disabled: !roleConfig.permissions.canExport || filteredCenters.length === 0,
    },
    {
      id: 'map-png',
      label: 'Mapa como imagen (PNG)',
      icon: '🖼️',
      onClick: async () => {
        validateExportPermission(roleConfig.permissions.canExport);
        await exportElementToPNG(
          'map-container',
          `Mapa_Centros_Salud_${new Date().toISOString().split('T')[0]}`
        );
      },
      disabled: !roleConfig.permissions.canExport,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
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
                  🗺️ Mapa de Centros de Salud
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Málaga - {stats?.total || 0} centros
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 transition-colors">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Centros</p>
            <p className="text-xl sm:text-2xl font-bold text-primary">{stats?.total || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 transition-colors">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Con Urgencias</p>
            <p className="text-xl sm:text-2xl font-bold text-red-500 dark:text-red-400">
              {stats?.withEmergency || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 transition-colors">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Mostrados</p>
            <p className="text-xl sm:text-2xl font-bold text-green-500 dark:text-green-400">
              {filteredCenters.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 transition-colors">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Zonas</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-500 dark:text-purple-400">
              {stats?.zones.length || 0}
            </p>
          </div>
        </div>

        {/* Búsqueda Global */}
        <div className="mb-6">
          <SearchBar
            placeholder="Buscar centros de salud, direcciones, ciudades..."
            defaultScope="centers"
          />
        </div>

        {/* Layout con mapa y filtros */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Panel de filtros */}
          <div className={`lg:col-span-1 ${showFilters ? '' : 'hidden lg:block'}`}>
            <MapFilters
              filters={filters}
              stats={stats}
              filteredCenters={filteredCenters}
              onFiltersChange={setFilters}
              onApplyFilters={applyFilters}
              onClearFilters={clearFilters}
              onCenterSelect={selectCenter}
            />

            {/* Leyenda del mapa */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mt-4 sm:mt-6 transition-colors">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">
                📍 Leyenda
              </h4>
              <div className="space-y-2">
                {Object.values(HEALTH_CENTER_TYPE_CONFIGS).map((config) => (
                  <div key={config.type} className="flex items-center space-x-2">
                    <span className="text-lg sm:text-xl">{config.icon}</span>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        {config.name}
                      </p>
                    </div>
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: config.markerColor }}
                    ></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón reset vista */}
            <button
              onClick={resetMapView}
              className="w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              aria-label="Restablecer vista del mapa"
            >
              🔄 Restablecer Vista
            </button>

            {/* Botón exportar */}
            {roleConfig.permissions.canExport && (
              <div className="mt-4">
                <ExportMenu
                  options={exportOptions}
                  buttonLabel="Exportar"
                  buttonIcon="📥"
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Mapa */}
          <div className="lg:col-span-3">
            {/* Botón toggle filtros (móvil) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden mb-4 w-full px-4 py-2 bg-primary text-white rounded-lg font-medium"
            >
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </button>

            {/* Componente del mapa */}
            <div id="map-container" className="bg-white rounded-lg shadow-lg p-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-[600px]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando mapa...</p>
                  </div>
                </div>
              ) : (
                <div className="h-[600px]">
                  <InteractiveMap
                    centers={filteredCenters}
                    mapView={mapView}
                    onCenterClick={selectCenter}
                  />
                </div>
              )}
            </div>

            {/* Info del centro seleccionado */}
            {selectedCenter && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mt-4 sm:mt-6 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl sm:text-3xl">
                      {HEALTH_CENTER_TYPE_CONFIGS[selectedCenter.type].icon}
                    </span>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
                        {selectedCenter.name}
                      </h3>
                      <p
                        className="text-sm font-medium mt-1"
                        style={{
                          color: HEALTH_CENTER_TYPE_CONFIGS[selectedCenter.type].color,
                        }}
                      >
                        {HEALTH_CENTER_TYPE_CONFIGS[selectedCenter.type].name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => selectCenter(null)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dirección</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {selectedCenter.address}
                        <br />
                        {selectedCenter.city}, {selectedCenter.postalCode}
                      </p>
                    </div>

                    {selectedCenter.phone && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Teléfono</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {selectedCenter.phone}
                        </p>
                      </div>
                    )}

                    {selectedCenter.schedule && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Horario</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {selectedCenter.schedule}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {selectedCenter.description && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Descripción</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {selectedCenter.description}
                        </p>
                      </div>
                    )}

                    {selectedCenter.services && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Servicios</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedCenter.services.map((service, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default MapPage;
