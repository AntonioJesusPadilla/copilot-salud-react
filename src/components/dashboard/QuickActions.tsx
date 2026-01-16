import { useNavigate } from 'react-router-dom';
import { RoleConfig } from '../../types';
import ExportMenu, { ExportOption } from '../common/ExportMenu';

interface QuickActionsProps {
  roleConfig: RoleConfig;
  exportOptions?: ExportOption[];
  customActions?: React.ReactNode;
}

function QuickActions({ roleConfig, exportOptions, customActions }: QuickActionsProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
      <h3 className="font-bold text-lg mb-4 text-secondary dark:text-gray-100">
        🚀 Acciones Rápidas
      </h3>
      <div className="space-y-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200 font-medium"
        >
          📈 Ver KPIs
        </button>

        {roleConfig.permissions.canViewMaps && (
          <button
            onClick={() => navigate('/maps')}
            className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200 font-medium"
          >
            🗺️ Ver Mapas
          </button>
        )}

        {roleConfig.permissions.canAccessChat && (
          <button
            onClick={() => navigate('/chat')}
            className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200 font-medium"
          >
            💬 Chat AI
          </button>
        )}

        {roleConfig.permissions.canViewCapacity && (
          <button
            onClick={() => navigate('/capacity')}
            className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200 font-medium"
          >
            🏥 Gestión Capacidad
          </button>
        )}

        {roleConfig.permissions.canViewFinancial && (
          <button
            onClick={() => navigate('/financial')}
            className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200 font-medium"
          >
            💰 Dashboard Financiero
          </button>
        )}

        {roleConfig.permissions.canViewReports && (
          <button
            onClick={() => navigate('/reports')}
            className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200 font-medium"
          >
            📊 Informes y Análisis
          </button>
        )}

        {customActions}

        {roleConfig.permissions.canExport && exportOptions && exportOptions.length > 0 && (
          <div className="w-full">
            <ExportMenu
              options={exportOptions}
              buttonLabel="Exportar Datos"
              buttonIcon="📥"
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default QuickActions;
