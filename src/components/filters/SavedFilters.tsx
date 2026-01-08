import { useState } from 'react';
import useFilterStore from '../../store/filterStore';

interface SavedFiltersProps {
  onFilterLoad?: () => void;
  className?: string;
}

function SavedFilters({ onFilterLoad, className = '' }: SavedFiltersProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterDescription, setFilterDescription] = useState('');

  const {
    savedFilters,
    saveFilter,
    loadSavedFilter,
    deleteSavedFilter,
    toggleFavoriteFilter,
  } = useFilterStore();

  // Ordenar filtros: favoritos primero, luego por uso
  const sortedFilters = [...savedFilters].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.useCount - a.useCount;
  });

  // Guardar filtro actual
  const handleSave = () => {
    if (filterName.trim()) {
      saveFilter(filterName.trim(), filterDescription.trim() || undefined);
      setFilterName('');
      setFilterDescription('');
      setShowSaveDialog(false);
    }
  };

  // Cargar filtro guardado
  const handleLoad = (filterId: string) => {
    loadSavedFilter(filterId);
    onFilterLoad?.();
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">⭐ Filtros Guardados</h3>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="px-3 py-1.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors"
          >
            + Guardar Actual
          </button>
        </div>
      </div>

      {/* Lista de filtros guardados */}
      <div className="p-4">
        {sortedFilters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl block mb-2">📋</span>
            <p className="font-medium">No hay filtros guardados</p>
            <p className="text-sm mt-1">
              Guarda tus filtros favoritos para acceder rápidamente
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedFilters.map((filter) => (
              <div
                key={filter.id}
                className="p-3 border-2 border-gray-200 rounded-lg hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  {/* Información del filtro */}
                  <button
                    onClick={() => handleLoad(filter.id)}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {filter.isFavorite && <span className="text-yellow-500">⭐</span>}
                      <h4 className="font-semibold text-gray-800">{filter.name}</h4>
                    </div>
                    {filter.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {filter.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>📅 {formatDate(filter.createdAt)}</span>
                      <span>🔄 Usado {filter.useCount} veces</span>
                      {filter.lastUsed && (
                        <span>⏱️ Último: {formatDate(filter.lastUsed)}</span>
                      )}
                    </div>
                  </button>

                  {/* Acciones */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFavoriteFilter(filter.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title={
                        filter.isFavorite
                          ? 'Quitar de favoritos'
                          : 'Marcar como favorito'
                      }
                    >
                      {filter.isFavorite ? '⭐' : '☆'}
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            '¿Estás seguro de que quieres eliminar este filtro?'
                          )
                        ) {
                          deleteSavedFilter(filter.id);
                        }
                      }}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      title="Eliminar filtro"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Diálogo para guardar filtro */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Guardar Filtro Actual
            </h3>

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del filtro *
                </label>
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="Ej: Filtro KPIs Málaga"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  autoFocus
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={filterDescription}
                  onChange={(e) => setFilterDescription(e.target.value)}
                  placeholder="Breve descripción del filtro..."
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={!filterName.trim()}
                className="flex-1 bg-gradient-to-r from-primary to-accent text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setFilterName('');
                  setFilterDescription('');
                }}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedFilters;
