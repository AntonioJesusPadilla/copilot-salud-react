import { useState, useMemo } from 'react';
import {
  Directive,
  DirectiveCategory,
  DirectivePriority,
  DirectiveStatus,
  DIRECTIVE_CATEGORY_CONFIGS,
  DIRECTIVE_PRIORITY_CONFIGS,
  sortDirectivesByPriority,
} from '../../types/analysis';

// ============================================================================
// TIPOS
// ============================================================================

export interface DirectivesPanelProps {
  directives: Directive[];
  title?: string;
  maxItems?: number;
  showFilters?: boolean;
  showActions?: boolean;
  onStatusChange?: (id: string, status: DirectiveStatus) => void;
  onAssign?: (id: string, assignedTo: string) => void;
  onViewDetail?: (directive: Directive) => void;
  compact?: boolean;
}

// ============================================================================
// COMPONENTE DE FILTROS
// ============================================================================

interface FiltersProps {
  categoryFilter: DirectiveCategory | 'all';
  priorityFilter: DirectivePriority | 'all';
  statusFilter: DirectiveStatus | 'all';
  onCategoryChange: (category: DirectiveCategory | 'all') => void;
  onPriorityChange: (priority: DirectivePriority | 'all') => void;
  onStatusChange: (status: DirectiveStatus | 'all') => void;
}

function Filters({
  categoryFilter,
  priorityFilter,
  statusFilter,
  onCategoryChange,
  onPriorityChange,
  onStatusChange,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {/* Filtro de categoría */}
      <select
        value={categoryFilter}
        onChange={(e) => onCategoryChange(e.target.value as DirectiveCategory | 'all')}
        className="text-sm px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
      >
        <option value="all">Todas las categorías</option>
        {(Object.keys(DIRECTIVE_CATEGORY_CONFIGS) as DirectiveCategory[]).map((cat) => (
          <option key={cat} value={cat}>
            {DIRECTIVE_CATEGORY_CONFIGS[cat].icon} {DIRECTIVE_CATEGORY_CONFIGS[cat].label}
          </option>
        ))}
      </select>

      {/* Filtro de prioridad */}
      <select
        value={priorityFilter}
        onChange={(e) => onPriorityChange(e.target.value as DirectivePriority | 'all')}
        className="text-sm px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
      >
        <option value="all">Todas las prioridades</option>
        {(Object.keys(DIRECTIVE_PRIORITY_CONFIGS) as DirectivePriority[]).map((pri) => (
          <option key={pri} value={pri}>
            {DIRECTIVE_PRIORITY_CONFIGS[pri].icon} {DIRECTIVE_PRIORITY_CONFIGS[pri].label}
          </option>
        ))}
      </select>

      {/* Filtro de estado */}
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as DirectiveStatus | 'all')}
        className="text-sm px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
      >
        <option value="all">Todos los estados</option>
        <option value="pending">Pendiente</option>
        <option value="in_progress">En progreso</option>
        <option value="completed">Completada</option>
        <option value="dismissed">Descartada</option>
      </select>
    </div>
  );
}

// ============================================================================
// COMPONENTE DE ITEM DE DIRECTIVA
// ============================================================================

interface DirectiveItemProps {
  directive: Directive;
  compact?: boolean;
  showActions?: boolean;
  onStatusChange?: (id: string, status: DirectiveStatus) => void;
  onViewDetail?: (directive: Directive) => void;
}

function DirectiveItem({
  directive,
  compact = false,
  showActions = true,
  onStatusChange,
  onViewDetail,
}: DirectiveItemProps) {
  const categoryConfig = DIRECTIVE_CATEGORY_CONFIGS[directive.category];
  const priorityConfig = DIRECTIVE_PRIORITY_CONFIGS[directive.priority];

  const statusColors: Record<DirectiveStatus, string> = {
    pending: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    dismissed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };

  const statusLabels: Record<DirectiveStatus, string> = {
    pending: 'Pendiente',
    in_progress: 'En progreso',
    completed: 'Completada',
    dismissed: 'Descartada',
  };

  const formatCurrency = (value: number): string => {
    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M €`;
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}K €`;
    return `${value.toLocaleString('es-ES')} €`;
  };

  return (
    <div
      className={`border-l-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow ${
        compact ? 'p-3' : 'p-4'
      }`}
      style={{ borderLeftColor: priorityConfig.color }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{categoryConfig.icon}</span>
          <div>
            <h4
              className={`font-semibold text-gray-800 dark:text-gray-100 ${compact ? 'text-sm' : 'text-base'}`}
            >
              {directive.title}
            </h4>
            {!compact && directive.hospital && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {directive.hospital}
                {directive.departamento && ` • ${directive.departamento}`}
              </p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center space-x-2">
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: priorityConfig.bgColor,
              color: priorityConfig.color,
            }}
          >
            {priorityConfig.icon} {priorityConfig.label}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[directive.status]}`}
          >
            {statusLabels[directive.status]}
          </span>
        </div>
      </div>

      {/* Descripción */}
      {!compact && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {directive.description}
        </p>
      )}

      {/* Métricas */}
      <div className={`grid gap-2 mb-3 ${compact ? 'grid-cols-2' : 'grid-cols-4'}`}>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <p className="text-xs text-gray-500 dark:text-gray-400">Actual</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {directive.currentValue.toLocaleString('es-ES')}
          </p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <p className="text-xs text-gray-500 dark:text-gray-400">Objetivo</p>
          <p className="text-sm font-semibold text-green-600">
            {directive.targetValue.toLocaleString('es-ES')}
          </p>
        </div>
        {!compact && (
          <>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
              <p className="text-xs text-gray-500 dark:text-gray-400">Mejora esperada</p>
              <p className="text-sm font-semibold text-blue-600">
                +{directive.improvement.toFixed(1)}%
              </p>
            </div>
            {directive.estimatedImpact.financial && (
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                <p className="text-xs text-gray-500 dark:text-gray-400">Impacto financiero</p>
                <p className="text-sm font-semibold text-green-600">
                  {formatCurrency(directive.estimatedImpact.financial)}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Acciones recomendadas (solo si no es compact) */}
      {!compact && directive.actions.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Acciones recomendadas:
          </p>
          <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
            {directive.actions.slice(0, 3).map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Botones de acción */}
      {showActions && directive.status !== 'completed' && directive.status !== 'dismissed' && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            {directive.status === 'pending' && (
              <button
                onClick={() => onStatusChange?.(directive.id, 'in_progress')}
                className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Iniciar
              </button>
            )}
            {directive.status === 'in_progress' && (
              <button
                onClick={() => onStatusChange?.(directive.id, 'completed')}
                className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Completar
              </button>
            )}
            <button
              onClick={() => onStatusChange?.(directive.id, 'dismissed')}
              className="text-xs px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Descartar
            </button>
          </div>
          {onViewDetail && (
            <button
              onClick={() => onViewDetail(directive)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Ver detalle
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

function DirectivesPanel({
  directives,
  title = 'Directivas y Recomendaciones',
  maxItems = 10,
  showFilters = true,
  showActions = true,
  onStatusChange,
  onAssign,
  onViewDetail,
  compact = false,
}: DirectivesPanelProps) {
  // Estado de filtros
  const [categoryFilter, setCategoryFilter] = useState<DirectiveCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<DirectivePriority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<DirectiveStatus | 'all'>('all');

  // Filtrar y ordenar directivas
  const filteredDirectives = useMemo(() => {
    let filtered = [...directives];

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((d) => d.category === categoryFilter);
    }
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((d) => d.priority === priorityFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    return sortDirectivesByPriority(filtered).slice(0, maxItems);
  }, [directives, categoryFilter, priorityFilter, statusFilter, maxItems]);

  // Contadores
  const counts = useMemo(
    () => ({
      total: directives.length,
      urgent: directives.filter((d) => d.priority === 'urgent').length,
      high: directives.filter((d) => d.priority === 'high').length,
      pending: directives.filter((d) => d.status === 'pending').length,
      inProgress: directives.filter((d) => d.status === 'in_progress').length,
    }),
    [directives]
  );

  // Ignorar onAssign si no se usa (prevenir warning ESLint)
  void onAssign;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {counts.total} directivas • {counts.urgent + counts.high} urgentes/altas •{' '}
            {counts.pending} pendientes
          </p>
        </div>

        {/* Indicadores de urgencia */}
        <div className="flex items-center space-x-2">
          {counts.urgent > 0 && (
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
              {counts.urgent} urgentes
            </span>
          )}
          {counts.high > 0 && (
            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
              {counts.high} alta prioridad
            </span>
          )}
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Filters
          categoryFilter={categoryFilter}
          priorityFilter={priorityFilter}
          statusFilter={statusFilter}
          onCategoryChange={setCategoryFilter}
          onPriorityChange={setPriorityFilter}
          onStatusChange={setStatusFilter}
        />
      )}

      {/* Lista de directivas */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {filteredDirectives.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-lg mb-2">Sin directivas</p>
            <p className="text-sm">No hay directivas que coincidan con los filtros seleccionados</p>
          </div>
        ) : (
          filteredDirectives.map((directive) => (
            <DirectiveItem
              key={directive.id}
              directive={directive}
              compact={compact}
              showActions={showActions}
              onStatusChange={onStatusChange}
              onViewDetail={onViewDetail}
            />
          ))
        )}
      </div>

      {/* Ver más */}
      {directives.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Ver todas las directivas ({directives.length})
          </button>
        </div>
      )}
    </div>
  );
}

export default DirectivesPanel;
