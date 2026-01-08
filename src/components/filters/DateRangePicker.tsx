import { useState } from 'react';
import { DateRangeFilter, DATE_RANGE_PRESETS } from '../../types/filters';

interface DateRangePickerProps {
  value: DateRangeFilter;
  onChange: (dateRange: DateRangeFilter) => void;
  label?: string;
  className?: string;
}

function DateRangePicker({
  value,
  onChange,
  label = 'Rango de Fechas',
  className = '',
}: DateRangePickerProps) {
  const [showCustom, setShowCustom] = useState(value.preset === 'custom');

  // Manejar selección de preset
  const handlePresetChange = (preset: string) => {
    if (preset === 'custom') {
      setShowCustom(true);
      onChange({
        startDate: null,
        endDate: null,
        preset: 'custom',
      });
    } else {
      setShowCustom(false);
      onChange(DATE_RANGE_PRESETS[preset]);
    }
  };

  // Manejar cambio de fecha personalizada
  const handleDateChange = (type: 'start' | 'end', dateString: string) => {
    const newDate = dateString ? new Date(dateString) : null;

    if (type === 'start') {
      onChange({
        ...value,
        startDate: newDate,
        preset: 'custom',
      });
    } else {
      onChange({
        ...value,
        endDate: newDate,
        preset: 'custom',
      });
    }
  };

  // Formatear fecha para input
  const formatDateForInput = (date: Date | null) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Configuración de presets
  const presets = [
    { value: 'last7days', label: 'Últimos 7 días', icon: '📅' },
    { value: 'last30days', label: 'Últimos 30 días', icon: '📆' },
    { value: 'last3months', label: 'Últimos 3 meses', icon: '🗓️' },
    { value: 'last6months', label: 'Últimos 6 meses', icon: '📊' },
    { value: 'lastYear', label: 'Último año', icon: '📈' },
    { value: 'custom', label: 'Personalizado', icon: '⚙️' },
  ];

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          📅 {label}
        </label>
      )}

      {/* Presets */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetChange(preset.value)}
            className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
              value.preset === preset.value
                ? 'border-primary bg-primary/10 text-primary shadow-md'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="mr-1">{preset.icon}</span>
            {preset.label}
          </button>
        ))}
      </div>

      {/* Fechas personalizadas */}
      {showCustom && (
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha inicio */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Fecha inicio
              </label>
              <input
                type="date"
                value={formatDateForInput(value.startDate)}
                onChange={(e) => handleDateChange('start', e.target.value)}
                max={formatDateForInput(value.endDate || new Date())}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Fecha fin */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Fecha fin
              </label>
              <input
                type="date"
                value={formatDateForInput(value.endDate)}
                onChange={(e) => handleDateChange('end', e.target.value)}
                min={formatDateForInput(value.startDate)}
                max={formatDateForInput(new Date())}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Resumen del rango */}
          {value.startDate && value.endDate && (
            <div className="mt-3 text-sm text-gray-600 text-center">
              <span className="font-medium">
                {Math.ceil(
                  (value.endDate.getTime() - value.startDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{' '}
                días seleccionados
              </span>
            </div>
          )}
        </div>
      )}

      {/* Resumen del preset seleccionado */}
      {!showCustom && value.preset && value.startDate && value.endDate && (
        <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800 border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {value.startDate.toLocaleDateString('es-ES')} -{' '}
              {value.endDate.toLocaleDateString('es-ES')}
            </span>
            <span className="text-xs text-blue-600">
              {Math.ceil(
                (value.endDate.getTime() - value.startDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{' '}
              días
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;
