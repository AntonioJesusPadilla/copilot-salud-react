import { HealthCenter, MapFilters, HealthCenterType } from '../types/map';

// Servicio para gestión de centros de salud y mapas
class MapService {
  private centersData: HealthCenter[] = [];

  // Cargar centros desde el archivo JSON
  async loadHealthCenters(): Promise<HealthCenter[]> {
    if (this.centersData.length > 0) {
      return this.centersData;
    }

    try {
      const response = await fetch('/data/health-centers.json');
      if (!response.ok) {
        throw new Error('No se pudo cargar el archivo de centros de salud');
      }
      const data = await response.json();
      this.centersData = data.centers;
      return this.centersData;
    } catch (error) {
      console.error('Error cargando centros de salud:', error);
      throw new Error('Error al cargar datos de centros de salud');
    }
  }

  // Obtener todos los centros
  async getAllCenters(): Promise<HealthCenter[]> {
    return await this.loadHealthCenters();
  }

  // Obtener centros filtrados
  async getFilteredCenters(filters: MapFilters): Promise<HealthCenter[]> {
    let centers = await this.loadHealthCenters();

    // Filtrar por tipos
    if (filters.types && filters.types.length > 0) {
      centers = centers.filter((center) => filters.types!.includes(center.type));
    }

    // Filtrar por zona sanitaria
    if (filters.zone) {
      centers = centers.filter((center) => center.zone === filters.zone);
    }

    // Filtrar por distrito
    if (filters.district) {
      centers = centers.filter((center) => center.district === filters.district);
    }

    // Filtrar solo centros con urgencias
    if (filters.emergencyOnly) {
      centers = centers.filter((center) => center.emergencyService === true);
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

    return centers;
  }

  // Obtener un centro por ID
  async getCenterById(id: string): Promise<HealthCenter | undefined> {
    const centers = await this.loadHealthCenters();
    return centers.find((center) => center.id === id);
  }

  // Obtener centros por tipo
  async getCentersByType(type: HealthCenterType): Promise<HealthCenter[]> {
    const centers = await this.loadHealthCenters();
    return centers.filter((center) => center.type === type);
  }

  // Obtener estadísticas de centros
  async getCenterStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    withEmergency: number;
    zones: string[];
  }> {
    const centers = await this.loadHealthCenters();

    const stats = {
      total: centers.length,
      byType: {} as Record<string, number>,
      withEmergency: centers.filter((c) => c.emergencyService).length,
      zones: [...new Set(centers.map((c) => c.zone).filter(Boolean))] as string[],
    };

    // Contar por tipo
    centers.forEach((center) => {
      stats.byType[center.type] = (stats.byType[center.type] || 0) + 1;
    });

    return stats;
  }

  // Calcular distancia entre dos puntos (fórmula de Haversine)
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Encontrar centros cercanos a una ubicación
  async findNearbyCenters(
    lat: number,
    lng: number,
    radiusKm: number = 5,
    type?: HealthCenterType
  ): Promise<Array<HealthCenter & { distance: number }>> {
    let centers = await this.loadHealthCenters();

    if (type) {
      centers = centers.filter((c) => c.type === type);
    }

    const centersWithDistance = centers.map((center) => ({
      ...center,
      distance: this.calculateDistance(
        lat,
        lng,
        center.coordinates.lat,
        center.coordinates.lng
      ),
    }));

    return centersWithDistance
      .filter((c) => c.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }

  // Obtener zonas sanitarias únicas
  async getZones(): Promise<string[]> {
    const centers = await this.loadHealthCenters();
    return [...new Set(centers.map((c) => c.zone).filter(Boolean))] as string[];
  }

  // Obtener distritos únicos
  async getDistricts(): Promise<string[]> {
    const centers = await this.loadHealthCenters();
    return [...new Set(centers.map((c) => c.district).filter(Boolean))] as string[];
  }
}

export const mapService = new MapService();
