import { KPI, KPIFilters, ACCESS_LEVEL_PERMISSIONS } from '../types/kpi';
import { UserRole } from '../types';

// Servicio para gestión de KPIs
class KPIService {
  private kpisData: KPI[] = [];

  // Cargar KPIs desde el archivo JSON
  async loadKPIs(): Promise<KPI[]> {
    if (this.kpisData.length > 0) {
      return this.kpisData;
    }

    try {
      const response = await fetch('/data/kpis.json');
      if (!response.ok) {
        throw new Error('No se pudo cargar el archivo de KPIs');
      }
      const data = await response.json();
      this.kpisData = data.kpis;
      return this.kpisData;
    } catch (error) {
      console.error('Error cargando KPIs:', error);
      throw new Error('Error al cargar datos de KPIs');
    }
  }

  // Obtener todos los KPIs
  async getAllKPIs(): Promise<KPI[]> {
    return await this.loadKPIs();
  }

  // Obtener KPIs filtrados por rol de usuario
  async getKPIsByRole(userRole: UserRole): Promise<KPI[]> {
    const allKPIs = await this.loadKPIs();

    return allKPIs.filter((kpi) => {
      const allowedRoles = ACCESS_LEVEL_PERMISSIONS[kpi.accessLevel];
      return (allowedRoles as readonly string[]).includes(userRole);
    });
  }

  // Obtener KPIs con filtros personalizados
  async getFilteredKPIs(filters: KPIFilters, userRole?: UserRole): Promise<KPI[]> {
    let kpis = await this.loadKPIs();

    // Filtrar por rol si se proporciona
    if (userRole) {
      kpis = kpis.filter((kpi) => {
        const allowedRoles = ACCESS_LEVEL_PERMISSIONS[kpi.accessLevel];
        return (allowedRoles as readonly string[]).includes(userRole);
      });
    }

    // Filtrar por categoría
    if (filters.category) {
      kpis = kpis.filter((kpi) => kpi.category === filters.category);
    }

    // Filtrar por nivel de acceso
    if (filters.accessLevel) {
      kpis = kpis.filter((kpi) => kpi.accessLevel === filters.accessLevel);
    }

    // Filtrar por provincia
    if (filters.province) {
      kpis = kpis.filter((kpi) => kpi.province === filters.province);
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

    return kpis;
  }

  // Obtener un KPI específico por ID
  async getKPIById(id: string): Promise<KPI | undefined> {
    const kpis = await this.loadKPIs();
    return kpis.find((kpi) => kpi.id === id);
  }

  // Obtener KPIs por categoría
  async getKPIsByCategory(category: string, userRole?: UserRole): Promise<KPI[]> {
    let kpis = await this.loadKPIs();

    // Filtrar por rol si se proporciona
    if (userRole) {
      kpis = kpis.filter((kpi) => {
        const allowedRoles = ACCESS_LEVEL_PERMISSIONS[kpi.accessLevel];
        return (allowedRoles as readonly string[]).includes(userRole);
      });
    }

    return kpis.filter((kpi) => kpi.category === category);
  }

  // Obtener estadísticas generales de KPIs
  async getKPIStats(userRole: UserRole): Promise<{
    total: number;
    byCategory: Record<string, number>;
    trending: { up: number; down: number; stable: number };
  }> {
    const kpis = await this.getKPIsByRole(userRole);

    const stats = {
      total: kpis.length,
      byCategory: {} as Record<string, number>,
      trending: {
        up: kpis.filter((kpi) => kpi.trend === 'up').length,
        down: kpis.filter((kpi) => kpi.trend === 'down').length,
        stable: kpis.filter((kpi) => kpi.trend === 'stable').length,
      },
    };

    // Contar por categoría
    kpis.forEach((kpi) => {
      stats.byCategory[kpi.category] = (stats.byCategory[kpi.category] || 0) + 1;
    });

    return stats;
  }

  // Verificar si un usuario tiene acceso a un KPI específico
  canUserAccessKPI(kpi: KPI, userRole: UserRole): boolean {
    const allowedRoles = ACCESS_LEVEL_PERMISSIONS[kpi.accessLevel];
    return (allowedRoles as readonly string[]).includes(userRole);
  }

  // Formatear valor de KPI según su tipo
  formatKPIValue(kpi: KPI): string {
    const value = kpi.currentValue;

    switch (kpi.format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `€${value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'decimal':
        return value.toFixed(1);
      case 'number':
      default:
        return value.toLocaleString('es-ES');
    }
  }

  // Obtener texto de tendencia
  getTrendText(trend: string, changePercentage?: number): string {
    if (!changePercentage) return '';

    const absChange = Math.abs(changePercentage).toFixed(1);

    if (trend === 'up') {
      return `↑ ${absChange}%`;
    } else if (trend === 'down') {
      return `↓ ${absChange}%`;
    }

    return '→ Estable';
  }

  // Obtener color de tendencia
  getTrendColor(trend: string): string {
    switch (trend) {
      case 'up':
        return '#10B981'; // verde
      case 'down':
        return '#EF4444'; // rojo
      case 'stable':
      default:
        return '#6B7280'; // gris
    }
  }
}

export const kpiService = new KPIService();
