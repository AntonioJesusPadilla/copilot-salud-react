import { KPI } from '../../types/kpi';
import { kpiService } from '../../services/kpiService';

interface KPICardProps {
  kpi: KPI;
  onClick?: (kpi: KPI) => void;
  compact?: boolean;
}

function KPICard({ kpi, onClick, compact = false }: KPICardProps) {
  const formattedValue = kpiService.formatKPIValue(kpi);
  const trendText = kpiService.getTrendText(kpi.trend, kpi.changePercentage);
  const trendColor = kpiService.getTrendColor(kpi.trend);

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all border-l-4 ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      } ${compact ? 'p-4' : 'p-6'}`}
      style={{ borderColor: kpi.color || '#3B82F6' }}
      onClick={() => onClick && onClick(kpi)}
    >
      {/* Header con icono y categoría */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {kpi.icon && <span className="text-2xl">{kpi.icon}</span>}
          <div>
            <h3
              className={`font-bold text-gray-800 ${compact ? 'text-sm' : 'text-base'}`}
              title={kpi.name}
            >
              {kpi.name}
            </h3>
            {!compact && (
              <p className="text-xs text-gray-500 mt-0.5">{kpi.category.replace('_', ' ')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Valor principal */}
      <div className="mb-3">
        <div className="flex items-baseline space-x-2">
          <span
            className={`font-bold ${compact ? 'text-2xl' : 'text-3xl'}`}
            style={{ color: kpi.color || '#3B82F6' }}
          >
            {formattedValue}
          </span>
          {kpi.unit && !kpi.format && (
            <span className="text-sm text-gray-500">{kpi.unit}</span>
          )}
        </div>

        {/* Tendencia y cambio */}
        {kpi.changePercentage !== undefined && (
          <div className="flex items-center space-x-1 mt-2">
            <span
              className="text-sm font-semibold"
              style={{ color: trendColor }}
            >
              {trendText}
            </span>
            <span className="text-xs text-gray-500">vs mes anterior</span>
          </div>
        )}
      </div>

      {/* Descripción */}
      {!compact && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2" title={kpi.description}>
          {kpi.description}
        </p>
      )}

      {/* Footer con metadatos */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
        <span title={kpi.source}>📊 {kpi.source.split('-')[0].trim()}</span>
        <span>
          {new Date(kpi.lastUpdated).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
          })}
        </span>
      </div>

      {/* Indicador de nivel de acceso (opcional, para debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-400">
          Nivel: {kpi.accessLevel}
        </div>
      )}
    </div>
  );
}

export default KPICard;
