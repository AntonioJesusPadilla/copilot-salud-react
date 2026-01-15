import { create } from 'zustand';
import {
  DepartmentBudget,
  FinancialKPI,
  HistoricalTrend,
  EfficiencyAnalysis,
  FinancialStats,
  FinancialFilters,
} from '../types/financial';
import { financialDataService } from '../services/financialDataService';

interface FinancialStore {
  // Estado - Datos
  departmentBudgets: DepartmentBudget[];
  financialKPIs: FinancialKPI[];
  historicalTrends: HistoricalTrend[];
  efficiencyAnalysis: EfficiencyAnalysis[];

  // Estado - Filtros
  filters: FinancialFilters;
  selectedHospital: string | null;
  selectedDepartment: string | null;
  selectedPeriod: { start: string; end: string } | null;

  // Estado - Datos derivados
  filteredBudgets: DepartmentBudget[];
  filteredKPIs: FinancialKPI[];
  stats: FinancialStats | null;

  // Estado - UI
  isLoading: boolean;
  error: string | null;

  // Listas para filtros
  hospitals: string[];
  departments: string[];

  // Acciones - Carga de datos
  loadFinancialData: () => Promise<void>;
  refreshData: () => Promise<void>;

  // Acciones - Filtros
  setFilters: (filters: FinancialFilters) => void;
  setSelectedHospital: (hospital: string | null) => void;
  setSelectedDepartment: (department: string | null) => void;
  setSelectedPeriod: (period: { start: string; end: string } | null) => void;
  applyFilters: () => void;
  clearFilters: () => void;

  // Acciones - Getters
  getKPIsByHospital: (hospital: string) => FinancialKPI[];
  getBudgetsByDepartment: (department: string) => DepartmentBudget[];
  getEfficiencyByHospital: (hospital: string) => EfficiencyAnalysis[];
  getTrendsByDepartment: (department: string) => HistoricalTrend[];

  // Acciones - Utilidades
  clearError: () => void;
}

const useFinancialStore = create<FinancialStore>((set, get) => ({
  // Estado inicial - Datos
  departmentBudgets: [],
  financialKPIs: [],
  historicalTrends: [],
  efficiencyAnalysis: [],

  // Estado inicial - Filtros
  filters: {},
  selectedHospital: null,
  selectedDepartment: null,
  selectedPeriod: null,

  // Estado inicial - Datos derivados
  filteredBudgets: [],
  filteredKPIs: [],
  stats: null,

  // Estado inicial - UI
  isLoading: false,
  error: null,

  // Estado inicial - Listas
  hospitals: [],
  departments: [],

  // Cargar todos los datos financieros
  loadFinancialData: async () => {
    set({ isLoading: true, error: null });

    try {
      // Cargar todos los datos en paralelo
      const [budgets, kpis, trends, efficiency, stats, hospitals, departments] = await Promise.all([
        financialDataService.getDepartmentBudgets(),
        financialDataService.getFinancialKPIs(),
        financialDataService.getHistoricalTrends(),
        financialDataService.getEfficiencyAnalysis(),
        financialDataService.getFinancialStats(),
        financialDataService.getHospitals(),
        financialDataService.getDepartments(),
      ]);

      set({
        departmentBudgets: budgets,
        financialKPIs: kpis,
        historicalTrends: trends,
        efficiencyAnalysis: efficiency,
        filteredBudgets: budgets,
        filteredKPIs: kpis,
        stats,
        hospitals,
        departments,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al cargar datos financieros';
      set({
        departmentBudgets: [],
        financialKPIs: [],
        historicalTrends: [],
        efficiencyAnalysis: [],
        filteredBudgets: [],
        filteredKPIs: [],
        stats: null,
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  // Refrescar datos (recarga completa)
  refreshData: async () => {
    await financialDataService.reloadData();
    await get().loadFinancialData();
  },

  // Establecer filtros
  setFilters: (filters: FinancialFilters) => {
    set({ filters });
  },

  // Establecer hospital seleccionado
  setSelectedHospital: (hospital: string | null) => {
    set({ selectedHospital: hospital });
    get().applyFilters();
  },

  // Establecer departamento seleccionado
  setSelectedDepartment: (department: string | null) => {
    set({ selectedDepartment: department });
    get().applyFilters();
  },

  // Establecer período seleccionado
  setSelectedPeriod: (period: { start: string; end: string } | null) => {
    set({ selectedPeriod: period });
    get().applyFilters();
  },

  // Aplicar filtros a los datos
  applyFilters: () => {
    const {
      departmentBudgets,
      financialKPIs,
      selectedHospital,
      selectedDepartment,
      selectedPeriod,
      filters,
    } = get();

    // Filtrar presupuestos
    let filteredBudgets = [...departmentBudgets];

    if (selectedHospital || filters.hospital) {
      const hospital = selectedHospital || filters.hospital;
      filteredBudgets = filteredBudgets.filter((b) => b.hospital === hospital);
    }

    if (selectedDepartment || filters.departamento) {
      const dept = selectedDepartment || filters.departamento;
      filteredBudgets = filteredBudgets.filter((b) => b.departamento === dept);
    }

    // Filtrar KPIs
    let filteredKPIs = [...financialKPIs];

    if (selectedHospital || filters.hospital) {
      const hospital = selectedHospital || filters.hospital;
      filteredKPIs = filteredKPIs.filter((k) => k.hospital === hospital);
    }

    if (selectedPeriod || (filters.periodoInicio && filters.periodoFin)) {
      const start = selectedPeriod?.start || filters.periodoInicio;
      const end = selectedPeriod?.end || filters.periodoFin;
      if (start && end) {
        filteredKPIs = filteredKPIs.filter((k) => k.mes >= start && k.mes <= end);
      }
    }

    if (filters.minROI !== undefined) {
      filteredKPIs = filteredKPIs.filter((k) => k.roi >= (filters.minROI || 0));
    }

    if (filters.maxROI !== undefined) {
      filteredKPIs = filteredKPIs.filter((k) => k.roi <= (filters.maxROI || 100));
    }

    if (filters.estadoMargen && filters.estadoMargen !== 'todos') {
      if (filters.estadoMargen === 'positivo') {
        filteredKPIs = filteredKPIs.filter((k) => k.margenNeto >= 0);
      } else {
        filteredKPIs = filteredKPIs.filter((k) => k.margenNeto < 0);
      }
    }

    set({ filteredBudgets, filteredKPIs });
  },

  // Limpiar todos los filtros
  clearFilters: () => {
    const { departmentBudgets, financialKPIs } = get();
    set({
      filters: {},
      selectedHospital: null,
      selectedDepartment: null,
      selectedPeriod: null,
      filteredBudgets: departmentBudgets,
      filteredKPIs: financialKPIs,
    });
  },

  // Obtener KPIs por hospital
  getKPIsByHospital: (hospital: string) => {
    const { financialKPIs } = get();
    return financialKPIs.filter((k) => k.hospital === hospital);
  },

  // Obtener presupuestos por departamento
  getBudgetsByDepartment: (department: string) => {
    const { departmentBudgets } = get();
    return departmentBudgets.filter((b) => b.departamento === department);
  },

  // Obtener eficiencia por hospital
  getEfficiencyByHospital: (hospital: string) => {
    const { efficiencyAnalysis } = get();
    return efficiencyAnalysis.filter((e) => e.hospital === hospital);
  },

  // Obtener tendencias por departamento
  getTrendsByDepartment: (department: string) => {
    const { historicalTrends } = get();
    return historicalTrends.filter((t) => t.departamento === department);
  },

  // Limpiar error
  clearError: () => {
    set({ error: null });
  },
}));

export default useFinancialStore;
