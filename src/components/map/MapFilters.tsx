import { useState, useEffect } from 'react';
import { HealthCenterType, HEALTH_CENTER_TYPE_CONFIGS, MapFilters as IMapFilters } from '../../types/map';

interface MapFiltersProps {
  filters: IMapFilters;
  stats: {
    total: number;
    byType: Record<string, number>;
    withEmergency: number;
  } | null;
  onFiltersChange: (filters: IMapFilters) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

function MapFilters({
  filters,
  stats,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
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

  // Aplicar filtros automáticamente cuando cambia el término de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onApplyFilters();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, onApplyFilters]);

  // Limpiar todos los filtros
  const handleClearAll = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setEmergencyOnly(false);
    onClearFilters();
  };

  // Contar filtros activos
  const activeFiltersCount =
    (selectedTypes.length > 0 ? 1 : 0) +
    (emergencyOnly ? 1 : 0) +
    (searchTerm ? 1 : 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Filtros del Mapa</h3>
          <p className="text-sm text-gray-600 mt-1">
            {stats?.total || 0} centros encontrados
          </p>
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Limpiar ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🔍 Buscar Centro
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Nombre, dirección o ciudad..."
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Filtro de tipos de centros */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
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
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{
                  borderColor: isSelected ? config.color : undefined,
                  backgroundColor: isSelected ? `${config.color}10` : undefined,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <p
                        className={`font-semibold ${
                          isSelected ? '' : 'text-gray-700'
                        }`}
                        style={{ color: isSelected ? config.color : undefined }}
                      >
                        {config.namePlural}
                      </p>
                      <p className="text-xs text-gray-500">{config.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: isSelected ? config.color : '#E5E7EB',
                        color: isSelected ? 'white' : '#6B7280',
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
              ? 'border-red-500 bg-red-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🚨</span>
              <div>
                <p
                  className={`font-semibold ${
                    emergencyOnly ? 'text-red-600' : 'text-gray-700'
                  }`}
                >
                  Solo Urgencias
                </p>
                <p className="text-xs text-gray-500">
                  Centros con atención de urgencias 24h
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold ${
                  emergencyOnly
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stats?.withEmergency || 0}
              </span>
              {emergencyOnly && <span className="text-green-500 font-bold">✓</span>}
            </div>
          </div>
        </button>
      </div>

      {/* Botón aplicar filtros */}
      <button
        onClick={onApplyFilters}
        className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
      >
        Aplicar Filtros
      </button>
    </div>
  );
}

export default MapFilters;
