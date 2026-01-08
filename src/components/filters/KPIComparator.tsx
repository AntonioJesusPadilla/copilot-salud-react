import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useFilterStore from '../../store/filterStore';
import useKPIStore from '../../store/kpiStore';
import { ComparisonPeriod } from '../../types/filters';

interface KPIComparatorProps {
  className?: string;
}

function KPIComparator({ className = '' }: KPIComparatorProps) {
  const [selectedKPIId, setSelectedKPIId] = useState<string>('');
  const [periods, setPeriods] = useState<ComparisonPeriod[]>([
    {
      label: 'Período 1',
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
    {
      label: 'Período 2',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    },
  ]);
  const [showPercentageChange, setShowPercentageChange] = useState(true);
  const [showAbsoluteChange, setShowAbsoluteChange] = useState(true);

  const { kpis } = useKPIStore();
  const { setComparison, compareKPIs, comparisonResults, isComparingKPIs, clearComparison } =
    useFilterStore();

  // Actualizar comparación cuando cambien los parámetros
  useEffect(() => {
    if (selectedKPIId && periods.length >= 2) {
      setComparison({
        kpiId: selectedKPIId,
        periods,
        showPercentageChange,
        showAbsoluteChange,
      });
    }
  }, [selectedKPIId, periods, showPercentageChange, showAbsoluteChange, setComparison]);

  // Ejecutar comparación
  const handleCompare = () => {
    if (selectedKPIId && periods.length >= 2) {
      compareKPIs();
    }
  };

  // Formatear fecha para input
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Actualizar período
  const updatePeriod = (
    index: number,
    field: 'label' | 'startDate' | 'endDate',
    value: string | Date
  ) => {
    const newPeriods = [...periods];
    if (field === 'label') {
      newPeriods[index].label = value as string;
    } else {
      newPeriods[index][field] = new Date(value);
    }
    setPeriods(newPeriods);
  };

  // Agregar período
  const addPeriod = () => {
    if (periods.length < 4) {
      setPeriods([
        ...periods,
        {
          label: `Período ${periods.length + 1}`,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
        },
      ]);
    }
  };

  // Eliminar período
  const removePeriod = (index: number) => {
    if (periods.length > 2) {
      setPeriods(periods.filter((_, i) => i !== index));
    }
  };

  // Preparar datos para el gráfico
  const chartData =
    comparisonResults.length > 0
      ? comparisonResults[0].comparisons.map((comp) => ({
          name: comp.period.label,
          valor: comp.value,
          cambio: comp.change || 0,
          cambioPorc: comp.changePercentage || 0,
        }))
      : [];

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">📊 Comparador de KPIs</h3>
        <p className="text-sm text-gray-600 mt-1">
          Compara valores de un KPI entre diferentes períodos
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Selector de KPI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar KPI
          </label>
          <select
            value={selectedKPIId}
            onChange={(e) => setSelectedKPIId(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="">-- Selecciona un KPI --</option>
            {kpis.map((kpi) => (
              <option key={kpi.id} value={kpi.id}>
                {kpi.icon} {kpi.name}
              </option>
            ))}
          </select>
        </div>

        {/* Períodos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Períodos a Comparar
            </label>
            <button
              onClick={addPeriod}
              disabled={periods.length >= 4}
              className="px-3 py-1 text-sm bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Agregar Período
            </button>
          </div>

          <div className="space-y-3">
            {periods.map((period, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg border-2 border-gray-200"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    {/* Nombre del período */}
                    <input
                      type="text"
                      value={period.label}
                      onChange={(e) => updatePeriod(index, 'label', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                      placeholder="Nombre del período"
                    />

                    {/* Fechas */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Inicio
                        </label>
                        <input
                          type="date"
                          value={formatDateForInput(period.startDate)}
                          onChange={(e) =>
                            updatePeriod(index, 'startDate', e.target.value)
                          }
                          className="w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Fin
                        </label>
                        <input
                          type="date"
                          value={formatDateForInput(period.endDate)}
                          onChange={(e) =>
                            updatePeriod(index, 'endDate', e.target.value)
                          }
                          className="w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botón eliminar */}
                  {periods.length > 2 && (
                    <button
                      onClick={() => removePeriod(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar período"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opciones de visualización */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mostrar Cambios
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPercentageChange}
                onChange={(e) => setShowPercentageChange(e.target.checked)}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">Cambio porcentual (%)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAbsoluteChange}
                onChange={(e) => setShowAbsoluteChange(e.target.checked)}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">Cambio absoluto</span>
            </label>
          </div>
        </div>

        {/* Botón comparar */}
        <button
          onClick={handleCompare}
          disabled={!selectedKPIId || isComparingKPIs}
          className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isComparingKPIs ? 'Comparando...' : 'Comparar Períodos'}
        </button>

        {/* Resultados */}
        {comparisonResults.length > 0 && chartData.length > 0 && (
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-md font-bold text-gray-800 mb-4">
              Resultados de Comparación
            </h4>

            {/* Gráfico */}
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Valor"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Tabla de resultados */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">
                      Período
                    </th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-700">
                      Valor
                    </th>
                    {showAbsoluteChange && (
                      <th className="px-4 py-2 text-right font-semibold text-gray-700">
                        Cambio
                      </th>
                    )}
                    {showPercentageChange && (
                      <th className="px-4 py-2 text-right font-semibold text-gray-700">
                        Cambio %
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {comparisonResults[0].comparisons.map((comp) => (
                    <tr key={comp.period.label} className="border-t border-gray-200">
                      <td className="px-4 py-2 font-medium">{comp.period.label}</td>
                      <td className="px-4 py-2 text-right font-semibold">
                        {comp.value.toFixed(2)}
                      </td>
                      {showAbsoluteChange && (
                        <td
                          className={`px-4 py-2 text-right font-semibold ${
                            comp.change && comp.change > 0
                              ? 'text-green-600'
                              : comp.change && comp.change < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {comp.change !== undefined
                            ? `${comp.change > 0 ? '+' : ''}${comp.change.toFixed(2)}`
                            : '-'}
                        </td>
                      )}
                      {showPercentageChange && (
                        <td
                          className={`px-4 py-2 text-right font-semibold ${
                            comp.changePercentage && comp.changePercentage > 0
                              ? 'text-green-600'
                              : comp.changePercentage && comp.changePercentage < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {comp.changePercentage !== undefined
                            ? `${comp.changePercentage > 0 ? '+' : ''}${comp.changePercentage.toFixed(
                                1
                              )}%`
                            : '-'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Botón limpiar */}
            <button
              onClick={clearComparison}
              className="mt-4 w-full px-4 py-2 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all"
            >
              Limpiar Comparación
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default KPIComparator;
