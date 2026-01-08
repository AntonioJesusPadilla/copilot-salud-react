import { useState, useRef, useEffect } from 'react';

export interface ExportOption {
  id: string;
  label: string;
  icon: string;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
}

interface ExportMenuProps {
  options: ExportOption[];
  buttonLabel?: string;
  buttonIcon?: string;
  className?: string;
}

/**
 * Componente de menú desplegable para opciones de exportación
 * Subsistema 11: Sistema de Exportación
 */
function ExportMenu({
  options,
  buttonLabel = 'Exportar',
  buttonIcon = '📥',
  className = ''
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleOptionClick = async (option: ExportOption) => {
    if (option.disabled) return;

    try {
      setIsLoading(true);
      setIsOpen(false);
      await option.onClick();
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="w-full flex items-center justify-between px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
      >
        <span>{buttonIcon}</span>
        <span>{isLoading ? 'Exportando...' : buttonLabel}</span>
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Menú desplegable */}
      {isOpen && !isLoading && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option)}
                disabled={option.disabled}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-100 last:border-0"
              >
                <span className="text-xl">{option.icon}</span>
                <span className="text-gray-700 font-medium text-sm">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay de loading */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-gray-700 font-medium">Exportando...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExportMenu;
