import { useState, useRef, useEffect } from 'react';

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
  maxHeight?: string;
  searchable?: boolean;
  disabled?: boolean;
}

function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar opciones...',
  label,
  maxHeight = 'max-h-60',
  searchable = true,
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar opciones según búsqueda
  const filteredOptions = searchable
    ? options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  // Toggle selección
  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  // Seleccionar/Deseleccionar todos
  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map((opt) => opt.value));
    }
  };

  // Obtener labels de las opciones seleccionadas
  const selectedLabels = options
    .filter((opt) => value.includes(opt.value))
    .map((opt) => opt.label);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg transition-colors ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-primary dark:hover:border-primary cursor-pointer'
        }`}
      >
        <span
          className={`text-sm ${
            value.length > 0
              ? 'text-gray-900 dark:text-gray-100'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {value.length > 0 ? `${value.length} seleccionado(s)` : placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-xl">
          {/* Search Bar */}
          {searchable && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {/* Select All */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleSelectAll}
              className="w-full text-left px-3 py-2 text-sm font-medium text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {value.length === options.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
            </button>
          </div>

          {/* Options List */}
          <div className={`overflow-y-auto ${maxHeight}`}>
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No se encontraron opciones
              </div>
            ) : (
              filteredOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center px-4 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={value.includes(option.value)}
                    onChange={() => !option.disabled && handleToggle(option.value)}
                    disabled={option.disabled}
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="ml-3 text-sm text-gray-900 dark:text-gray-100">
                    {option.label}
                  </span>
                </label>
              ))
            )}
          </div>

          {/* Selected Preview */}
          {value.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Seleccionados:</p>
              <div className="flex flex-wrap gap-1">
                {selectedLabels.map((label) => (
                  <span
                    key={label}
                    className="px-2 py-1 text-xs bg-primary/10 text-primary dark:bg-primary/20 rounded"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MultiSelect;
