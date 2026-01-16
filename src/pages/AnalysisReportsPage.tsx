import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useFinancialStore from '../store/financialStore';
import useAnalysisStore from '../store/analysisStore';
import { ROLE_CONFIGS } from '../types';
import ThemeToggle from '../components/common/ThemeToggle';
import { DirectivesPanel } from '../components/financial';
import {
  TrendAnalysisWidget,
  AnomalyDetectionPanel,
  ComparisonInsights,
} from '../components/analysis';
import { financialAnalysisService } from '../services/financialAnalysisService';
import { DirectiveStatus } from '../types/analysis';

// ============================================================================
// TIPOS
// ============================================================================

type SectionId = 'trends' | 'anomalies' | 'comparisons' | 'directives';

interface Section {
  id: SectionId;
  label: string;
  icon: string;
  description: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const SECTIONS: Section[] = [
  {
    id: 'trends',
    label: 'Análisis de Tendencias',
    icon: '📈',
    description: 'Evolución de KPIs financieros clave',
  },
  {
    id: 'anomalies',
    label: 'Anomalías Detectadas',
    icon: '⚠️',
    description: 'Valores fuera de rango identificados',
  },
  {
    id: 'comparisons',
    label: 'Comparativas',
    icon: '🔄',
    description: 'Análisis comparativo entre períodos y hospitales',
  },
  {
    id: 'directives',
    label: 'Directrices Recomendadas',
    icon: '💡',
    description: 'Acciones priorizadas según análisis',
  },
];

// ============================================================================
// COMPONENTE DE RESUMEN
// ============================================================================

interface AnalysisSummaryProps {
  trendsCount: number;
  anomaliesCount: number;
  comparisonsCount: number;
  directivesCount: number;
  urgentDirectives: number;
  criticalAnomalies: number;
  lastAnalysisDate: string | null;
}

function AnalysisSummary({
  trendsCount,
  anomaliesCount,
  comparisonsCount,
  directivesCount,
  urgentDirectives,
  criticalAnomalies,
  lastAnalysisDate,
}: AnalysisSummaryProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No disponible';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Resumen del Análisis</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Última actualización: {formatDate(lastAnalysisDate)}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{trendsCount}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Tendencias</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {anomaliesCount}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Anomalías</p>
        </div>
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {comparisonsCount}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Comparativas</p>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{directivesCount}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Directrices</p>
        </div>
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{urgentDirectives}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Urgentes</p>
        </div>
        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {criticalAnomalies}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Críticas</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE DE NAVEGACIÓN DE SECCIONES
// ============================================================================

interface SectionNavigationProps {
  activeSection: SectionId | null;
  onSectionChange: (section: SectionId | null) => void;
}

function SectionNavigation({ activeSection, onSectionChange }: SectionNavigationProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onSectionChange(null)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeSection === null
            ? 'bg-primary text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        Ver Todo
      </button>
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionChange(section.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === section.id
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <span>{section.icon}</span>
          <span>{section.label}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

function AnalysisReportsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    financialKPIs,
    departmentBudgets,
    isLoading: isLoadingFinancial,
    loadFinancialData,
  } = useFinancialStore();
  const {
    trends,
    anomalies,
    directives,
    comparisons,
    lastAnalysisDate,
    isAnalyzing,
    setAnalysisResult,
    updateDirectiveStatus,
    getHighPriorityDirectives,
    getCriticalAnomalies,
  } = useAnalysisStore();

  // Estado local
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  // Cargar datos al montar
  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  // Ejecutar análisis cuando hay datos
  useEffect(() => {
    if (financialKPIs.length > 0 && departmentBudgets.length > 0) {
      const result = financialAnalysisService.runFullAnalysis(financialKPIs, departmentBudgets);
      setAnalysisResult(result);
    }
  }, [financialKPIs, departmentBudgets, setAnalysisResult]);

  // Manejadores
  const handleRunNewAnalysis = () => {
    if (financialKPIs.length > 0 && departmentBudgets.length > 0) {
      const result = financialAnalysisService.runFullAnalysis(financialKPIs, departmentBudgets);
      setAnalysisResult(result);
    }
  };

  const handleDirectiveStatusChange = (id: string, status: DirectiveStatus) => {
    updateDirectiveStatus(id, status);
  };

  // Guard de usuario
  if (!user) {
    return null;
  }

  const roleConfig = ROLE_CONFIGS[user.role];
  const isLoading = isLoadingFinancial || isAnalyzing;

  // Contadores
  const trendsCount = Object.keys(trends).length;
  const anomaliesCount = anomalies.length;
  const comparisonsCount = comparisons.length;
  const directivesCount = directives.length;
  const urgentDirectives = getHighPriorityDirectives().length;
  const criticalAnomalies = getCriticalAnomalies().length;

  // Renderizar contenido
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {isAnalyzing ? 'Ejecutando análisis...' : 'Cargando datos...'}
            </p>
          </div>
        </div>
      );
    }

    const shouldShow = (section: SectionId) => activeSection === null || activeSection === section;

    return (
      <div className="space-y-6">
        {/* Tendencias */}
        {shouldShow('trends') && (
          <TrendAnalysisWidget
            trends={trends}
            title="Análisis de Tendencias"
            showSparklines={true}
          />
        )}

        {/* Anomalías */}
        {shouldShow('anomalies') && (
          <AnomalyDetectionPanel
            anomalies={anomalies}
            title="Anomalías Detectadas"
            showFilters={true}
          />
        )}

        {/* Comparativas */}
        {shouldShow('comparisons') && (
          <ComparisonInsights insights={comparisons} title="Análisis Comparativo" groupBy="type" />
        )}

        {/* Directrices */}
        {shouldShow('directives') && (
          <DirectivesPanel
            directives={directives}
            title="Directrices y Recomendaciones"
            showFilters={true}
            showActions={true}
            onStatusChange={handleDirectiveStatusChange}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header
        className="bg-white dark:bg-gray-800 shadow-sm border-b-4 transition-colors"
        style={{ borderColor: roleConfig.color }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Lado izquierdo: Volver + Título */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Volver al Dashboard"
                aria-label="Volver al Dashboard"
              >
                ← <span className="hidden sm:inline">Volver</span>
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-secondary dark:text-gray-100">
                  📊 Análisis y Reportes
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tendencias, anomalías y recomendaciones
                </p>
              </div>
            </div>

            {/* Lado derecho */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Botón Generar Análisis */}
              <button
                onClick={handleRunNewAnalysis}
                disabled={isLoading}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                <span>🔄</span>
                <span>Nuevo Análisis</span>
              </button>

              <div className="text-right hidden md:block">
                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{roleConfig.name}</p>
              </div>
              <ThemeToggle />
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl"
                style={{ backgroundColor: `${roleConfig.color}20` }}
              >
                {roleConfig.icon}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Resumen */}
        <AnalysisSummary
          trendsCount={trendsCount}
          anomaliesCount={anomaliesCount}
          comparisonsCount={comparisonsCount}
          directivesCount={directivesCount}
          urgentDirectives={urgentDirectives}
          criticalAnomalies={criticalAnomalies}
          lastAnalysisDate={lastAnalysisDate}
        />

        {/* Navegación de secciones */}
        <SectionNavigation activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* Contenido */}
        {renderContent()}
      </main>

      {/* Footer con info */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <p>
              💡 Tip: Las directrices urgentes requieren atención inmediata para optimizar el
              rendimiento financiero.
            </p>
            <p>
              {directivesCount} directrices • {anomaliesCount} anomalías detectadas
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AnalysisReportsPage;
