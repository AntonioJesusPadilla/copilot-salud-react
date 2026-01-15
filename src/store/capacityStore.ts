import { create } from 'zustand';
import {
  BedCapacityRecord,
  CapacityStats,
  CapacityFilters,
  CapacityAlert,
  AlertLevel,
} from '../types/capacity';
import { financialDataService } from '../services/financialDataService';

interface CapacityStore {
  // Estado - Datos
  bedCapacity: BedCapacityRecord[];
  alerts: CapacityAlert[];

  // Estado - Filtros
  filters: CapacityFilters;
  selectedHospital: string | null;
  selectedPlant: string | null;
  selectedAlertLevel: AlertLevel | null;

  // Estado - Datos derivados
  filteredCapacity: BedCapacityRecord[];
  activeAlerts: CapacityAlert[];
  criticalDepartments: BedCapacityRecord[];
  stats: CapacityStats | null;

  // Estado - UI
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;

  // Listas para filtros
  hospitals: string[];
  plants: string[];

  // Acciones - Carga de datos
  loadCapacityData: () => Promise<void>;
  refreshCapacity: () => Promise<void>;

  // Acciones - Filtros
  setFilters: (filters: CapacityFilters) => void;
  setSelectedHospital: (hospital: string | null) => void;
  setSelectedPlant: (plant: string | null) => void;
  setSelectedAlertLevel: (level: AlertLevel | null) => void;
  applyFilters: () => void;
  clearFilters: () => void;

  // Acciones - Getters
  getCapacityByHospital: (hospital: string) => BedCapacityRecord[];
  getCapacityByPlant: (plant: string) => BedCapacityRecord[];
  getActiveAlerts: () => CapacityAlert[];
  getCriticalDepartments: () => BedCapacityRecord[];
  getDepartmentsNeedingPlantOpening: () => BedCapacityRecord[];

  // Acciones - Utilidades
  clearError: () => void;
}

// Función auxiliar para generar alertas desde los datos de capacidad
function generateAlertsFromCapacity(capacity: BedCapacityRecord[]): CapacityAlert[] {
  const alerts: CapacityAlert[] = [];

  capacity.forEach((record) => {
    if (record.alertaCapacidad !== 'verde') {
      const alert: CapacityAlert = {
        id: `alert-${record.hospital}-${record.planta}-${Date.now()}`,
        hospital: record.hospital,
        planta: record.planta,
        nivel: record.alertaCapacidad,
        mensaje:
          record.alertaCapacidad === 'rojo'
            ? `Ocupación crítica en ${record.planta}: ${record.porcentajeOcupacion.toFixed(1)}%`
            : `Ocupación elevada en ${record.planta}: ${record.porcentajeOcupacion.toFixed(1)}%`,
        ocupacionActual: record.porcentajeOcupacion,
        umbralSuperado: record.alertaCapacidad === 'rojo' ? 90 : 85,
        timestamp: record.fechaActualizacion,
        accionRecomendada: record.recomendacionApertura,
        resuelta: false,
      };
      alerts.push(alert);
    }
  });

  // Ordenar por nivel (rojo primero, luego amarillo)
  return alerts.sort((a, b) => {
    if (a.nivel === 'rojo' && b.nivel !== 'rojo') return -1;
    if (a.nivel !== 'rojo' && b.nivel === 'rojo') return 1;
    return b.ocupacionActual - a.ocupacionActual;
  });
}

const useCapacityStore = create<CapacityStore>((set, get) => ({
  // Estado inicial - Datos
  bedCapacity: [],
  alerts: [],

  // Estado inicial - Filtros
  filters: {},
  selectedHospital: null,
  selectedPlant: null,
  selectedAlertLevel: null,

  // Estado inicial - Datos derivados
  filteredCapacity: [],
  activeAlerts: [],
  criticalDepartments: [],
  stats: null,

  // Estado inicial - UI
  isLoading: false,
  error: null,
  lastUpdate: null,

  // Estado inicial - Listas
  hospitals: [],
  plants: [],

  // Cargar todos los datos de capacidad
  loadCapacityData: async () => {
    set({ isLoading: true, error: null });

    try {
      const [capacity, stats, hospitals, plants] = await Promise.all([
        financialDataService.getBedCapacity(),
        financialDataService.getCapacityStats(),
        financialDataService.getHospitals(),
        financialDataService.getPlants(),
      ]);

      // Generar alertas desde los datos
      const alerts = generateAlertsFromCapacity(capacity);

      // Identificar departamentos críticos (>90% ocupación)
      const criticalDepartments = capacity.filter(
        (c) => c.alertaCapacidad === 'rojo' || c.porcentajeOcupacion >= 90
      );

      set({
        bedCapacity: capacity,
        alerts,
        filteredCapacity: capacity,
        activeAlerts: alerts.filter((a) => !a.resuelta),
        criticalDepartments,
        stats,
        hospitals,
        plants,
        isLoading: false,
        error: null,
        lastUpdate: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al cargar datos de capacidad';
      set({
        bedCapacity: [],
        alerts: [],
        filteredCapacity: [],
        activeAlerts: [],
        criticalDepartments: [],
        stats: null,
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  // Refrescar datos (recarga completa)
  refreshCapacity: async () => {
    await financialDataService.reloadData();
    await get().loadCapacityData();
  },

  // Establecer filtros
  setFilters: (filters: CapacityFilters) => {
    set({ filters });
  },

  // Establecer hospital seleccionado
  setSelectedHospital: (hospital: string | null) => {
    set({ selectedHospital: hospital });
    get().applyFilters();
  },

  // Establecer planta seleccionada
  setSelectedPlant: (plant: string | null) => {
    set({ selectedPlant: plant });
    get().applyFilters();
  },

  // Establecer nivel de alerta seleccionado
  setSelectedAlertLevel: (level: AlertLevel | null) => {
    set({ selectedAlertLevel: level });
    get().applyFilters();
  },

  // Aplicar filtros a los datos
  applyFilters: () => {
    const { bedCapacity, alerts, selectedHospital, selectedPlant, selectedAlertLevel, filters } =
      get();

    // Filtrar capacidad
    let filteredCapacity = [...bedCapacity];

    if (selectedHospital || filters.hospital) {
      const hospital = selectedHospital || filters.hospital;
      filteredCapacity = filteredCapacity.filter((c) => c.hospital === hospital);
    }

    if (selectedPlant || filters.planta) {
      const plant = selectedPlant || filters.planta;
      filteredCapacity = filteredCapacity.filter((c) => c.planta === plant);
    }

    if (selectedAlertLevel || filters.alertLevel) {
      const level = selectedAlertLevel || filters.alertLevel;
      filteredCapacity = filteredCapacity.filter((c) => c.alertaCapacidad === level);
    }

    if (filters.ocupacionMinima !== undefined) {
      filteredCapacity = filteredCapacity.filter(
        (c) => c.porcentajeOcupacion >= (filters.ocupacionMinima || 0)
      );
    }

    if (filters.ocupacionMaxima !== undefined) {
      filteredCapacity = filteredCapacity.filter(
        (c) => c.porcentajeOcupacion <= (filters.ocupacionMaxima || 100)
      );
    }

    if (filters.soloConEspera) {
      filteredCapacity = filteredCapacity.filter((c) => c.pacientesEsperando > 0);
    }

    // Filtrar alertas activas según filtros aplicados
    let activeAlerts = alerts.filter((a) => !a.resuelta);

    if (selectedHospital || filters.hospital) {
      const hospital = selectedHospital || filters.hospital;
      activeAlerts = activeAlerts.filter((a) => a.hospital === hospital);
    }

    if (selectedPlant || filters.planta) {
      const plant = selectedPlant || filters.planta;
      activeAlerts = activeAlerts.filter((a) => a.planta === plant);
    }

    if (selectedAlertLevel || filters.alertLevel) {
      const level = selectedAlertLevel || filters.alertLevel;
      activeAlerts = activeAlerts.filter((a) => a.nivel === level);
    }

    // Actualizar departamentos críticos filtrados
    const criticalDepartments = filteredCapacity.filter(
      (c) => c.alertaCapacidad === 'rojo' || c.porcentajeOcupacion >= 90
    );

    set({ filteredCapacity, activeAlerts, criticalDepartments });
  },

  // Limpiar todos los filtros
  clearFilters: () => {
    const { bedCapacity, alerts } = get();
    set({
      filters: {},
      selectedHospital: null,
      selectedPlant: null,
      selectedAlertLevel: null,
      filteredCapacity: bedCapacity,
      activeAlerts: alerts.filter((a) => !a.resuelta),
      criticalDepartments: bedCapacity.filter(
        (c) => c.alertaCapacidad === 'rojo' || c.porcentajeOcupacion >= 90
      ),
    });
  },

  // Obtener capacidad por hospital
  getCapacityByHospital: (hospital: string) => {
    const { bedCapacity } = get();
    return bedCapacity.filter((c) => c.hospital === hospital);
  },

  // Obtener capacidad por planta
  getCapacityByPlant: (plant: string) => {
    const { bedCapacity } = get();
    return bedCapacity.filter((c) => c.planta === plant);
  },

  // Obtener alertas activas
  getActiveAlerts: () => {
    const { alerts } = get();
    return alerts.filter((a) => !a.resuelta);
  },

  // Obtener departamentos críticos
  getCriticalDepartments: () => {
    const { bedCapacity } = get();
    return bedCapacity.filter((c) => c.alertaCapacidad === 'rojo' || c.porcentajeOcupacion >= 90);
  },

  // Obtener departamentos que necesitan apertura de planta
  getDepartmentsNeedingPlantOpening: () => {
    const { bedCapacity } = get();
    return bedCapacity.filter(
      (c) => c.recomendacionApertura !== 'No necesario' && c.recomendacionApertura !== ''
    );
  },

  // Limpiar error
  clearError: () => {
    set({ error: null });
  },
}));

export default useCapacityStore;
