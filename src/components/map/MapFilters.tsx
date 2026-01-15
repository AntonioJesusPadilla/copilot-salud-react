import { useState, useEffect } from 'react';
import {
  HealthCenter,
  HealthCenterType,
  HEALTH_CENTER_TYPE_CONFIGS,
  MapFilters as IMapFilters,
} from '../../types/map';

interface MapFiltersProps {
  filters: IMapFilters;
  stats: {
    total: number;
    byType: Record<string, number>;
    withEmergency: number;
  } | null;
  filteredCenters: HealthCenter[];
  onFiltersChange: (filters: IMapFilters) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  onCenterSelect: (center: HealthCenter) => void;
}

function MapFilters({
  filters,
  stats,
  filteredCenters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  onCenterSelect,
}: MapFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
  const [selectedTypes, setSelectedTypes] = useState<HealthCenterType[]>(filters.types || []);
  const [emergencyOnly, setEmergencyOnly] = useState(filters.emergencyOnly || false);

  // Manejar cambio de tipos seleccionados
  const handleTypeToggle = (type: HealthCenterType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];

    setSelectedTypes(newTypes);
    const newFilters = {
      ...filters,
      types: newTypes.length > 0 ? newTypes : undefined,
    };
    onFiltersChange(newFilters);
  };

  // Manejar cambio de urgencias
  const handleEmergencyToggle = () => {
    const newEmergencyOnly = !emergencyOnly;
    setEmergencyOnly(newEmergencyOnly);
    const newFilters = {
      ...filters,
      emergencyOnly: newEmergencyOnly || undefined,
    };
    onFiltersChange(newFilters);
  };

  // Manejar búsqueda
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const newFilters = {
      ...filters,
      searchTerm: value || undefined,
    };
    onFiltersChange(newFilters);
  };

  // Aplicar filtros automáticamente cuando cambian los filtros (búsqueda dinámica)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onApplyFilters();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedTypes, emergencyOnly, onApplyFilters]);

  // Limpiar todos los filtros
  const handleClearAll = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setEmergencyOnly(false);
    onClearFilters();
  };

  // Contar filtros activos
  const activeFiltersCount =
    (selectedTypes.length > 0 ? 1 : 0) + (emergencyOnly ? 1 : 0) + (searchTerm ? 1 : 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Filtros del Mapa</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {stats?.total || 0} centros encontrados
          </p>
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
          >
            Limpiar ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          🔍 Buscar Centro
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Nombre, dirección o ciudad..."
          className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />

        {/* Resultados de búsqueda */}
        {searchTerm && filteredCenters.length > 0 && (
          <div className="mt-3 max-h-64 overflow-y-auto border-2 border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {filteredCenters.length} resultado{filteredCenters.length !== 1 ? 's' : ''}{' '}
                encontrado{filteredCenters.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredCenters.map((center) => {
                const typeConfig = HEALTH_CENTER_TYPE_CONFIGS[center.type];
                return (
                  <button
                    key={center.id}
                    onClick={() => onCenterSelect(center)}
                    className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{typeConfig.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                          {center.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {center.address}, {center.city}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${typeConfig.color}20`,
                              color: typeConfig.color,
                            }}
                          >
                            {typeConfig.name}
                          </span>
                          {center.emergencyService && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                              🚨 Urgencias
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sin resultados */}
        {searchTerm && filteredCenters.length === 0 && (
          <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No se encontraron centros para "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      {/* Filtro de tipos de centros */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Tipo de Centro
        </label>
        <div className="space-y-2">
          {Object.values(HEALTH_CENTER_TYPE_CONFIGS).map((config) => {
            const count = stats?.byType[config.type] || 0;
            const isSelected = selectedTypes.includes(config.type);

            return (
              <button
                key={config.type}
                onClick={() => handleTypeToggle(config.type)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-opacity-100 shadow-md'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                style={{
                  borderColor: isSelected ? config.color : undefined,
                  backgroundColor: isSelected ? `${config.color}15` : undefined,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <p
                        className={`font-semibold ${
                          isSelected ? '' : 'text-gray-700 dark:text-gray-200'
                        }`}
                        style={{ color: isSelected ? config.color : undefined }}
                      >
                        {config.namePlural}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        !isSelected
                          ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                          : ''
                      }`}
                      style={{
                        backgroundColor: isSelected ? config.color : undefined,
                        color: isSelected ? 'white' : undefined,
                      }}
                    >
                      {count}
                    </span>
                    {isSelected && <span className="text-green-500 font-bold">✓</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtro de urgencias */}
      <div className="mb-6">
        <button
          onClick={handleEmergencyToggle}
          className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
            emergencyOnly
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-md'
              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🚨</span>
              <div>
                <p
                  className={`font-semibold ${
                    emergencyOnly
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  Solo Urgencias
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Centros con atención de urgencias 24h
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold ${
                  emergencyOnly
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}
              >
                {stats?.withEmergency || 0}
              </span>
              {emergencyOnly && <span className="text-green-500 font-bold">✓</span>}
            </div>
          </div>
        </button>
      </div>

      {/* Indicador de filtrado automático */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
        Los filtros se aplican automáticamente
      </p>
    </div>
  );
}

export default MapFilters;
