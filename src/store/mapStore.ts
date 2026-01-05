import { create } from 'zustand';
import { HealthCenter, MapFilters, MapView, DEFAULT_MAP_VIEW } from '../types/map';
import { mapService } from '../services/mapService';

interface MapStore {
  // Estado
  centers: HealthCenter[];
  filteredCenters: HealthCenter[];
  selectedCenter: HealthCenter | null;
  filters: MapFilters;
  mapView: MapView;
  isLoading: boolean;
  error: string | null;

  // Estadísticas
  stats: {
    total: number;
    byType: Record<string, number>;
    withEmergency: number;
    zones: string[];
  } | null;

  // Acciones
  loadCenters: () => Promise<void>;
  setFilters: (filters: MapFilters) => void;
  applyFilters: () => Promise<void>;
  selectCenter: (center: HealthCenter | null) => void;
  setMapView: (view: MapView) => void;
  resetMapView: () => void;
  clearFilters: () => void;
  clearError: () => void;
}

const useMapStore = create<MapStore>((set, get) => ({
  // Estado inicial
  centers: [],
  filteredCenters: [],
  selectedCenter: null,
  filters: {},
  mapView: DEFAULT_MAP_VIEW,
  isLoading: false,
  error: null,
  stats: null,

  // Cargar centros de salud
  loadCenters: async () => {
    set({ isLoading: true, error: null });

    try {
      const [centers, stats] = await Promise.all([
        mapService.getAllCenters(),
        mapService.getCenterStats(),
      ]);

      set({
        centers,
        filteredCenters: centers,
        stats,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar centros';
      set({
        centers: [],
        filteredCenters: [],
        stats: null,
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  // Establecer filtros
  setFilters: (filters: MapFilters) => {
    set({ filters });
  },

  // Aplicar filtros
  applyFilters: async () => {
    const { filters } = get();
    set({ isLoading: true });

    try {
      const filteredCenters = await mapService.getFilteredCenters(filters);
      set({
        filteredCenters,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al filtrar centros';
      set({
        filteredCenters: [],
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  // Seleccionar un centro
  selectCenter: (center: HealthCenter | null) => {
    set({ selectedCenter: center });

    // Si se selecciona un centro, centrar el mapa en él
    if (center) {
      set({
        mapView: {
          center: center.coordinates,
          zoom: 15,
        },
      });
    }
  },

  // Establecer vista del mapa
  setMapView: (view: MapView) => {
    set({ mapView: view });
  },

  // Resetear vista del mapa
  resetMapView: () => {
    set({ mapView: DEFAULT_MAP_VIEW });
  },

  // Limpiar filtros
  clearFilters: () => {
    set({ filters: {} });
    const { centers } = get();
    set({ filteredCenters: centers });
  },

  // Limpiar error
  clearError: () => {
    set({ error: null });
  },
}));

export default useMapStore;
