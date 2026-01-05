import { useState } from 'react';
import { KPI, KPICategory, KPI_CATEGORY_CONFIGS } from '../../types/kpi';
import KPICard from './KPICard';
import KPIChart from './KPIChart';

interface KPIGridProps {
  kpis: KPI[];
  isLoading?: boolean;
  compact?: boolean;
}

function KPIGrid({ kpis, isLoading = false, compact = false }: KPIGridProps) {
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<KPICategory | 'all'>('all');

  // Filtrar KPIs por categoría seleccionada
  const filteredKPIs =
    selectedCategory === 'all'
      ? kpis
      : kpis.filter((kpi) => kpi.category === selectedCategory);

  // Contar KPIs por categoría
  const categoryCounts: Record<string, number> = {};
  kpis.forEach((kpi) => {
    categoryCounts[kpi.category] = (categoryCounts[kpi.category] || 0) + 1;
  });

  // Cerrar modal de detalles
  const closeModal = () => {
    setSelectedKPI(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando KPIs...</p>
        </div>
      </div>
    );
  }

  if (kpis.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <p className="text-xl text-gray-500 mb-2">No hay KPIs disponibles</p>
        <p className="text-sm text-gray-400">
          No se encontraron indicadores con los criterios seleccionados
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filtros por categoría */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedCategory === 'all'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          Todos ({kpis.length})
        </button>

        {Object.values(KPI_CATEGORY_CONFIGS).map((config) => {
          const count = categoryCounts[config.category] || 0;
          if (count === 0) return null;

          return (
            <button
              key={config.category}
              onClick={() => setSelectedCategory(config.category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === config.category
                  ? 'text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
              }`}
              style={{
                backgroundColor:
                  selectedCategory === config.category ? config.color : undefined,
              }}
            >
              {config.icon} {config.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid de KPIs */}
      <div
        className={`grid gap-6 ${
          compact
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {filteredKPIs.map((kpi) => (
          <KPICard
            key={kpi.id}
            kpi={kpi}
            onClick={setSelectedKPI}
            compact={compact}
          />
        ))}
      </div>

      {/* Modal de detalles del KPI */}
      {selectedKPI && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div
              className="p-6 border-b-4 flex items-center justify-between"
              style={{ borderColor: selectedKPI.color || '#3B82F6' }}
            >
              <div className="flex items-center space-x-3">
                {selectedKPI.icon && <span className="text-3xl">{selectedKPI.icon}</span>}
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedKPI.name}</h2>
                  <p className="text-sm text-gray-500">
                    {KPI_CATEGORY_CONFIGS[selectedKPI.category].name}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-6">
              {/* Descripción */}
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">Descripción</h3>
                <p className="text-gray-600">{selectedKPI.description}</p>
              </div>

              {/* Valor actual y tendencia */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Valor Actual</p>
                    <p
                      className="text-4xl font-bold"
                      style={{ color: selectedKPI.color || '#3B82F6' }}
                    >
                      {selectedKPI.currentValue.toLocaleString('es-ES')} {selectedKPI.unit}
                    </p>
                  </div>
                  {selectedKPI.previousValue && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Valor Anterior</p>
                      <p className="text-3xl font-semibold text-gray-500">
                        {selectedKPI.previousValue.toLocaleString('es-ES')} {selectedKPI.unit}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Gráfico de tendencia */}
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-4">Tendencia Histórica</h3>
                <KPIChart kpi={selectedKPI} height={250} />
              </div>

              {/* Metadatos */}
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-gray-600 mb-1">Fuente de Datos</p>
                  <p className="font-semibold text-gray-800">{selectedKPI.source}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-gray-600 mb-1">Última Actualización</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(selectedKPI.lastUpdated).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                {selectedKPI.province && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-gray-600 mb-1">Provincia</p>
                    <p className="font-semibold text-gray-800">{selectedKPI.province}</p>
                  </div>
                )}
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-gray-600 mb-1">Nivel de Acceso</p>
                  <p className="font-semibold text-gray-800 capitalize">
                    {selectedKPI.accessLevel}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KPIGrid;
