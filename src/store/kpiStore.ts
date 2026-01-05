import { create } from 'zustand';
import { KPI, KPIFilters } from '../types/kpi';
import { UserRole } from '../types';
import { kpiService } from '../services/kpiService';

interface KPIStore {
  // Estado
  kpis: KPI[];
  filteredKPIs: KPI[];
  selectedKPI: KPI | null;
  filters: KPIFilters;
  isLoading: boolean;
  error: string | null;

  // Estadísticas
  stats: {
    total: number;
    byCategory: Record<string, number>;
    trending: { up: number; down: number; stable: number };
  } | null;

  // Acciones
  loadKPIs: (userRole: UserRole) => Promise<void>;
  setFilters: (filters: KPIFilters) => void;
  applyFilters: (userRole: UserRole) => Promise<void>;
  selectKPI: (kpi: KPI | null) => void;
  refreshKPIs: (userRole: UserRole) => Promise<void>;
  clearError: () => void;
}

const useKPIStore = create<KPIStore>((set, get) => ({
  // Estado inicial
  kpis: [],
  filteredKPIs: [],
  selectedKPI: null,
  filters: {},
  isLoading: false,
  error: null,
  stats: null,

  // Cargar KPIs según rol de usuario
  loadKPIs: async (userRole: UserRole) => {
    set({ isLoading: true, error: null });

    try {
      const [kpis, stats] = await Promise.all([
        kpiService.getKPIsByRole(userRole),
        kpiService.getKPIStats(userRole),
      ]);

      set({
        kpis,
        filteredKPIs: kpis,
        stats,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar KPIs';
      set({
        kpis: [],
        filteredKPIs: [],
        stats: null,
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  // Establecer filtros
  setFilters: (filters: KPIFilters) => {
    set({ filters });
  },

  // Aplicar filtros
  applyFilters: async (userRole: UserRole) => {
    const { filters } = get();
    set({ isLoading: true });

    try {
      const filteredKPIs = await kpiService.getFilteredKPIs(filters, userRole);
      set({
        filteredKPIs,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al filtrar KPIs';
      set({
        filteredKPIs: [],
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  // Seleccionar un KPI para ver detalles
  selectKPI: (kpi: KPI | null) => {
    set({ selectedKPI: kpi });
  },

  // Refrescar KPIs (recargar desde el servicio)
  refreshKPIs: async (userRole: UserRole) => {
    const { loadKPIs } = get();
    await loadKPIs(userRole);
  },

  // Limpiar error
  clearError: () => {
    set({ error: null });
  },
}));

export default useKPIStore;
