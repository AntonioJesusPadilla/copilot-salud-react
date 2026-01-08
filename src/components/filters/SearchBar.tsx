import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useFilterStore from '../../store/filterStore';
import { SearchScope } from '../../types/filters';

interface SearchBarProps {
  placeholder?: string;
  defaultScope?: SearchScope;
  onResultSelect?: () => void;
  className?: string;
}

function SearchBar({
  placeholder = 'Buscar KPIs, centros de salud...',
  defaultScope = 'all',
  onResultSelect,
  className = '',
}: SearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>(defaultScope);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { searchResults, isSearching, search, clearSearch } = useFilterStore();

  // Cerrar resultados al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ejecutar búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        search({ query, scope, limit: 10, minRelevance: 30 });
        setIsOpen(true);
      } else {
        clearSearch();
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, scope, search, clearSearch]);

  // Manejar selección de resultado
  const handleResultClick = (url?: string) => {
    if (url) {
      navigate(url);
    }
    setQuery('');
    clearSearch();
    setIsOpen(false);
    onResultSelect?.();
  };

  // Iconos por tipo de resultado
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'kpi':
        return '📊';
      case 'center':
        return '🏥';
      default:
        return '📄';
    }
  };

  // Color de fondo por tipo
  const getResultBgColor = (type: string) => {
    switch (type) {
      case 'kpi':
        return 'bg-blue-50';
      case 'center':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Barra de búsqueda */}
      <div className="flex items-center gap-2">
        {/* Selector de scope */}
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as SearchScope)}
          className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white text-sm font-medium"
        >
          <option value="all">🔍 Todo</option>
          <option value="kpis">📊 KPIs</option>
          <option value="centers">🏥 Centros</option>
        </select>

        {/* Campo de búsqueda */}
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2 pl-10 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </span>

          {/* Indicador de carga */}
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
            </div>
          )}

          {/* Botón limpiar */}
          {query && !isSearching && (
            <button
              onClick={() => {
                setQuery('');
                clearSearch();
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Resultados de búsqueda */}
      {isOpen && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border-2 border-gray-200 max-h-96 overflow-y-auto z-50">
          <div className="p-2">
            <div className="text-xs text-gray-500 px-3 py-2 font-semibold">
              {searchResults.length} resultado(s) encontrado(s)
            </div>

            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result.url)}
                className={`w-full text-left px-3 py-3 rounded-lg hover:shadow-md transition-all ${getResultBgColor(
                  result.type
                )} mb-2`}
              >
                <div className="flex items-start gap-3">
                  {/* Icono */}
                  <span className="text-2xl mt-0.5">{getResultIcon(result.type)}</span>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800 truncate">
                        {result.title}
                      </h4>
                      <span className="text-xs text-gray-500 font-medium px-2 py-0.5 bg-white rounded-full">
                        {result.relevance}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {result.description}
                    </p>

                    {/* Metadata */}
                    {result.metadata && (
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        {result.category && (
                          <span className="px-2 py-1 bg-white rounded-full">
                            {result.category}
                          </span>
                        )}
                        {result.metadata.trend && typeof result.metadata.trend === 'string' ? (
                          <span>
                            {result.metadata.trend === 'up' ? '📈' : null}
                            {result.metadata.trend === 'down' ? '📉' : null}
                            {result.metadata.trend === 'stable' ? '➡️' : null}
                          </span>
                        ) : null}
                        {result.metadata.value !== undefined && result.metadata.unit !== undefined && (
                          <span className="font-semibold">
                            {String(result.metadata.value)} {String(result.metadata.unit)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {isOpen && !isSearching && query.trim().length >= 2 && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border-2 border-gray-200 p-6 text-center z-50">
          <span className="text-4xl mb-2 block">🔍</span>
          <p className="text-gray-600 font-medium">No se encontraron resultados</p>
          <p className="text-sm text-gray-500 mt-1">
            Intenta con otros términos de búsqueda
          </p>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
