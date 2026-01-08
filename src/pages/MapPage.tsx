import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useMapStore from '../store/mapStore';
import { ROLE_CONFIGS } from '../types';
import InteractiveMap from '../components/map/InteractiveMap';
import MapFilters from '../components/map/MapFilters';
import { HEALTH_CENTER_TYPE_CONFIGS } from '../types/map';
import ExportMenu, { ExportOption } from '../components/common/ExportMenu';
import {
  exportCentrosToCSV,
  exportCentrosToExcel,
  exportElementToPNG,
  validateExportPermission
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
      disabled: !roleConfig.permissions.canExport || filteredCenters.length === 0
    },
    {
      id: 'centros-csv',
      label: 'Centros a CSV',
      icon: '📋',
      onClick: () => {
        validateExportPermission(roleConfig.permissions.canExport);
        exportCentrosToCSV(filteredCenters);
      },
      disabled: !roleConfig.permissions.canExport || filteredCenters.length === 0
    },
    {
      id: 'map-png',
      label: 'Mapa como imagen (PNG)',
      icon: '🖼️',
      onClick: async () => {
        validateExportPermission(roleConfig.permissions.canExport);
        await exportElementToPNG('map-container', `Mapa_Centros_Salud_${new Date().toISOString().split('T')[0]}`);
      },
      disabled: !roleConfig.permissions.canExport
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-4" style={{ borderColor: roleConfig.color }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                title="Volver al Dashboard"
              >
                ← Volver
              </button>
              <div>
                <h1 className="text-2xl font-bold text-secondary">
                  🗺️ Mapa de Centros de Salud
                </h1>
                <p className="text-sm text-gray-600">
                  Provincia de Málaga - {stats?.total || 0} centros disponibles
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Centros</p>
            <p className="text-2xl font-bold text-primary">{stats?.total || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Con Urgencias</p>
            <p className="text-2xl font-bold text-red-500">{stats?.withEmergency || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Mostrados</p>
            <p className="text-2xl font-bold text-green-500">{filteredCenters.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Zonas</p>
            <p className="text-2xl font-bold text-purple-500">{stats?.zones.length || 0}</p>
          </div>
        </div>

        {/* Layout con mapa y filtros */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Panel de filtros */}
          <div className={`lg:col-span-1 ${showFilters ? '' : 'hidden lg:block'}`}>
            <MapFilters
              filters={filters}
              stats={stats}
              onFiltersChange={setFilters}
              onApplyFilters={applyFilters}
              onClearFilters={clearFilters}
            />

            {/* Leyenda del mapa */}
            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
              <h4 className="font-bold text-gray-800 mb-4">📍 Leyenda</h4>
              <div className="space-y-2">
                {Object.values(HEALTH_CENTER_TYPE_CONFIGS).map((config) => (
                  <div key={config.type} className="flex items-center space-x-2">
                    <span className="text-xl">{config.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">
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
              className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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
              <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-3xl">
                      {HEALTH_CENTER_TYPE_CONFIGS[selectedCenter.type].icon}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
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
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Dirección</p>
                      <p className="text-sm text-gray-700">
                        {selectedCenter.address}
                        <br />
                        {selectedCenter.city}, {selectedCenter.postalCode}
                      </p>
                    </div>

                    {selectedCenter.phone && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Teléfono</p>
                        <p className="text-sm text-gray-700">{selectedCenter.phone}</p>
                      </div>
                    )}

                    {selectedCenter.schedule && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Horario</p>
                        <p className="text-sm text-gray-700">{selectedCenter.schedule}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {selectedCenter.description && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Descripción</p>
                        <p className="text-sm text-gray-700">
                          {selectedCenter.description}
                        </p>
                      </div>
                    )}

                    {selectedCenter.services && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Servicios</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedCenter.services.map((service, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700"
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
