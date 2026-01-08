import { useState } from 'react';
import { AdvancedFilters as IAdvancedFilters } from '../../types/filters';
import { KPI_CATEGORY_CONFIGS, KPICategory, KPITrend } from '../../types/kpi';
import { PROVINCIAS_ANDALUCIA } from '../../types';
import DateRangePicker from './DateRangePicker';

interface AdvancedFiltersProps {
  filters: IAdvancedFilters;
  onFiltersChange: (filters: IAdvancedFilters) => void;
  onApply: () => void;
  onClear: () => void;
  mode?: 'kpi' | 'center' | 'all';
  className?: string;
}

function AdvancedFilters({
  filters,
  onFiltersChange,
  onApply,
  onClear,
  mode = 'all',
  className = '',
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Contar filtros activos
  const countActiveFilters = () => {
    let count = 0;
    if (filters.provinces && filters.provinces.length > 0 && !filters.provinces.includes('Todas')) count++;
    if (filters.categories && filters.categories.length > 0) count++;
    if (filters.trends && filters.trends.length > 0) count++;
    if (filters.dateRange?.startDate && filters.dateRange?.endDate) count++;
    if (filters.minValue !== undefined || filters.maxValue !== undefined) count++;
    if (filters.searchTerm) count++;
    return count;
  };

  const activeFiltersCount = countActiveFilters();

  // Manejar selección múltiple
  const toggleArrayFilter = <T,>(key: keyof IAdvancedFilters, value: T) => {
    const currentArray = (filters[key] as T[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    onFiltersChange({
      ...filters,
      [key]: newArray.length > 0 ? newArray : undefined,
    });
  };

  // Tendencias configuración
  const trendConfigs = [
    { value: 'up' as KPITrend, label: 'Creciente', icon: '📈', color: '#10B981' },
    { value: 'down' as KPITrend, label: 'Decreciente', icon: '📉', color: '#EF4444' },
    { value: 'stable' as KPITrend, label: 'Estable', icon: '➡️', color: '#6B7280' },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-800">⚙️ Filtros Avanzados</h3>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-1 bg-primary text-white text-xs font-bold rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Contenido de filtros */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Provincias */}
          {(mode === 'all' || mode === 'kpi') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                🗺️ Provincias
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PROVINCIAS_ANDALUCIA.map((provincia) => {
                  const isSelected = filters.provinces?.includes(provincia);
                  return (
                    <button
                      key={provincia}
                      onClick={() => toggleArrayFilter('provinces', provincia)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {provincia}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Categorías de KPIs */}
          {(mode === 'all' || mode === 'kpi') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                📊 Categorías
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(KPI_CATEGORY_CONFIGS).map((config) => {
                  const isSelected = filters.categories?.includes(config.category);
                  return (
                    <button
                      key={config.category}
                      onClick={() =>
                        toggleArrayFilter<KPICategory>('categories', config.category)
                      }
                      className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-opacity-100 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        borderColor: isSelected ? config.color : undefined,
                        backgroundColor: isSelected ? `${config.color}15` : undefined,
                      }}
                    >
                      <span className="mr-2">{config.icon}</span>
                      {config.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tendencias */}
          {(mode === 'all' || mode === 'kpi') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                📈 Tendencias
              </label>
              <div className="grid grid-cols-3 gap-2">
                {trendConfigs.map((trend) => {
                  const isSelected = filters.trends?.includes(trend.value);
                  return (
                    <button
                      key={trend.value}
                      onClick={() => toggleArrayFilter<KPITrend>('trends', trend.value)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        borderColor: isSelected ? trend.color : undefined,
                        backgroundColor: isSelected ? `${trend.color}15` : undefined,
                        color: isSelected ? trend.color : undefined,
                      }}
                    >
                      <span className="mr-1">{trend.icon}</span>
                      {trend.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rango de valores */}
          {(mode === 'all' || mode === 'kpi') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                📊 Rango de Valores
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Mínimo</label>
                  <input
                    type="number"
                    value={filters.minValue || ''}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        minValue: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Máximo</label>
                  <input
                    type="number"
                    value={filters.maxValue || ''}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        maxValue: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="1000"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Rango de fechas */}
          {(mode === 'all' || mode === 'kpi') && (
            <DateRangePicker
              value={
                filters.dateRange || {
                  startDate: null,
                  endDate: null,
                  preset: 'last30days',
                }
              }
              onChange={(dateRange) =>
                onFiltersChange({
                  ...filters,
                  dateRange,
                })
              }
            />
          )}

          {/* Ordenamiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              🔄 Ordenar por
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={filters.sortBy || 'relevance'}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    sortBy: e.target.value as any,
                  })
                }
                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="relevance">Relevancia</option>
                <option value="name">Nombre</option>
                <option value="value">Valor</option>
                <option value="trend">Tendencia</option>
                <option value="date">Fecha</option>
              </select>

              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    sortOrder: e.target.value as 'asc' | 'desc',
                  })
                }
                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="desc">Descendente ↓</option>
                <option value="asc">Ascendente ↑</option>
              </select>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onApply}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={onClear}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Resumen compacto cuando está colapsado */}
      {!isExpanded && activeFiltersCount > 0 && (
        <div className="p-3 text-sm text-gray-600">
          <span className="font-medium">{activeFiltersCount} filtro(s) activo(s)</span>
        </div>
      )}
    </div>
  );
}

export default AdvancedFilters;
