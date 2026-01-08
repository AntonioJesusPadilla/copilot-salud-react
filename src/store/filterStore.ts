import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AdvancedFilters,
  SavedFilter,
  SearchParams,
  SearchResult,
  KPIComparison,
  KPIComparisonResult,
} from '../types/filters';

interface FilterStore {
  // Estado de búsqueda
  searchResults: SearchResult[];
  isSearching: boolean;
  searchError: string | null;

  // Filtros activos
  activeFilters: AdvancedFilters;
  isFiltersPanelOpen: boolean;

  // Filtros guardados (persisten en localStorage)
  savedFilters: SavedFilter[];

  // Comparador de KPIs
  activeComparison: KPIComparison | null;
  comparisonResults: KPIComparisonResult[];
  isComparingKPIs: boolean;

  // Acciones de búsqueda
  search: (params: SearchParams) => Promise<void>;
  clearSearch: () => void;

  // Acciones de filtros
  setActiveFilters: (filters: AdvancedFilters) => void;
  clearActiveFilters: () => void;
  toggleFiltersPanel: () => void;

  // Acciones de filtros guardados
  saveFilter: (name: string, description?: string) => void;
  loadSavedFilter: (filterId: string) => void;
  deleteSavedFilter: (filterId: string) => void;
  toggleFavoriteFilter: (filterId: string) => void;
  updateFilterUsage: (filterId: string) => void;

  // Acciones de comparación
  setComparison: (comparison: KPIComparison) => void;
  compareKPIs: () => Promise<void>;
  clearComparison: () => void;
}

const useFilterStore = create<FilterStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      searchResults: [],
      isSearching: false,
      searchError: null,

      activeFilters: {},
      isFiltersPanelOpen: false,

      savedFilters: [],

      activeComparison: null,
      comparisonResults: [],
      isComparingKPIs: false,

      // Búsqueda global
      search: async (params: SearchParams) => {
        set({ isSearching: true, searchError: null });

        try {
          // Esta función se implementará en el servicio
          const { filterService } = await import('../services/filterService');
          const results = await filterService.search(params);

          set({
            searchResults: results,
            isSearching: false,
            searchError: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Error al realizar búsqueda';
          set({
            searchResults: [],
            isSearching: false,
            searchError: errorMessage,
          });
        }
      },

      clearSearch: () => {
        set({
          searchResults: [],
          searchError: null,
        });
      },

      // Filtros activos
      setActiveFilters: (filters: AdvancedFilters) => {
        set({ activeFilters: filters });
      },

      clearActiveFilters: () => {
        set({ activeFilters: {} });
      },

      toggleFiltersPanel: () => {
        set((state) => ({ isFiltersPanelOpen: !state.isFiltersPanelOpen }));
      },

      // Filtros guardados
      saveFilter: (name: string, description?: string) => {
        const { activeFilters, savedFilters } = get();

        const newFilter: SavedFilter = {
          id: `filter-${Date.now()}`,
          name,
          description,
          filters: activeFilters,
          createdAt: new Date().toISOString(),
          useCount: 0,
          isFavorite: false,
        };

        set({
          savedFilters: [...savedFilters, newFilter],
        });
      },

      loadSavedFilter: (filterId: string) => {
        const { savedFilters, updateFilterUsage } = get();
        const filter = savedFilters.find((f) => f.id === filterId);

        if (filter) {
          set({
            activeFilters: filter.filters,
          });
          updateFilterUsage(filterId);
        }
      },

      deleteSavedFilter: (filterId: string) => {
        const { savedFilters } = get();
        set({
          savedFilters: savedFilters.filter((f) => f.id !== filterId),
        });
      },

      toggleFavoriteFilter: (filterId: string) => {
        const { savedFilters } = get();
        set({
          savedFilters: savedFilters.map((f) =>
            f.id === filterId ? { ...f, isFavorite: !f.isFavorite } : f
          ),
        });
      },

      updateFilterUsage: (filterId: string) => {
        const { savedFilters } = get();
        set({
          savedFilters: savedFilters.map((f) =>
            f.id === filterId
              ? {
                  ...f,
                  useCount: f.useCount + 1,
                  lastUsed: new Date().toISOString(),
                }
              : f
          ),
        });
      },

      // Comparación de KPIs
      setComparison: (comparison: KPIComparison) => {
        set({ activeComparison: comparison });
      },

      compareKPIs: async () => {
        const { activeComparison } = get();

        if (!activeComparison) {
          return;
        }

        set({ isComparingKPIs: true });

        try {
          const { filterService } = await import('../services/filterService');
          const results = await filterService.compareKPIs(activeComparison);

          set({
            comparisonResults: results,
            isComparingKPIs: false,
          });
        } catch (error) {
          console.error('Error al comparar KPIs:', error);
          set({
            comparisonResults: [],
            isComparingKPIs: false,
          });
        }
      },

      clearComparison: () => {
        set({
          activeComparison: null,
          comparisonResults: [],
        });
      },
    }),
    {
      name: 'copilot-salud-filters', // nombre en localStorage
      partialize: (state) => ({
        // Solo persistir filtros guardados
        savedFilters: state.savedFilters,
      }),
    }
  )
);

export default useFilterStore;
