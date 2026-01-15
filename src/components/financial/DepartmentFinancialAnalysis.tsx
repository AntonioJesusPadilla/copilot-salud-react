import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  DepartmentBudget,
  DEPARTMENT_CONFIGS,
  HOSPITAL_CONFIGS,
  getEfficiencyColor,
  getSatisfactionColor,
} from '../../types/financial';

// ============================================================================
// TIPOS
// ============================================================================

export interface DepartmentFinancialAnalysisProps {
  data: DepartmentBudget[];
  selectedHospital?: string | null;
  selectedDepartment?: string | null;
  title?: string;
  height?: number;
  onDepartmentSelect?: (department: string) => void;
}

type ViewMode = 'overview' | 'budget' | 'efficiency' | 'satisfaction';

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(2)}M €`;
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}K €`;
  return `${value.toLocaleString('es-ES')} €`;
}

function getDepartmentColor(department: string): string {
  const config = DEPARTMENT_CONFIGS[department as keyof typeof DEPARTMENT_CONFIGS];
  return config?.color || '#6B7280';
}

function getDepartmentIcon(department: string): string {
  const config = DEPARTMENT_CONFIGS[department as keyof typeof DEPARTMENT_CONFIGS];
  return config?.icon || '🏥';
}

// ============================================================================
// COMPONENTE DE DETALLE DE DEPARTAMENTO
// ============================================================================

interface DepartmentDetailProps {
  department: DepartmentBudget;
}

function DepartmentDetail({ department }: DepartmentDetailProps) {
  const hospitalConfig = HOSPITAL_CONFIGS[department.hospital as keyof typeof HOSPITAL_CONFIGS];

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{getDepartmentIcon(department.departamento)}</span>
          <div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {department.departamento}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span
                className="inline-block w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: hospitalConfig?.color || '#6B7280' }}
              />
              {department.hospital}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className="text-2xl font-bold"
            style={{ color: getDepartmentColor(department.departamento) }}
          >
            {formatCurrency(department.presupuestoAnualEuros)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Presupuesto anual</p>
        </div>
      </div>

      {/* Métricas en grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Personal</p>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {department.personalPlantilla}
          </p>
        </div>
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Pacientes Est.</p>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {department.pacientesEstimados.toLocaleString('es-ES')}
          </p>
        </div>
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Coste/Paciente</p>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {formatCurrency(department.costePorPaciente)}
          </p>
        </div>
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Margen</p>
          <p
            className="text-lg font-bold"
            style={{ color: department.margenOperativo >= 0 ? '#10B981' : '#EF4444' }}
          >
            {formatCurrency(department.margenOperativo)}
          </p>
        </div>
      </div>

      {/* Indicadores de rendimiento */}
      <div className="grid grid-cols-3 gap-3 mt-3">
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Eficiencia</span>
            <span
              className="text-sm font-bold"
              style={{ color: getEfficiencyColor(department.eficienciaCoste) }}
            >
              {(department.eficienciaCoste * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, department.eficienciaCoste * 100)}%`,
                backgroundColor: getEfficiencyColor(department.eficienciaCoste),
              }}
            />
          </div>
        </div>
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Ocupación</span>
            <span className="text-sm font-bold text-blue-600">
              {department.tasaOcupacion.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${Math.min(100, department.tasaOcupacion)}%` }}
            />
          </div>
        </div>
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Satisfacción</span>
            <span
              className="text-sm font-bold"
              style={{ color: getSatisfactionColor(department.satisfaccionPaciente) }}
            >
              {department.satisfaccionPaciente.toFixed(1)}/5
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(department.satisfaccionPaciente / 5) * 100}%`,
                backgroundColor: getSatisfactionColor(department.satisfaccionPaciente),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

function DepartmentFinancialAnalysis({
  data,
  selectedHospital,
  selectedDepartment,
  title = 'Análisis Financiero por Departamento',
  height = 350,
  onDepartmentSelect,
}: DepartmentFinancialAnalysisProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  // Filtrar datos según selección
  const filteredData = useMemo(() => {
    let filtered = [...data];
    if (selectedHospital) {
      filtered = filtered.filter((d) => d.hospital === selectedHospital);
    }
    return filtered;
  }, [data, selectedHospital]);

  // Agregar datos por departamento
  const aggregatedData = useMemo(() => {
    const deptMap = new Map<
      string,
      {
        departamento: string;
        presupuestoTotal: number;
        personalTotal: number;
        pacientesTotal: number;
        eficienciaPromedio: number;
        satisfaccionPromedio: number;
        margenTotal: number;
        count: number;
      }
    >();

    filteredData.forEach((d) => {
      const existing = deptMap.get(d.departamento) || {
        departamento: d.departamento,
        presupuestoTotal: 0,
        personalTotal: 0,
        pacientesTotal: 0,
        eficienciaPromedio: 0,
        satisfaccionPromedio: 0,
        margenTotal: 0,
        count: 0,
      };

      existing.presupuestoTotal += d.presupuestoAnualEuros;
      existing.personalTotal += d.personalPlantilla;
      existing.pacientesTotal += d.pacientesEstimados;
      existing.eficienciaPromedio += d.eficienciaCoste;
      existing.satisfaccionPromedio += d.satisfaccionPaciente;
      existing.margenTotal += d.margenOperativo;
      existing.count += 1;

      deptMap.set(d.departamento, existing);
    });

    return Array.from(deptMap.values())
      .map((d) => ({
        ...d,
        eficienciaPromedio: d.eficienciaPromedio / d.count,
        satisfaccionPromedio: d.satisfaccionPromedio / d.count,
        color: getDepartmentColor(d.departamento),
        icon: getDepartmentIcon(d.departamento),
      }))
      .sort((a, b) => b.presupuestoTotal - a.presupuestoTotal);
  }, [filteredData]);

  // Datos para el gráfico de distribución (pie chart)
  const pieData = useMemo(() => {
    return aggregatedData.map((d) => ({
      name: d.departamento,
      value: d.presupuestoTotal,
      color: d.color,
    }));
  }, [aggregatedData]);

  // Detalle del departamento seleccionado
  const selectedDeptDetail = useMemo(() => {
    if (!selectedDepartment) return null;
    return filteredData.find((d) => d.departamento === selectedDepartment) || null;
  }, [filteredData, selectedDepartment]);

  // Tooltip personalizado
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      name: string;
      payload?: { departamento?: string; name?: string };
    }>;
  }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
          {payload[0]?.payload?.departamento || payload[0]?.payload?.name}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs text-gray-600 dark:text-gray-300">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {aggregatedData.length} departamentos • {filteredData.length} registros
            {selectedHospital && ` • ${selectedHospital}`}
          </p>
        </div>

        {/* Selector de vista */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['overview', 'budget', 'efficiency', 'satisfaction'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === mode
                  ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {mode === 'overview' && 'Resumen'}
              {mode === 'budget' && 'Presupuesto'}
              {mode === 'efficiency' && 'Eficiencia'}
              {mode === 'satisfaction' && 'Satisfacción'}
            </button>
          ))}
        </div>
      </div>

      {/* Detalle del departamento seleccionado */}
      {selectedDeptDetail && <DepartmentDetail department={selectedDeptDetail} />}

      {/* Contenido según modo de vista */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Distribución de presupuesto (pie chart) */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Distribución de Presupuesto
            </h4>
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${(name ?? '').substring(0, 8)}... ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      cursor="pointer"
                      onClick={() => onDepartmentSelect?.(entry.name)}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Lista de departamentos */}
          <div className="max-h-[350px] overflow-y-auto">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Departamentos
            </h4>
            <div className="space-y-2">
              {aggregatedData.map((dept) => (
                <div
                  key={dept.departamento}
                  onClick={() => onDepartmentSelect?.(dept.departamento)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedDepartment === dept.departamento
                      ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                      : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{dept.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        {dept.departamento}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {dept.personalTotal} empleados • {dept.pacientesTotal.toLocaleString()} pac.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: dept.color }}>
                      {formatCurrency(dept.presupuestoTotal)}
                    </p>
                    <p
                      className={`text-xs ${dept.margenTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {dept.margenTotal >= 0 ? '+' : ''}
                      {formatCurrency(dept.margenTotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'budget' && (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={aggregatedData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="departamento"
              width={120}
              tick={{ fontSize: 11, fill: '#6B7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="presupuestoTotal" name="Presupuesto" fill="#3B82F6">
              {aggregatedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {viewMode === 'efficiency' && (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={aggregatedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="departamento"
              tick={{ fontSize: 10, fill: '#6B7280' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis domain={[0, 1.2]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
            <Tooltip
              formatter={(value) => [`${((value as number) * 100).toFixed(1)}%`, 'Eficiencia']}
            />
            <Bar dataKey="eficienciaPromedio" name="Eficiencia">
              {aggregatedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getEfficiencyColor(entry.eficienciaPromedio)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {viewMode === 'satisfaction' && (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={aggregatedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="departamento"
              tick={{ fontSize: 10, fill: '#6B7280' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis domain={[0, 5]} tickFormatter={(v) => `${v}/5`} />
            <Tooltip formatter={(value) => [`${(value as number).toFixed(2)}/5`, 'Satisfacción']} />
            <Bar dataKey="satisfaccionPromedio" name="Satisfacción">
              {aggregatedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getSatisfactionColor(entry.satisfaccionPromedio)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default DepartmentFinancialAnalysis;
