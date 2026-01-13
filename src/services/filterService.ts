import {
  SearchParams,
  SearchResult,
  AdvancedFilters,
  KPIComparison,
  KPIComparisonResult,
} from '../types/filters';
import { kpiService } from './kpiService';
import { mapService } from './mapService';
import { KPI } from '../types/kpi';
import { HealthCenter } from '../types/map';

// Servicio para búsqueda y filtrado avanzado
class FilterService {
  // Calcular relevancia de búsqueda (0-100)
  private calculateRelevance(searchTerm: string, text: string): number {
    const searchLower = searchTerm.toLowerCase();
    const textLower = text.toLowerCase();

    // Coincidencia exacta = 100
    if (textLower === searchLower) return 100;

    // Comienza con el término = 90
    if (textLower.startsWith(searchLower)) return 90;

    // Contiene el término completo = 70
    if (textLower.includes(searchLower)) return 70;

    // Contiene palabras del término = 50
    const searchWords = searchLower.split(' ');
    const matchedWords = searchWords.filter((word) => textLower.includes(word));
    if (matchedWords.length > 0) {
      return 50 * (matchedWords.length / searchWords.length);
    }

    return 0;
  }

  // Búsqueda en KPIs
  private async searchKPIs(query: string, limit?: number): Promise<SearchResult[]> {
    const kpis = await kpiService.getAllKPIs();
    const results: SearchResult[] = [];

    for (const kpi of kpis) {
      const nameRelevance = this.calculateRelevance(query, kpi.name);
      const descRelevance = this.calculateRelevance(query, kpi.description);
      const maxRelevance = Math.max(nameRelevance, descRelevance);

      if (maxRelevance > 0) {
        results.push({
          id: kpi.id,
          type: 'kpi',
          title: kpi.name,
          description: kpi.description,
          url: `/dashboard?kpi=${kpi.id}`,
          category: kpi.category,
          relevance: maxRelevance,
          metadata: {
            value: kpi.currentValue,
            unit: kpi.unit,
            trend: kpi.trend,
            icon: kpi.icon,
          },
        });
      }
    }

    // Ordenar por relevancia
    results.sort((a, b) => b.relevance - a.relevance);

    return limit ? results.slice(0, limit) : results;
  }

  // Búsqueda en centros de salud
  private async searchCenters(query: string, limit?: number): Promise<SearchResult[]> {
    const centers = await mapService.getAllCenters();
    const results: SearchResult[] = [];

    for (const center of centers) {
      const nameRelevance = this.calculateRelevance(query, center.name);
      const addressRelevance = this.calculateRelevance(query, center.address);
      const cityRelevance = this.calculateRelevance(query, center.city);
      const maxRelevance = Math.max(nameRelevance, addressRelevance, cityRelevance);

      if (maxRelevance > 0) {
        results.push({
          id: center.id,
          type: 'center',
          title: center.name,
          description: `${center.address}, ${center.city}`,
          url: `/map?center=${center.id}`,
          category: center.type,
          relevance: maxRelevance,
          metadata: {
            type: center.type,
            zone: center.zone,
            district: center.district,
            phone: center.phone,
            emergencyService: center.emergencyService,
          },
        });
      }
    }

    // Ordenar por relevancia
    results.sort((a, b) => b.relevance - a.relevance);

    return limit ? results.slice(0, limit) : results;
  }

  // Búsqueda global
  async search(params: SearchParams): Promise<SearchResult[]> {
    const { query, scope, limit = 50, minRelevance = 0 } = params;

    if (!query || query.trim().length === 0) {
      return [];
    }

    let results: SearchResult[] = [];

    try {
      // Buscar según el scope
      if (scope === 'all' || scope === 'kpis') {
        const kpiResults = await this.searchKPIs(query, limit);
        results = [...results, ...kpiResults];
      }

      if (scope === 'all' || scope === 'centers') {
        const centerResults = await this.searchCenters(query, limit);
        results = [...results, ...centerResults];
      }

      // Filtrar por relevancia mínima
      results = results.filter((r) => r.relevance >= minRelevance);

      // Ordenar por relevancia y limitar resultados
      results.sort((a, b) => b.relevance - a.relevance);
      results = results.slice(0, limit);

      return results;
    } catch (error) {
      console.error('Error en búsqueda global:', error);
      return [];
    }
  }

  // Aplicar filtros avanzados a KPIs
  async applyAdvancedFilters(filters: AdvancedFilters, userRole?: string): Promise<KPI[]> {
    let kpis = await kpiService.getAllKPIs();

    // Filtrar por rol si se proporciona
    if (userRole) {
      kpis = await kpiService.getKPIsByRole(
        userRole as 'admin' | 'gestor' | 'analista' | 'invitado'
      );
    }

    // Filtrar por categorías
    if (filters.categories && filters.categories.length > 0) {
      kpis = kpis.filter((kpi) => filters.categories!.includes(kpi.category));
    }

    // Filtrar por tendencias
    if (filters.trends && filters.trends.length > 0) {
      kpis = kpis.filter((kpi) => filters.trends!.includes(kpi.trend));
    }

    // Filtrar por provincias
    if (filters.provinces && filters.provinces.length > 0) {
      // Si incluye "Todas", mostrar todos
      if (!filters.provinces.includes('Todas')) {
        kpis = kpis.filter(
          (kpi) => kpi.province && filters.provinces!.some((p) => p === kpi.province)
        );
      }
    }

    // Filtrar por rango de valores
    if (filters.minValue !== undefined) {
      kpis = kpis.filter((kpi) => kpi.currentValue >= filters.minValue!);
    }
    if (filters.maxValue !== undefined) {
      kpis = kpis.filter((kpi) => kpi.currentValue <= filters.maxValue!);
    }

    // Filtrar por rango de fechas
    if (filters.dateRange?.startDate && filters.dateRange?.endDate) {
      kpis = kpis.filter((kpi) => {
        const kpiDate = new Date(kpi.lastUpdated);
        const start = filters.dateRange!.startDate!;
        const end = filters.dateRange!.endDate!;
        return kpiDate >= start && kpiDate <= end;
      });
    }

    // Filtrar por término de búsqueda
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      kpis = kpis.filter(
        (kpi) =>
          kpi.name.toLowerCase().includes(searchLower) ||
          kpi.description.toLowerCase().includes(searchLower)
      );
    }

    // Ordenar resultados
    if (filters.sortBy) {
      kpis = this.sortKPIs(kpis, filters.sortBy, filters.sortOrder || 'desc');
    }

    // Limitar resultados
    if (filters.limit) {
      kpis = kpis.slice(0, filters.limit);
    }

    return kpis;
  }

  // Aplicar filtros avanzados a centros de salud
  async applyAdvancedFiltersToCenter(filters: AdvancedFilters): Promise<HealthCenter[]> {
    let centers = await mapService.getAllCenters();

    // Filtrar por tipos de centro
    if (filters.centerTypes && filters.centerTypes.length > 0) {
      centers = centers.filter((center) => filters.centerTypes!.includes(center.type));
    }

    // Filtrar por urgencias
    if (filters.hasEmergency) {
      centers = centers.filter((center) => center.emergencyService);
    }

    // Filtrar por servicios
    if (filters.hasServices && filters.hasServices.length > 0) {
      centers = centers.filter((center) =>
        filters.hasServices!.some((service) =>
          center.services?.some((s) => s.toLowerCase().includes(service.toLowerCase()))
        )
      );
    }

    // Filtrar por término de búsqueda
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      centers = centers.filter(
        (center) =>
          center.name.toLowerCase().includes(searchLower) ||
          center.address.toLowerCase().includes(searchLower) ||
          center.city.toLowerCase().includes(searchLower)
      );
    }

    // Limitar resultados
    if (filters.limit) {
      centers = centers.slice(0, filters.limit);
    }

    return centers;
  }

  // Ordenar KPIs
  private sortKPIs(kpis: KPI[], sortBy: string, sortOrder: 'asc' | 'desc'): KPI[] {
    const sorted = [...kpis];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'value':
          comparison = a.currentValue - b.currentValue;
          break;
        case 'date':
          comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
          break;
        case 'trend': {
          const trendOrder = { up: 3, stable: 2, down: 1 };
          comparison = trendOrder[a.trend] - trendOrder[b.trend];
          break;
        }
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  // Comparar KPIs entre períodos
  async compareKPIs(comparison: KPIComparison): Promise<KPIComparisonResult[]> {
    const kpi = await kpiService.getKPIById(comparison.kpiId);

    if (!kpi) {
      return [];
    }

    const results: KPIComparisonResult = {
      kpiId: kpi.id,
      kpiName: kpi.name,
      comparisons: [],
    };

    // Para cada período, buscar los datos históricos correspondientes
    for (const period of comparison.periods) {
      // Filtrar datos históricos dentro del rango de fechas
      const periodData = kpi.historicalData.filter((point) => {
        const pointDate = new Date(point.date);
        return pointDate >= period.startDate && pointDate <= period.endDate;
      });

      // Calcular valor promedio del período
      const avgValue =
        periodData.length > 0
          ? periodData.reduce((sum, point) => sum + point.value, 0) / periodData.length
          : kpi.currentValue;

      results.comparisons.push({
        period,
        value: avgValue,
      });
    }

    // Calcular cambios entre períodos
    if (
      results.comparisons.length > 1 &&
      (comparison.showAbsoluteChange || comparison.showPercentageChange)
    ) {
      for (let i = 1; i < results.comparisons.length; i++) {
        const current = results.comparisons[i].value;
        const previous = results.comparisons[i - 1].value;

        if (comparison.showAbsoluteChange) {
          results.comparisons[i].change = current - previous;
        }

        if (comparison.showPercentageChange && previous !== 0) {
          results.comparisons[i].changePercentage = ((current - previous) / previous) * 100;
        }
      }
    }

    return [results];
  }
}

// Exportar instancia única del servicio
export const filterService = new FilterService();
