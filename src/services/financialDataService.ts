import Papa from 'papaparse';
import {
  DepartmentBudget,
  FinancialKPI,
  HistoricalTrend,
  EfficiencyAnalysis,
  FinancialStats,
  InnovacionLevel,
} from '../types/financial';
import { BedCapacityRecord, AlertLevel, CapacityStats } from '../types/capacity';

// ============================================================================
// TIPOS PARA PARSEO DE CSV
// ============================================================================

interface RawDepartmentBudget {
  hospital: string;
  departamento: string;
  presupuesto_anual_euros: string;
  personal_plantilla: string;
  coste_personal: string;
  coste_equipamiento: string;
  coste_medicamentos: string;
  coste_operativo: string;
  pacientes_estimados: string;
  coste_por_paciente: string;
  ingresos_estimados: string;
  margen_operativo: string;
  eficiencia_coste: string;
  tasa_ocupacion: string;
  tiempo_espera_medio_dias: string;
  satisfaccion_paciente: string;
}

interface RawFinancialKPI {
  hospital: string;
  mes: string;
  ingresos_totales: string;
  gastos_totales: string;
  margen_neto: string;
  roi: string;
  ebitda: string;
  flujo_caja: string;
  deuda_total: string;
  ratio_liquidez: string;
  dias_cobro_medio: string;
  rotacion_inventario: string;
  coste_adquisicion_paciente: string;
  valor_vida_paciente: string;
  tasa_retencion: string;
  pacientes_nuevos: string;
  pacientes_totales: string;
}

interface RawHistoricalTrend {
  año: string;
  hospital: string;
  departamento: string;
  presupuesto_total: string;
  pacientes_atendidos: string;
  coste_por_paciente: string;
  satisfaccion_media: string;
  eficiencia_operativa: string;
  margen_neto: string;
  ingresos_totales: string;
  personal_total: string;
}

interface RawEfficiencyAnalysis {
  hospital: string;
  departamento: string;
  score_eficiencia: string;
  ranking_nacional: string;
  ratio_coste_beneficio: string;
  tiempo_medio_atencion_min: string;
  tasa_error_clinico: string;
  reingresos_30_dias: string;
  cumplimiento_protocolos: string;
  certificaciones_calidad: string;
  innovacion_tecnologica: string;
  formacion_continua_horas: string;
  publicaciones_cientificas: string;
  colaboraciones_internacionales: string;
}

interface RawBedCapacity {
  hospital: string;
  planta: string;
  camas_totales: string;
  camas_ocupadas: string;
  camas_disponibles: string;
  porcentaje_ocupacion: string;
  pacientes_esperando: string;
  tiempo_espera_medio_horas: string;
  altos_tramite: string;
  ingresos_programados: string;
  alerta_capacidad: string;
  recomendacion_apertura: string;
  fecha_actualizacion: string;
}

// ============================================================================
// SERVICIO DE DATOS FINANCIEROS
// ============================================================================

class FinancialDataService {
  private departmentBudgets: DepartmentBudget[] = [];
  private financialKPIs: FinancialKPI[] = [];
  private historicalTrends: HistoricalTrend[] = [];
  private efficiencyAnalysis: EfficiencyAnalysis[] = [];
  private bedCapacity: BedCapacityRecord[] = [];
  private isLoaded = false;

  // ============================================================================
  // MÉTODOS DE CARGA
  // ============================================================================

  /**
   * Carga un archivo CSV y lo parsea
   */
  private async loadCSV<T>(path: string): Promise<T[]> {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Error cargando ${path}: ${response.status}`);
      }
      const csvText = await response.text();

      return new Promise((resolve, reject) => {
        Papa.parse<T>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn(`Advertencias al parsear ${path}:`, results.errors);
            }
            resolve(results.data);
          },
          error: (error: Error) => {
            reject(new Error(`Error parseando ${path}: ${error.message}`));
          },
        });
      });
    } catch (error) {
      console.error(`Error cargando CSV ${path}:`, error);
      throw error;
    }
  }

  /**
   * Carga todos los datos financieros
   */
  async loadAllData(): Promise<void> {
    if (this.isLoaded) return;

    try {
      // Cargar todos los CSVs en paralelo
      const [budgets, kpis, trends, efficiency, capacity] = await Promise.all([
        this.loadCSV<RawDepartmentBudget>('/data/raw/presupuesto_departamentos_malaga.csv'),
        this.loadCSV<RawFinancialKPI>('/data/raw/kpis_financieros_2025.csv'),
        this.loadCSV<RawHistoricalTrend>('/data/raw/tendencias_historicas_2020_2025.csv'),
        this.loadCSV<RawEfficiencyAnalysis>('/data/raw/analisis_eficiencia_departamental.csv'),
        this.loadCSV<RawBedCapacity>('/data/raw/gestion_camas_hospitalarias.csv'),
      ]);

      // Transformar datos
      this.departmentBudgets = this.transformBudgets(budgets);
      this.financialKPIs = this.transformKPIs(kpis);
      this.historicalTrends = this.transformTrends(trends);
      this.efficiencyAnalysis = this.transformEfficiency(efficiency);
      this.bedCapacity = this.transformCapacity(capacity);

      this.isLoaded = true;
      console.log('✅ Datos financieros cargados correctamente');
    } catch (error) {
      console.error('❌ Error cargando datos financieros:', error);
      throw error;
    }
  }

  // ============================================================================
  // TRANSFORMADORES
  // ============================================================================

  private transformBudgets(raw: RawDepartmentBudget[]): DepartmentBudget[] {
    return raw.map((r) => ({
      hospital: r.hospital,
      departamento: r.departamento,
      presupuestoAnualEuros: parseFloat(r.presupuesto_anual_euros) || 0,
      personalPlantilla: parseInt(r.personal_plantilla) || 0,
      costePersonal: parseFloat(r.coste_personal) || 0,
      costeEquipamiento: parseFloat(r.coste_equipamiento) || 0,
      costeMedicamentos: parseFloat(r.coste_medicamentos) || 0,
      costeOperativo: parseFloat(r.coste_operativo) || 0,
      pacientesEstimados: parseInt(r.pacientes_estimados) || 0,
      costePorPaciente: parseFloat(r.coste_por_paciente) || 0,
      ingresosEstimados: parseFloat(r.ingresos_estimados) || 0,
      margenOperativo: parseFloat(r.margen_operativo) || 0,
      eficienciaCoste: parseFloat(r.eficiencia_coste) || 0,
      tasaOcupacion: parseFloat(r.tasa_ocupacion) || 0,
      tiempoEsperaMedioDias: parseFloat(r.tiempo_espera_medio_dias) || 0,
      satisfaccionPaciente: parseFloat(r.satisfaccion_paciente) || 0,
    }));
  }

  private transformKPIs(raw: RawFinancialKPI[]): FinancialKPI[] {
    return raw.map((r) => ({
      hospital: r.hospital,
      mes: r.mes,
      ingresosTotales: parseFloat(r.ingresos_totales) || 0,
      gastosTotales: parseFloat(r.gastos_totales) || 0,
      margenNeto: parseFloat(r.margen_neto) || 0,
      roi: parseFloat(r.roi) || 0,
      ebitda: parseFloat(r.ebitda) || 0,
      flujoCaja: parseFloat(r.flujo_caja) || 0,
      deudaTotal: parseFloat(r.deuda_total) || 0,
      ratioLiquidez: parseFloat(r.ratio_liquidez) || 0,
      diasCobroMedio: parseFloat(r.dias_cobro_medio) || 0,
      rotacionInventario: parseFloat(r.rotacion_inventario) || 0,
      costeAdquisicionPaciente: parseFloat(r.coste_adquisicion_paciente) || 0,
      valorVidaPaciente: parseFloat(r.valor_vida_paciente) || 0,
      tasaRetencion: parseFloat(r.tasa_retencion) || 0,
      pacientesNuevos: parseInt(r.pacientes_nuevos) || 0,
      pacientesTotales: parseInt(r.pacientes_totales) || 0,
    }));
  }

  private transformTrends(raw: RawHistoricalTrend[]): HistoricalTrend[] {
    return raw.map((r) => ({
      año: parseInt(r.año) || 0,
      hospital: r.hospital,
      departamento: r.departamento,
      presupuestoTotal: parseFloat(r.presupuesto_total) || 0,
      pacientesAtendidos: parseInt(r.pacientes_atendidos) || 0,
      costePorPaciente: parseFloat(r.coste_por_paciente) || 0,
      satisfaccionMedia: parseFloat(r.satisfaccion_media) || 0,
      eficienciaOperativa: parseFloat(r.eficiencia_operativa) || 0,
      margenNeto: parseFloat(r.margen_neto) || 0,
      ingresosTotales: parseFloat(r.ingresos_totales) || 0,
      personalTotal: parseInt(r.personal_total) || 0,
    }));
  }

  private transformEfficiency(raw: RawEfficiencyAnalysis[]): EfficiencyAnalysis[] {
    return raw.map((r) => ({
      hospital: r.hospital,
      departamento: r.departamento,
      scoreEficiencia: parseFloat(r.score_eficiencia) || 0,
      rankingNacional: parseInt(r.ranking_nacional) || 0,
      ratioCosteBeneficio: parseFloat(r.ratio_coste_beneficio) || 0,
      tiempoMedioAtencionMin:
        r.tiempo_medio_atencion_min === 'N/A'
          ? null
          : parseFloat(r.tiempo_medio_atencion_min) || null,
      tasaErrorClinico: parseFloat(r.tasa_error_clinico) || 0,
      reingresos30Dias: parseFloat(r.reingresos_30_dias) || 0,
      cumplimientoProtocolos: parseFloat(r.cumplimiento_protocolos) || 0,
      certificacionesCalidad: r.certificaciones_calidad
        ? r.certificaciones_calidad.split(';').map((c) => c.trim())
        : [],
      innovacionTecnologica: r.innovacion_tecnologica as InnovacionLevel,
      formacionContinuaHoras: parseInt(r.formacion_continua_horas) || 0,
      publicacionesCientificas: parseInt(r.publicaciones_cientificas) || 0,
      colaboracionesInternacionales: parseInt(r.colaboraciones_internacionales) || 0,
    }));
  }

  private transformCapacity(raw: RawBedCapacity[]): BedCapacityRecord[] {
    return raw.map((r) => ({
      hospital: r.hospital,
      planta: r.planta,
      camasTotales: parseInt(r.camas_totales) || 0,
      camasOcupadas: parseInt(r.camas_ocupadas) || 0,
      camasDisponibles: parseInt(r.camas_disponibles) || 0,
      porcentajeOcupacion: parseFloat(r.porcentaje_ocupacion) || 0,
      pacientesEsperando: parseInt(r.pacientes_esperando) || 0,
      tiempoEsperaMedioHoras: parseFloat(r.tiempo_espera_medio_horas) || 0,
      altosTramite: parseInt(r.altos_tramite) || 0,
      ingresosProgramados: parseInt(r.ingresos_programados) || 0,
      alertaCapacidad: r.alerta_capacidad.toLowerCase() as AlertLevel,
      recomendacionApertura: r.recomendacion_apertura,
      fechaActualizacion: r.fecha_actualizacion,
    }));
  }

  // ============================================================================
  // GETTERS DE DATOS
  // ============================================================================

  async getDepartmentBudgets(): Promise<DepartmentBudget[]> {
    await this.loadAllData();
    return this.departmentBudgets;
  }

  async getFinancialKPIs(): Promise<FinancialKPI[]> {
    await this.loadAllData();
    return this.financialKPIs;
  }

  async getHistoricalTrends(): Promise<HistoricalTrend[]> {
    await this.loadAllData();
    return this.historicalTrends;
  }

  async getEfficiencyAnalysis(): Promise<EfficiencyAnalysis[]> {
    await this.loadAllData();
    return this.efficiencyAnalysis;
  }

  async getBedCapacity(): Promise<BedCapacityRecord[]> {
    await this.loadAllData();
    return this.bedCapacity;
  }

  // ============================================================================
  // MÉTODOS DE FILTRADO
  // ============================================================================

  async getBudgetsByHospital(hospital: string): Promise<DepartmentBudget[]> {
    const budgets = await this.getDepartmentBudgets();
    return budgets.filter((b) => b.hospital === hospital);
  }

  async getBudgetsByDepartment(departamento: string): Promise<DepartmentBudget[]> {
    const budgets = await this.getDepartmentBudgets();
    return budgets.filter((b) => b.departamento === departamento);
  }

  async getKPIsByHospital(hospital: string): Promise<FinancialKPI[]> {
    const kpis = await this.getFinancialKPIs();
    return kpis.filter((k) => k.hospital === hospital);
  }

  async getKPIsByMonth(mes: string): Promise<FinancialKPI[]> {
    const kpis = await this.getFinancialKPIs();
    return kpis.filter((k) => k.mes === mes);
  }

  async getCapacityByHospital(hospital: string): Promise<BedCapacityRecord[]> {
    const capacity = await this.getBedCapacity();
    return capacity.filter((c) => c.hospital === hospital);
  }

  async getCapacityByAlertLevel(level: AlertLevel): Promise<BedCapacityRecord[]> {
    const capacity = await this.getBedCapacity();
    return capacity.filter((c) => c.alertaCapacidad === level);
  }

  async getCriticalCapacity(): Promise<BedCapacityRecord[]> {
    const capacity = await this.getBedCapacity();
    return capacity.filter((c) => c.alertaCapacidad === 'rojo');
  }

  // ============================================================================
  // MÉTODOS DE ESTADÍSTICAS
  // ============================================================================

  async getFinancialStats(): Promise<FinancialStats> {
    const [budgets, kpis] = await Promise.all([
      this.getDepartmentBudgets(),
      this.getFinancialKPIs(),
    ]);

    // Obtener el mes más reciente
    const latestMonth = kpis.reduce((latest, kpi) => {
      return kpi.mes > latest ? kpi.mes : latest;
    }, '');

    const latestKPIs = kpis.filter((k) => k.mes === latestMonth);

    // Calcular totales
    const totalPresupuesto = budgets.reduce((sum, b) => sum + b.presupuestoAnualEuros, 0);
    const totalIngresos = latestKPIs.reduce((sum, k) => sum + k.ingresosTotales, 0);
    const totalGastos = latestKPIs.reduce((sum, k) => sum + k.gastosTotales, 0);
    const margenNetoTotal = latestKPIs.reduce((sum, k) => sum + k.margenNeto, 0);
    const roiPromedio =
      latestKPIs.length > 0 ? latestKPIs.reduce((sum, k) => sum + k.roi, 0) / latestKPIs.length : 0;

    // Estadísticas por hospital
    const hospitales = [...new Set(budgets.map((b) => b.hospital))];
    const porHospital = hospitales.map((hospital) => {
      const hospitalBudgets = budgets.filter((b) => b.hospital === hospital);
      const hospitalKPI = latestKPIs.find((k) => k.hospital === hospital);

      return {
        hospital,
        presupuesto: hospitalBudgets.reduce((sum, b) => sum + b.presupuestoAnualEuros, 0),
        ingresos: hospitalKPI?.ingresosTotales || 0,
        gastos: hospitalKPI?.gastosTotales || 0,
        margen: hospitalKPI?.margenNeto || 0,
        roi: hospitalKPI?.roi || 0,
      };
    });

    // Estadísticas por departamento
    const departamentos = [...new Set(budgets.map((b) => b.departamento))];
    const porDepartamento = departamentos.map((departamento) => {
      const deptBudgets = budgets.filter((b) => b.departamento === departamento);

      return {
        departamento,
        presupuestoTotal: deptBudgets.reduce((sum, b) => sum + b.presupuestoAnualEuros, 0),
        eficienciaPromedio:
          deptBudgets.reduce((sum, b) => sum + b.eficienciaCoste, 0) / deptBudgets.length,
        costePorPacientePromedio:
          deptBudgets.reduce((sum, b) => sum + b.costePorPaciente, 0) / deptBudgets.length,
      };
    });

    // Calcular tendencia (comparando con mes anterior)
    const meses = [...new Set(kpis.map((k) => k.mes))].sort();
    let tendencia: FinancialStats['tendencia'] = {
      direccion: 'stable',
      porcentajeCambio: 0,
    };

    if (meses.length >= 2) {
      const mesAnterior = meses[meses.length - 2];
      const kpisAnterior = kpis.filter((k) => k.mes === mesAnterior);
      const margenAnterior = kpisAnterior.reduce((sum, k) => sum + k.margenNeto, 0);

      if (margenAnterior !== 0) {
        const cambio = ((margenNetoTotal - margenAnterior) / Math.abs(margenAnterior)) * 100;
        tendencia = {
          direccion: cambio > 2 ? 'up' : cambio < -2 ? 'down' : 'stable',
          porcentajeCambio: parseFloat(cambio.toFixed(2)),
        };
      }
    }

    return {
      totalPresupuesto,
      totalIngresos,
      totalGastos,
      margenNetoTotal,
      roiPromedio,
      porHospital,
      porDepartamento,
      tendencia,
    };
  }

  async getCapacityStats(): Promise<CapacityStats> {
    const capacity = await this.getBedCapacity();

    const totalCamas = capacity.reduce((sum, c) => sum + c.camasTotales, 0);
    const totalOcupadas = capacity.reduce((sum, c) => sum + c.camasOcupadas, 0);
    const totalDisponibles = capacity.reduce((sum, c) => sum + c.camasDisponibles, 0);
    const ocupacionPromedio =
      capacity.length > 0
        ? capacity.reduce((sum, c) => sum + c.porcentajeOcupacion, 0) / capacity.length
        : 0;

    // Contar alertas
    const alertasActivas = {
      verdes: capacity.filter((c) => c.alertaCapacidad === 'verde').length,
      amarillas: capacity.filter((c) => c.alertaCapacidad === 'amarillo').length,
      rojas: capacity.filter((c) => c.alertaCapacidad === 'rojo').length,
    };

    // Por hospital
    const hospitales = [...new Set(capacity.map((c) => c.hospital))];
    const porHospital = hospitales.map((hospital) => {
      const hospitalCapacity = capacity.filter((c) => c.hospital === hospital);
      const camasTotales = hospitalCapacity.reduce((sum, c) => sum + c.camasTotales, 0);
      const camasOcupadas = hospitalCapacity.reduce((sum, c) => sum + c.camasOcupadas, 0);
      const ocupacion = camasTotales > 0 ? (camasOcupadas / camasTotales) * 100 : 0;

      // Determinar alerta general del hospital
      const tieneRojo = hospitalCapacity.some((c) => c.alertaCapacidad === 'rojo');
      const tieneAmarillo = hospitalCapacity.some((c) => c.alertaCapacidad === 'amarillo');
      const alertaGeneral: AlertLevel = tieneRojo ? 'rojo' : tieneAmarillo ? 'amarillo' : 'verde';

      return {
        hospital,
        camasTotales,
        camasOcupadas,
        ocupacion,
        alertaGeneral,
      };
    });

    // Por planta
    const plantas = [...new Set(capacity.map((c) => c.planta))];
    const porPlanta = plantas.map((planta) => {
      const plantaCapacity = capacity.filter((c) => c.planta === planta);

      return {
        planta,
        totalCamas: plantaCapacity.reduce((sum, c) => sum + c.camasTotales, 0),
        ocupacionPromedio:
          plantaCapacity.reduce((sum, c) => sum + c.porcentajeOcupacion, 0) / plantaCapacity.length,
        alertasRojas: plantaCapacity.filter((c) => c.alertaCapacidad === 'rojo').length,
      };
    });

    // Tendencia (basada en pacientes esperando vs altas en trámite)
    const totalEsperando = capacity.reduce((sum, c) => sum + c.pacientesEsperando, 0);
    const totalAltas = capacity.reduce((sum, c) => sum + c.altosTramite, 0);
    const diferencia = totalEsperando - totalAltas;

    const tendencia: CapacityStats['tendencia'] = {
      direccion: diferencia > 5 ? 'up' : diferencia < -5 ? 'down' : 'stable',
      porcentajeCambio: totalAltas > 0 ? (diferencia / totalAltas) * 100 : 0,
      tiempoHastaSaturacion:
        alertasActivas.rojas > 0
          ? Math.round((totalDisponibles / Math.max(diferencia, 1)) * 24)
          : undefined,
    };

    return {
      totalCamas,
      totalOcupadas,
      totalDisponibles,
      ocupacionPromedio,
      alertasActivas,
      porHospital,
      porPlanta,
      tendencia,
    };
  }

  // ============================================================================
  // MÉTODOS DE UTILIDAD
  // ============================================================================

  /**
   * Recarga todos los datos (útil para actualizaciones en tiempo real)
   */
  async reloadData(): Promise<void> {
    this.isLoaded = false;
    this.departmentBudgets = [];
    this.financialKPIs = [];
    this.historicalTrends = [];
    this.efficiencyAnalysis = [];
    this.bedCapacity = [];
    await this.loadAllData();
  }

  /**
   * Obtiene lista única de hospitales
   */
  async getHospitals(): Promise<string[]> {
    const budgets = await this.getDepartmentBudgets();
    return [...new Set(budgets.map((b) => b.hospital))];
  }

  /**
   * Obtiene lista única de departamentos
   */
  async getDepartments(): Promise<string[]> {
    const budgets = await this.getDepartmentBudgets();
    return [...new Set(budgets.map((b) => b.departamento))];
  }

  /**
   * Obtiene lista única de plantas
   */
  async getPlants(): Promise<string[]> {
    const capacity = await this.getBedCapacity();
    return [...new Set(capacity.map((c) => c.planta))];
  }
}

// Exportar instancia singleton
export const financialDataService = new FinancialDataService();
