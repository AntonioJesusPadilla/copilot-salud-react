import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useFinancialStore from '../store/financialStore';
import useAnalysisStore from '../store/analysisStore';
import { ROLE_CONFIGS } from '../types';
import ThemeToggle from '../components/common/ThemeToggle';
import {
  FinancialExecutiveDashboard,
  DepartmentFinancialAnalysis,
  HistoricalTrendsChart,
  BenchmarkingChart,
} from '../components/financial';
import { financialAnalysisService } from '../services/financialAnalysisService';

// ============================================================================
// TIPOS
// ============================================================================

type TabId = 'executive' | 'department' | 'trends' | 'benchmarking';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const TABS: Tab[] = [
  { id: 'executive', label: 'Vista Ejecutiva', icon: '📊' },
  { id: 'department', label: 'Por Departamento', icon: '🏥' },
  { id: 'trends', label: 'Tendencias', icon: '📈' },
  { id: 'benchmarking', label: 'Benchmarking', icon: '🎯' },
];

// ============================================================================
// COMPONENTE DE FILTROS GLOBALES
// ============================================================================

interface GlobalFiltersProps {
  selectedHospital: string | null;
  hospitals: string[];
  onHospitalChange: (hospital: string | null) => void;
  onExport: () => void;
}

function GlobalFilters({
  selectedHospital,
  hospitals,
  onHospitalChange,
  onExport,
}: GlobalFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Filtro de Hospital */}
      <select
        value={selectedHospital || 'all'}
        onChange={(e) => onHospitalChange(e.target.value === 'all' ? null : e.target.value)}
        className="text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        <option value="all">Todos los hospitales</option>
        {hospitals.map((hospital) => (
          <option key={hospital} value={hospital}>
            {hospital}
          </option>
        ))}
      </select>

      {/* Botón Exportar */}
      <button
        onClick={onExport}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
      >
        <span>📥</span>
        <span>Exportar Informe</span>
      </button>
    </div>
  );
}

// ============================================================================
// COMPONENTE DE TABS
// ============================================================================

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="flex space-x-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary dark:text-primary'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

function FinancialDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    departmentBudgets,
    financialKPIs,
    historicalTrends,
    hospitals,
    selectedHospital,
    stats,
    isLoading,
    error,
    loadFinancialData,
    setSelectedHospital,
  } = useFinancialStore();
  const { setAnalysisResult } = useAnalysisStore();

  // Estado local
  const [activeTab, setActiveTab] = useState<TabId>('executive');

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

  // Datos filtrados
  const filteredKPIs = useMemo(() => {
    if (!selectedHospital) return financialKPIs;
    return financialKPIs.filter((k) => k.hospital === selectedHospital);
  }, [financialKPIs, selectedHospital]);

  const filteredBudgets = useMemo(() => {
    if (!selectedHospital) return departmentBudgets;
    return departmentBudgets.filter((b) => b.hospital === selectedHospital);
  }, [departmentBudgets, selectedHospital]);

  const filteredTrends = useMemo(() => {
    if (!selectedHospital) return historicalTrends;
    return historicalTrends.filter((t) => t.hospital === selectedHospital);
  }, [historicalTrends, selectedHospital]);

  // Manejadores
  const handleExport = () => {
    // Generar CSV con datos actuales
    const exportData = filteredKPIs.map((kpi) => ({
      Hospital: kpi.hospital,
      Mes: kpi.mes,
      'Ingresos Totales': kpi.ingresosTotales,
      'Gastos Totales': kpi.gastosTotales,
      'Margen Neto': kpi.margenNeto,
      ROI: kpi.roi,
      EBITDA: kpi.ebitda,
    }));

    const headers = Object.keys(exportData[0] || {}).join(',');
    const rows = exportData.map((row) => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `informe_financiero_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Guard de usuario
  if (!user) {
    return null;
  }

  const roleConfig = ROLE_CONFIGS[user.role];

  // Renderizar contenido según tab activa
  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Cargando datos financieros...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center text-red-600 dark:text-red-400">
            <p className="text-4xl mb-4">⚠️</p>
            <p className="font-medium">{error}</p>
            <button
              onClick={() => loadFinancialData()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'executive':
        return (
          <FinancialExecutiveDashboard
            kpis={filteredKPIs}
            stats={stats}
            selectedHospital={selectedHospital}
          />
        );

      case 'department':
        return (
          <DepartmentFinancialAnalysis data={filteredBudgets} selectedHospital={selectedHospital} />
        );

      case 'trends':
        return (
          <div className="space-y-6">
            <HistoricalTrendsChart
              data={filteredTrends}
              title="Evolución de Ingresos 2020-2025"
              metric="ingresosTotales"
              height={450}
              showPrediction={true}
            />
            <HistoricalTrendsChart
              data={filteredTrends}
              title="Tendencia de Satisfacción"
              metric="satisfaccionMedia"
              height={350}
              showPrediction={false}
            />
          </div>
        );

      case 'benchmarking':
        return (
          <div className="space-y-6">
            <BenchmarkingChart
              data={filteredBudgets}
              metrics={['eficienciaCoste', 'satisfaccionPaciente']}
              title="Comparativa de Eficiencia entre Hospitales"
              chartType="bar"
              height={400}
            />
            <BenchmarkingChart
              data={filteredBudgets}
              metrics={[
                'costePorPaciente',
                'tasaOcupacion',
                'margenOperativo',
                'satisfaccionPaciente',
              ]}
              title="Análisis Multidimensional"
              chartType="radar"
              height={450}
              normalizeData={true}
            />
          </div>
        );

      default:
        return null;
    }
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
                  💰 Gestión Financiera
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Dashboard ejecutivo y análisis financiero
                </p>
              </div>
            </div>

            {/* Lado derecho */}
            <div className="flex items-center gap-2 sm:gap-3">
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

      {/* Filtros Globales */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <GlobalFilters
            selectedHospital={selectedHospital}
            hospitals={hospitals}
            onHospitalChange={setSelectedHospital}
            onExport={handleExport}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{renderTabContent()}</main>

      {/* Footer con info */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <p>
              📅 Datos actualizados:{' '}
              {new Date().toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <p>
              🏥 {selectedHospital || 'Todos los hospitales'} • {filteredKPIs.length} registros
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default FinancialDashboardPage;
