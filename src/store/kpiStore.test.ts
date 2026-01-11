import { describe, it, expect, beforeEach, vi } from 'vitest';
import useKPIStore from './kpiStore';
import { kpiService } from '../services/kpiService';
import type { KPI } from '../types/kpi';

// Mock del kpiService
vi.mock('../services/kpiService', () => ({
  kpiService: {
    getKPIsByRole: vi.fn(),
    getKPIStats: vi.fn(),
    getFilteredKPIs: vi.fn(),
  },
}));

describe('KPIStore', () => {
  const mockKPIs: KPI[] = [
    {
      id: 'kpi-1',
      name: 'Test KPI 1',
      category: 'Asistencia Sanitaria',
      value: 85.5,
      unit: '%',
      description: 'Test description',
      change: 2.3,
      trend: 'up' as const,
      lastUpdate: new Date('2024-01-01'),
      accessLevel: 'admin' as const,
    },
    {
      id: 'kpi-2',
      name: 'Test KPI 2',
      category: 'Urgencias',
      value: 92.1,
      unit: '%',
      description: 'Test description 2',
      change: -1.2,
      trend: 'down' as const,
      lastUpdate: new Date('2024-01-01'),
      accessLevel: 'manager' as const,
    },
  ];

  const mockStats = {
    total: 2,
    byCategory: {
      'Asistencia Sanitaria': 1,
      'Urgencias': 1,
    },
    trending: {
      up: 1,
      down: 1,
      stable: 0,
    },
  };

  beforeEach(() => {
    // Reset store state
    useKPIStore.setState({
      kpis: [],
      filteredKPIs: [],
      selectedKPI: null,
      filters: {},
      isLoading: false,
      error: null,
      stats: null,
    });

    // Clear mocks
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useKPIStore.getState();
      expect(state.kpis).toEqual([]);
      expect(state.filteredKPIs).toEqual([]);
      expect(state.selectedKPI).toBeNull();
      expect(state.filters).toEqual({});
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.stats).toBeNull();
    });
  });

  describe('loadKPIs', () => {
    it('should load KPIs successfully', async () => {
      vi.mocked(kpiService.getKPIsByRole).mockResolvedValue(mockKPIs);
      vi.mocked(kpiService.getKPIStats).mockResolvedValue(mockStats);

      const state = useKPIStore.getState();
      await state.loadKPIs('admin');

      const newState = useKPIStore.getState();
      expect(newState.kpis).toEqual(mockKPIs);
      expect(newState.filteredKPIs).toEqual(mockKPIs);
      expect(newState.stats).toEqual(mockStats);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBeNull();
    });

    it('should handle load error', async () => {
      const error = new Error('Failed to load KPIs');
      vi.mocked(kpiService.getKPIsByRole).mockRejectedValue(error);

      const state = useKPIStore.getState();
      await state.loadKPIs('admin');

      const newState = useKPIStore.getState();
      expect(newState.kpis).toEqual([]);
      expect(newState.filteredKPIs).toEqual([]);
      expect(newState.stats).toBeNull();
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe('Failed to load KPIs');
    });

    it('should set loading state during load', async () => {
      vi.mocked(kpiService.getKPIsByRole).mockImplementation(async () => {
        const state = useKPIStore.getState();
        expect(state.isLoading).toBe(true);
        return mockKPIs;
      });
      vi.mocked(kpiService.getKPIStats).mockResolvedValue(mockStats);

      const state = useKPIStore.getState();
      await state.loadKPIs('admin');

      const newState = useKPIStore.getState();
      expect(newState.isLoading).toBe(false);
    });
  });

  describe('setFilters', () => {
    it('should set filters', () => {
      const filters = { category: 'Asistencia Sanitaria' };

      const state = useKPIStore.getState();
      state.setFilters(filters);

      const newState = useKPIStore.getState();
      expect(newState.filters).toEqual(filters);
    });
  });

  describe('applyFilters', () => {
    it('should apply filters successfully', async () => {
      const filters = { category: 'Asistencia Sanitaria' };
      const filteredKPIs = [mockKPIs[0]];

      useKPIStore.setState({ filters });
      vi.mocked(kpiService.getFilteredKPIs).mockResolvedValue(filteredKPIs);

      const state = useKPIStore.getState();
      await state.applyFilters('admin');

      const newState = useKPIStore.getState();
      expect(newState.filteredKPIs).toEqual(filteredKPIs);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBeNull();
    });

    it('should handle filter error', async () => {
      const error = new Error('Failed to filter KPIs');
      vi.mocked(kpiService.getFilteredKPIs).mockRejectedValue(error);

      const state = useKPIStore.getState();
      await state.applyFilters('admin');

      const newState = useKPIStore.getState();
      expect(newState.filteredKPIs).toEqual([]);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe('Failed to filter KPIs');
    });
  });

  describe('selectKPI', () => {
    it('should select a KPI', () => {
      const kpi = mockKPIs[0];

      const state = useKPIStore.getState();
      state.selectKPI(kpi);

      const newState = useKPIStore.getState();
      expect(newState.selectedKPI).toEqual(kpi);
    });

    it('should clear selection when set to null', () => {
      useKPIStore.setState({ selectedKPI: mockKPIs[0] });

      const state = useKPIStore.getState();
      state.selectKPI(null);

      const newState = useKPIStore.getState();
      expect(newState.selectedKPI).toBeNull();
    });
  });

  describe('refreshKPIs', () => {
    it('should refresh KPIs by calling loadKPIs', async () => {
      vi.mocked(kpiService.getKPIsByRole).mockResolvedValue(mockKPIs);
      vi.mocked(kpiService.getKPIStats).mockResolvedValue(mockStats);

      const state = useKPIStore.getState();
      await state.refreshKPIs('admin');

      expect(kpiService.getKPIsByRole).toHaveBeenCalledWith('admin');
      expect(kpiService.getKPIStats).toHaveBeenCalledWith('admin');

      const newState = useKPIStore.getState();
      expect(newState.kpis).toEqual(mockKPIs);
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      useKPIStore.setState({ error: 'Test error' });

      const state = useKPIStore.getState();
      state.clearError();

      const newState = useKPIStore.getState();
      expect(newState.error).toBeNull();
    });
  });
});
