# 📋 PLAN DE EXPANSIÓN POR FASES - COPILOT SALUD REACT

**Proyecto:** Copilot Salud React
**Objetivo:** Añadir módulo de Gestión Financiera y Capacidad Hospitalaria
**Fecha inicio:** 15 de enero de 2026
**Estimación total:** 14-18 días de desarrollo

---

## 📊 RESUMEN DE FASES

| Fase | Descripción                                     | Días | Estado        | Riesgo   |
| ---- | ----------------------------------------------- | ---- | ------------- | -------- |
| 1    | Preparación de datos (CSV + tipos + loader)     | 1    | ✅ Completado | 🟢 Bajo  |
| 2    | Stores Zustand (financialStore, capacityStore)  | 1    | ⬜ Pendiente  | 🟢 Bajo  |
| 3    | Servicios de análisis básicos                   | 2    | ⬜ Pendiente  | 🟡 Medio |
| 4    | Componentes financieros (KPI cards, gráficos)   | 2-3  | ⬜ Pendiente  | 🟢 Bajo  |
| 5    | Página Financial Dashboard                      | 1    | ⬜ Pendiente  | 🟢 Bajo  |
| 6    | Componentes de capacidad hospitalaria (CRÍTICO) | 2-3  | ⬜ Pendiente  | 🟡 Medio |
| 7    | Página Capacity Management                      | 1    | ⬜ Pendiente  | 🟢 Bajo  |
| 8    | Sistema de alertas y predicciones               | 2    | ⬜ Pendiente  | 🟡 Medio |
| 9    | Integración con navegación y rutas              | 0.5  | ⬜ Pendiente  | 🟢 Bajo  |
| 10   | Integración con Chat AI                         | 1-2  | ⬜ Pendiente  | 🟡 Medio |
| 11   | Testing y ajustes finales                       | 1-2  | ⬜ Pendiente  | 🟢 Bajo  |

**Leyenda de estados:**

- ⬜ Pendiente
- 🔄 En progreso
- ✅ Completado
- ❌ Bloqueado

---

## 🔒 PRINCIPIOS DE SEGURIDAD (NO ROMPER PRODUCCIÓN)

### Reglas de Oro

1. **Archivos nuevos primero** - Crear tipos, servicios y componentes sin tocar código existente
2. **Testing antes de integrar** - Cada fase se prueba de forma aislada
3. **Rutas protegidas** - Las nuevas páginas solo se activan cuando están listas
4. **Commits atómicos** - Un commit por fase completa y funcionando
5. **Verificación de build** - `npm run build` debe pasar antes de cada commit
6. **Verificación de tests** - `npm test` debe pasar antes de cada commit

### Checklist Pre-Commit (OBLIGATORIO)

```bash
# Ejecutar ANTES de cada commit de fase
npm run lint          # Sin errores
npm run type-check    # Sin errores TypeScript
npm run build         # Build exitoso
npm test              # Tests pasan
```

---

## 📁 ESTRUCTURA DE ARCHIVOS NUEVOS

```
copilot-salud-react/
├── public/
│   └── data/
│       └── raw/                                    # CSV existentes + nuevos
│           ├── accesibilidad_sanitaria_2025.csv   # ✅ Existente
│           ├── demografia_malaga_2025.csv         # ✅ Existente
│           ├── hospitales_malaga_2025.csv         # ✅ Existente
│           ├── indicadores_salud_2025.csv         # ✅ Existente
│           ├── servicios_sanitarios_2025.csv      # ✅ Existente
│           ├── presupuesto_departamentos_malaga.csv    # 🆕 FASE 1
│           ├── kpis_financieros_2025.csv               # 🆕 FASE 1
│           ├── tendencias_historicas_2020_2025.csv     # 🆕 FASE 1
│           ├── analisis_eficiencia_departamental.csv   # 🆕 FASE 1
│           └── gestion_camas_hospitalarias.csv         # 🆕 FASE 1 (CRÍTICO)
│
├── src/
│   ├── types/
│   │   ├── index.ts                               # ✅ Existente
│   │   ├── financial.ts                           # 🆕 FASE 1
│   │   ├── capacity.ts                            # 🆕 FASE 1
│   │   └── analysis.ts                            # 🆕 FASE 1
│   │
│   ├── store/
│   │   ├── financialStore.ts                      # 🆕 FASE 2
│   │   ├── capacityStore.ts                       # 🆕 FASE 2
│   │   └── analysisStore.ts                       # 🆕 FASE 2
│   │
│   ├── services/
│   │   ├── financialDataService.ts                # 🆕 FASE 1
│   │   ├── financialAnalysisService.ts            # 🆕 FASE 3
│   │   ├── predictionService.ts                   # 🆕 FASE 3
│   │   ├── capacityPredictionService.ts           # 🆕 FASE 8
│   │   ├── capacityAlertService.ts                # 🆕 FASE 8
│   │   └── directivesGeneratorService.ts          # 🆕 FASE 3
│   │
│   ├── components/
│   │   ├── financial/                             # 🆕 FASE 4
│   │   │   ├── FinancialKPICard.tsx
│   │   │   ├── FinancialExecutiveDashboard.tsx
│   │   │   ├── DepartmentFinancialAnalysis.tsx
│   │   │   ├── HistoricalTrendsChart.tsx
│   │   │   ├── BenchmarkingChart.tsx
│   │   │   └── DirectivesPanel.tsx
│   │   │
│   │   ├── capacity/                              # 🆕 FASE 6
│   │   │   ├── BedCapacityMonitor.tsx
│   │   │   ├── CapacityAlertsPanel.tsx
│   │   │   ├── CapacityPredictionChart.tsx
│   │   │   ├── PlantOpeningRecommendations.tsx
│   │   │   └── CapacityHeatmap.tsx
│   │   │
│   │   └── analysis/                              # 🆕 FASE 4
│   │       ├── TrendAnalysisWidget.tsx
│   │       ├── AnomalyDetectionPanel.tsx
│   │       └── ComparisonInsights.tsx
│   │
│   └── pages/
│       ├── FinancialDashboardPage.tsx             # 🆕 FASE 5
│       ├── CapacityManagementPage.tsx             # 🆕 FASE 7
│       └── AnalysisReportsPage.tsx                # 🆕 FASE 5
│
└── tests/
    └── services/
        ├── financialAnalysisService.test.ts       # 🆕 FASE 11
        ├── predictionService.test.ts              # 🆕 FASE 11
        └── capacityAlertService.test.ts           # 🆕 FASE 11
```

---

## 📍 FASE 1: PREPARACIÓN DE DATOS

**Duración estimada:** 1 día
**Riesgo:** 🟢 Bajo
**Dependencias:** Ninguna
**Archivos a crear:** 8
**Archivos a modificar:** 0 (cero impacto en producción)

### Objetivos

1. Crear los 5 archivos CSV con datos simulados
2. Crear tipos TypeScript para datos financieros y capacidad
3. Crear servicio de carga de datos (financialDataService.ts)
4. Verificar que los datos se cargan correctamente

### Tareas Detalladas

#### 1.1 Crear archivos CSV en `public/data/raw/`

**Archivo 1:** `presupuesto_departamentos_malaga.csv`

- 40 filas (4 hospitales × 10 departamentos)
- 16 columnas
- Datos: presupuestos, costes por categoría, eficiencia

**Archivo 2:** `kpis_financieros_2025.csv`

- 24 filas (4 hospitales × 6 meses)
- 17 columnas
- Datos: ingresos, gastos, márgenes, ROI, EBITDA

**Archivo 3:** `tendencias_historicas_2020_2025.csv`

- 30 filas (muestras representativas)
- 11 columnas
- Datos: evolución 6 años de KPIs clave

**Archivo 4:** `analisis_eficiencia_departamental.csv`

- 20 filas (muestras representativas)
- 13 columnas
- Datos: scores de eficiencia, rankings, certificaciones

**Archivo 5:** `gestion_camas_hospitalarias.csv` ⚠️ CRÍTICO

- 32 filas (4 hospitales × 8 departamentos)
- 17 columnas
- Datos: camas, ocupación, alertas, predicciones

#### 1.2 Crear tipos TypeScript

**Archivo:** `src/types/financial.ts`

```typescript
// Interfaces para:
// - DepartmentBudget
// - FinancialKPI
// - HistoricalTrend
// - EfficiencyAnalysis
```

**Archivo:** `src/types/capacity.ts`

```typescript
// Interfaces para:
// - BedCapacity
// - CapacityAlert
// - PlantOpeningRecommendation
// - CapacityPrediction
```

**Archivo:** `src/types/analysis.ts`

```typescript
// Interfaces para:
// - TrendAnalysis
// - Anomaly
// - ComparisonInsight
// - Directive
// - Prediction
```

#### 1.3 Crear servicio de carga de datos

**Archivo:** `src/services/financialDataService.ts`

```typescript
// Funciones:
// - loadDepartmentBudgets(): Promise<DepartmentBudget[]>
// - loadFinancialKPIs(): Promise<FinancialKPI[]>
// - loadHistoricalTrends(): Promise<HistoricalTrend[]>
// - loadEfficiencyAnalysis(): Promise<EfficiencyAnalysis[]>
// - loadBedCapacity(): Promise<BedCapacity[]>
```

### Verificación de Fase 1

```bash
# Comprobar que los CSV existen y se leen
npm run dev
# En consola del navegador:
# - Verificar que no hay errores 404 al cargar CSV
# - Verificar que los tipos TypeScript compilan sin errores

npm run lint
npm run type-check
npm run build
```

### Criterios de Aceptación

- [x] 5 archivos CSV creados en `public/data/raw/`
- [x] 3 archivos de tipos creados en `src/types/`
- [x] 1 servicio de carga creado en `src/services/`
- [x] `npm run build` pasa sin errores
- [x] `npm run lint` pasa sin errores
- [ ] Los datos se cargan correctamente (verificar en consola)

### Commit de Fase 1

```bash
git add .
git commit -m "feat(financial): Fase 1 - Preparación de datos financieros y capacidad

- Añadidos 5 nuevos CSV con datos financieros y de capacidad hospitalaria
- Creados tipos TypeScript: financial.ts, capacity.ts, analysis.ts
- Creado servicio financialDataService.ts para carga de datos
- Datos simulados realistas para 4 hospitales de Málaga

Archivos nuevos:
- public/data/raw/presupuesto_departamentos_malaga.csv
- public/data/raw/kpis_financieros_2025.csv
- public/data/raw/tendencias_historicas_2020_2025.csv
- public/data/raw/analisis_eficiencia_departamental.csv
- public/data/raw/gestion_camas_hospitalarias.csv
- src/types/financial.ts
- src/types/capacity.ts
- src/types/analysis.ts
- src/services/financialDataService.ts

```

---

## 📍 FASE 2: STORES ZUSTAND

**Duración estimada:** 1 día
**Riesgo:** 🟢 Bajo
**Dependencias:** Fase 1 completada
**Archivos a crear:** 3
**Archivos a modificar:** 0 (cero impacto en producción)

### Objetivos

1. Crear store para datos financieros
2. Crear store para capacidad hospitalaria
3. Crear store para análisis y directrices
4. Seguir el patrón de los stores existentes (kpiStore, mapStore)

### Tareas Detalladas

#### 2.1 Crear `src/store/financialStore.ts`

**Estado:**

```typescript
interface FinancialState {
  // Datos
  departmentBudgets: DepartmentBudget[];
  financialKPIs: FinancialKPI[];
  historicalTrends: HistoricalTrend[];
  efficiencyAnalysis: EfficiencyAnalysis[];

  // Filtros
  selectedHospital: string | null;
  selectedDepartment: string | null;
  selectedPeriod: { start: string; end: string } | null;

  // Estado de carga
  isLoading: boolean;
  error: string | null;

  // Datos derivados
  filteredBudgets: DepartmentBudget[];
  stats: FinancialStats | null;
}
```

**Acciones:**

```typescript
// Carga de datos
loadFinancialData: () => Promise<void>

// Filtros
setSelectedHospital: (hospital: string | null) => void
setSelectedDepartment: (department: string | null) => void
setSelectedPeriod: (period: { start: string; end: string } | null) => void
applyFilters: () => void
clearFilters: () => void

// Getters
getKPIsByHospital: (hospital: string) => FinancialKPI[]
getBudgetsByDepartment: (department: string) => DepartmentBudget[]
```

#### 2.2 Crear `src/store/capacityStore.ts`

**Estado:**

```typescript
interface CapacityState {
  // Datos
  bedCapacity: BedCapacity[];
  alerts: CapacityAlert[];
  predictions: CapacityPrediction[];

  // Filtros
  selectedHospital: string | null;
  selectedDepartment: string | null;
  alertSeverityFilter: 'all' | 'warning' | 'critical';

  // Estado
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;

  // Datos derivados
  filteredCapacity: BedCapacity[];
  activeAlerts: CapacityAlert[];
  criticalDepartments: BedCapacity[];
}
```

**Acciones:**

```typescript
// Carga de datos
loadCapacityData: () => Promise<void>
refreshCapacity: () => Promise<void>

// Filtros
setSelectedHospital: (hospital: string | null) => void
setSelectedDepartment: (department: string | null) => void
setAlertSeverityFilter: (severity: 'all' | 'warning' | 'critical') => void

// Alertas
getActiveAlerts: () => CapacityAlert[]
getCriticalDepartments: () => BedCapacity[]
getDepartmentsNeedingPlantOpening: () => BedCapacity[]
```

#### 2.3 Crear `src/store/analysisStore.ts`

**Estado:**

```typescript
interface AnalysisState {
  // Resultados de análisis
  trendAnalysis: TrendAnalysis[];
  anomalies: Anomaly[];
  comparisons: ComparisonInsight[];
  directives: Directive[];
  predictions: Prediction[];

  // Estado
  isAnalyzing: boolean;
  lastAnalysisDate: string | null;

  // Filtros
  directivePriorityFilter: 'all' | 'alta' | 'media' | 'baja';
}
```

**Acciones:**

```typescript
// Ejecutar análisis
runFullAnalysis: () => Promise<void>
runTrendAnalysis: () => Promise<void>
runAnomalyDetection: () => Promise<void>
generateDirectives: () => Promise<void>

// Filtros
setDirectivePriorityFilter: (priority: 'all' | 'alta' | 'media' | 'baja') => void

// Getters
getHighPriorityDirectives: () => Directive[]
getCriticalAnomalies: () => Anomaly[]
```

### Verificación de Fase 2

```bash
npm run lint
npm run type-check
npm run build

# Verificar en consola del navegador:
# - Importar stores y verificar que funcionan
# - Llamar a loadFinancialData() y verificar datos
```

### Criterios de Aceptación

- [ ] financialStore.ts creado y funcional
- [ ] capacityStore.ts creado y funcional
- [ ] analysisStore.ts creado y funcional
- [ ] Todos los stores siguen el patrón de los existentes
- [ ] `npm run build` pasa sin errores
- [ ] Los datos se cargan correctamente desde los stores

### Commit de Fase 2

```bash
git add .
git commit -m "feat(financial): Fase 2 - Stores Zustand para datos financieros y capacidad

- Creado financialStore.ts con estado y acciones para datos financieros
- Creado capacityStore.ts con estado y acciones para capacidad hospitalaria
- Creado analysisStore.ts con estado y acciones para análisis
- Siguiendo patrón establecido en kpiStore y mapStore

Archivos nuevos:
- src/store/financialStore.ts
- src/store/capacityStore.ts
- src/store/analysisStore.ts

```

---

## 📍 FASE 3: SERVICIOS DE ANÁLISIS

**Duración estimada:** 2 días
**Riesgo:** 🟡 Medio
**Dependencias:** Fase 1 y 2 completadas
**Archivos a crear:** 3
**Archivos a modificar:** 0 (cero impacto en producción)

### Objetivos

1. Crear servicio de análisis financiero
2. Crear servicio de predicciones (regresión lineal simple)
3. Crear servicio de generación de directrices
4. Implementar lógica de detección de anomalías

### Tareas Detalladas

#### 3.1 Crear `src/services/financialAnalysisService.ts`

**Funciones principales:**

```typescript
// Análisis de tendencias
analyzeTrends(data: FinancialKPI[]): TrendAnalysis[]
// Detecta tendencias ascendentes/descendentes/estables
// Calcula porcentaje de cambio y significancia

// Detección de anomalías
detectAnomalies(data: DepartmentBudget[]): Anomaly[]
// Identifica valores fuera de rango (±2 desviaciones estándar)
// Genera recomendaciones por anomalía

// Comparativas
generateComparisons(data: DepartmentBudget[]): ComparisonInsight[]
// Compara hospitales entre sí
// Identifica best/worst performers
// Calcula gap y potencial de ahorro

// Cálculos financieros
calculateROI(income: number, investment: number): number
calculateMargin(income: number, expenses: number): number
calculateEfficiencyRatio(actual: number, standard: number): number
```

#### 3.2 Crear `src/services/predictionService.ts`

**Funciones principales:**

```typescript
// Predicción con regresión lineal
predictNextMonths(
  historicalData: number[],
  monthsAhead: number
): Prediction

// Calcular confianza de predicción
calculateConfidence(
  historicalData: number[],
  predictedValue: number
): number

// Identificar factores influyentes
identifyInfluencingFactors(
  data: FinancialKPI[]
): string[]

// Generar escenarios
generateScenarios(
  baseValue: number,
  variance: number
): { best: number; expected: number; worst: number }
```

#### 3.3 Crear `src/services/directivesGeneratorService.ts`

**Funciones principales:**

```typescript
// Generar directrices automáticas
generateDirectives(
  anomalies: Anomaly[],
  comparisons: ComparisonInsight[],
  trends: TrendAnalysis[]
): Directive[]

// Priorizar acciones
prioritizeActions(directives: Directive[]): Directive[]
// Ordena por: impacto financiero × urgencia

// Estimar impacto
estimateImpact(directive: Directive): {
  financialImpact: number;
  timeframe: string;
  resources: string;
}

// Formatear directriz
formatDirective(directive: Directive): string
// Genera texto claro y accionable
```

### Verificación de Fase 3

```bash
npm run lint
npm run type-check
npm run build
npm test  # Si hay tests

# Verificar en consola:
# - Importar servicios y ejecutar funciones con datos de prueba
# - Verificar que los cálculos son correctos
```

### Criterios de Aceptación

- [ ] financialAnalysisService.ts creado con todas las funciones
- [ ] predictionService.ts creado con regresión lineal funcional
- [ ] directivesGeneratorService.ts creado y generando directrices
- [ ] Los cálculos financieros son correctos (ROI, márgenes, etc.)
- [ ] Las predicciones tienen sentido con los datos de prueba
- [ ] `npm run build` pasa sin errores

### Commit de Fase 3

```bash
git add .
git commit -m "feat(financial): Fase 3 - Servicios de análisis financiero

- Creado financialAnalysisService.ts con análisis de tendencias y anomalías
- Creado predictionService.ts con regresión lineal simple
- Creado directivesGeneratorService.ts para generación de recomendaciones
- Implementada lógica de detección de anomalías (±2σ)
- Implementado cálculo de ROI, márgenes y ratios de eficiencia

Archivos nuevos:
- src/services/financialAnalysisService.ts
- src/services/predictionService.ts
- src/services/directivesGeneratorService.ts

```

---

## 📍 FASE 4: COMPONENTES FINANCIEROS

**Duración estimada:** 2-3 días
**Riesgo:** 🟢 Bajo
**Dependencias:** Fases 1, 2 y 3 completadas
**Archivos a crear:** 9
**Archivos a modificar:** 0 (cero impacto en producción)

### Objetivos

1. Crear componentes de visualización financiera
2. Crear gráficos con Recharts
3. Crear panel de directrices
4. Mantener consistencia con diseño existente (dark mode, colores)

### Tareas Detalladas

#### 4.1 Componentes en `src/components/financial/`

**FinancialKPICard.tsx**

- Card individual para KPI financiero
- Sparkline de tendencia (últimos 6 meses)
- Indicador de variación (%, flecha arriba/abajo)
- Color según threshold (verde/amarillo/rojo)
- Compatible con dark mode

**FinancialExecutiveDashboard.tsx**

- Grid de KPIs principales (ROI, Margen Neto, EBITDA, Flujo Caja)
- Gráfico de líneas: Ingresos vs Gastos (últimos 6 meses)
- Gráfico de barras: Márgenes por hospital
- Gráfico circular: Distribución de presupuesto
- Filtros por hospital y período

**DepartmentFinancialAnalysis.tsx**

- Selector de hospital y departamento
- Gráfico de barras agrupadas: Desglose de costes
- Gráfico de dispersión: Coste/paciente vs Satisfacción
- Tabla con métricas de eficiencia

**HistoricalTrendsChart.tsx**

- Gráfico de líneas múltiples: Evolución 2020-2025
- Selector de KPI a visualizar
- Línea de predicción para 2026
- Bandas de confianza

**BenchmarkingChart.tsx**

- Gráfico de barras horizontales: Ranking de hospitales
- Gráfico de radar: Comparativa multidimensional
- Métricas: Eficiencia, Satisfacción, ROI, Innovación

**DirectivesPanel.tsx**

- Lista priorizada de directrices
- Agrupadas por prioridad (Alta/Media/Baja)
- Cada directriz con: título, área, impacto, plazo, recursos
- Botones de acción: "Marcar completada", "Ver detalles"

#### 4.2 Componentes en `src/components/analysis/`

**TrendAnalysisWidget.tsx**

- Lista de tendencias detectadas
- Cada tendencia con: KPI, dirección (↑↓→), %, interpretación
- Nivel de significancia

**AnomalyDetectionPanel.tsx**

- Tabla de anomalías detectadas
- Columnas: Departamento, KPI, Valor actual, Rango esperado, Desviación
- Severidad con colores (amarillo=warning, rojo=critical)

**ComparisonInsights.tsx**

- Cards con insights de comparación
- Mejor performer vs Peor performer
- Gap de rendimiento
- Potencial de ahorro

### Verificación de Fase 4

```bash
npm run lint
npm run type-check
npm run build

# Verificar visualmente:
# - Crear página temporal para probar componentes
# - Verificar dark mode
# - Verificar responsive
```

### Criterios de Aceptación

- [ ] 6 componentes financieros creados y funcionales
- [ ] 3 componentes de análisis creados y funcionales
- [ ] Todos los gráficos renderizan correctamente con Recharts
- [ ] Dark mode funciona en todos los componentes
- [ ] Responsive en mobile/tablet/desktop
- [ ] Colores consistentes (#1FB6C3 turquesa, #1E3A5F azul oscuro)
- [ ] `npm run build` pasa sin errores

### Commit de Fase 4

```bash
git add .
git commit -m "feat(financial): Fase 4 - Componentes financieros y de análisis

- Creado FinancialKPICard.tsx con sparklines y indicadores
- Creado FinancialExecutiveDashboard.tsx con gráficos Recharts
- Creado DepartmentFinancialAnalysis.tsx para análisis por departamento
- Creado HistoricalTrendsChart.tsx con tendencias y predicciones
- Creado BenchmarkingChart.tsx para comparativas
- Creado DirectivesPanel.tsx para recomendaciones priorizadas
- Creados componentes de análisis: TrendAnalysisWidget, AnomalyDetectionPanel, ComparisonInsights
- Todos los componentes compatibles con dark mode y responsive

Archivos nuevos:
- src/components/financial/FinancialKPICard.tsx
- src/components/financial/FinancialExecutiveDashboard.tsx
- src/components/financial/DepartmentFinancialAnalysis.tsx
- src/components/financial/HistoricalTrendsChart.tsx
- src/components/financial/BenchmarkingChart.tsx
- src/components/financial/DirectivesPanel.tsx
- src/components/analysis/TrendAnalysisWidget.tsx
- src/components/analysis/AnomalyDetectionPanel.tsx
- src/components/analysis/ComparisonInsights.tsx

```

---

## 📍 FASE 5: PÁGINA FINANCIAL DASHBOARD

**Duración estimada:** 1 día
**Riesgo:** 🟢 Bajo
**Dependencias:** Fase 4 completada
**Archivos a crear:** 2
**Archivos a modificar:** 0 (todavía no integrar en rutas)

### Objetivos

1. Crear página principal de dashboard financiero
2. Crear página de reportes de análisis
3. Implementar navegación por tabs
4. NO integrar en App.tsx todavía (eso es Fase 9)

### Tareas Detalladas

#### 5.1 Crear `src/pages/FinancialDashboardPage.tsx`

**Layout:**

- Header con título y filtros globales (fecha, hospital)
- Tabs:
  - "Vista Ejecutiva" → FinancialExecutiveDashboard
  - "Por Departamento" → DepartmentFinancialAnalysis
  - "Tendencias" → HistoricalTrendsChart
  - "Benchmarking" → BenchmarkingChart
- Botón "Exportar Informe Completo"

#### 5.2 Crear `src/pages/AnalysisReportsPage.tsx`

**Layout:**

- Secciones:
  - "Análisis de Tendencias" → TrendAnalysisWidget
  - "Anomalías Detectadas" → AnomalyDetectionPanel
  - "Comparativas" → ComparisonInsights
  - "Directrices Recomendadas" → DirectivesPanel
- Botón "Generar Nuevo Análisis"
- Indicador "Última fecha de análisis"

### Verificación de Fase 5

```bash
npm run lint
npm run type-check
npm run build

# Verificar importando manualmente las páginas en un componente de prueba
```

### Criterios de Aceptación

- [ ] FinancialDashboardPage.tsx creado con todas las tabs
- [ ] AnalysisReportsPage.tsx creado con todas las secciones
- [ ] Navegación por tabs funcional
- [ ] Filtros globales conectados a los stores
- [ ] `npm run build` pasa sin errores

### Commit de Fase 5

```bash
git add .
git commit -m "feat(financial): Fase 5 - Páginas Financial Dashboard y Analysis Reports

- Creado FinancialDashboardPage.tsx con navegación por tabs
- Creado AnalysisReportsPage.tsx con secciones de análisis
- Implementados filtros globales conectados a financialStore
- Añadida funcionalidad de exportación de informes
- Páginas listas para integración en rutas (Fase 9)

Archivos nuevos:
- src/pages/FinancialDashboardPage.tsx
- src/pages/AnalysisReportsPage.tsx

```

---

## 📍 FASE 6: COMPONENTES DE CAPACIDAD HOSPITALARIA ⚠️ CRÍTICO

**Duración estimada:** 2-3 días
**Riesgo:** 🟡 Medio
**Dependencias:** Fases 1 y 2 completadas
**Archivos a crear:** 5
**Archivos a modificar:** 0 (cero impacto en producción)

### Objetivos

1. Crear componentes de monitorización de capacidad
2. Implementar sistema de alertas visuales (verde/amarillo/rojo)
3. Crear visualizaciones de ocupación en tiempo real
4. Implementar recomendaciones de apertura de plantas

### Tareas Detalladas

#### 6.1 Componentes en `src/components/capacity/`

**BedCapacityMonitor.tsx**

- Dashboard de capacidad en tiempo real
- Grid de cards por departamento con:
  - Indicador visual de ocupación (barra de progreso)
  - Color según estado: verde <85%, amarillo 85-90%, rojo >90%
  - Número de camas: ocupadas/total
  - Camas disponibles
  - Pacientes con alta programada 24h
- Filtros por hospital y departamento

**CapacityAlertsPanel.tsx**

- Panel de alertas activas ordenadas por severidad
- Cada alerta con:
  - Badge de severidad (warning/critical)
  - Hospital y departamento
  - Tasa de ocupación actual
  - Proyección a 24h
  - Tiempo estimado hasta saturación
  - Lista de acciones recomendadas
- Botones de acción rápida

**CapacityPredictionChart.tsx**

- Gráfico de líneas con:
  - Datos históricos última semana
  - Ocupación actual
  - Proyección 24h, 48h, 7 días
  - Bandas de confianza
  - Línea de umbral crítico (85%)
- Selector de hospital y departamento

**PlantOpeningRecommendations.tsx**

- Cards con recomendaciones de apertura de planta
- Cada card con:
  - Hospital y departamento
  - Planta sugerida
  - Justificación detallada
  - Ocupación actual y proyectada
  - Recursos necesarios (personal, equipamiento)
  - Tiempo de activación estimado
  - Impacto de no actuar
- Botón "Activar Protocolo" (genera documento)

**CapacityHeatmap.tsx**

- Mapa de calor interactivo
- Ejes: Hospitales (Y) × Departamentos (X)
- Color según ocupación: verde → amarillo → rojo
- Tooltip con detalles al hover
- Click abre detalle del departamento

### Umbrales Configurables

```typescript
const CAPACITY_THRESHOLDS = {
  normal: 85, // < 85% = verde
  alert: 90, // 85-90% = amarillo
  critical: 95, // > 90% = rojo
};
```

### Verificación de Fase 6

```bash
npm run lint
npm run type-check
npm run build

# Verificar visualmente en componente de prueba
```

### Criterios de Aceptación

- [ ] BedCapacityMonitor.tsx creado y funcional
- [ ] CapacityAlertsPanel.tsx creado con alertas ordenadas
- [ ] CapacityPredictionChart.tsx creado con proyecciones
- [ ] PlantOpeningRecommendations.tsx creado con recomendaciones
- [ ] CapacityHeatmap.tsx creado y funcional
- [ ] Sistema de colores semáforo funcionando
- [ ] Dark mode funciona en todos los componentes
- [ ] `npm run build` pasa sin errores

### Commit de Fase 6

```bash
git add .
git commit -m "feat(capacity): Fase 6 - Componentes de gestión de capacidad hospitalaria

- Creado BedCapacityMonitor.tsx con monitorización en tiempo real
- Creado CapacityAlertsPanel.tsx con alertas priorizadas
- Creado CapacityPredictionChart.tsx con proyecciones de ocupación
- Creado PlantOpeningRecommendations.tsx con recomendaciones de apertura
- Creado CapacityHeatmap.tsx con mapa de calor interactivo
- Implementado sistema de alertas semáforo (verde/amarillo/rojo)
- Todos los componentes compatibles con dark mode

Archivos nuevos:
- src/components/capacity/BedCapacityMonitor.tsx
- src/components/capacity/CapacityAlertsPanel.tsx
- src/components/capacity/CapacityPredictionChart.tsx
- src/components/capacity/PlantOpeningRecommendations.tsx
- src/components/capacity/CapacityHeatmap.tsx

```

---

## 📍 FASE 7: PÁGINA CAPACITY MANAGEMENT

**Duración estimada:** 1 día
**Riesgo:** 🟢 Bajo
**Dependencias:** Fase 6 completada
**Archivos a crear:** 1
**Archivos a modificar:** 0

### Objetivos

1. Crear página principal de gestión de capacidad
2. Implementar navegación por tabs
3. Mostrar resumen general con métricas globales
4. NO integrar en App.tsx todavía (eso es Fase 9)

### Tareas Detalladas

#### 7.1 Crear `src/pages/CapacityManagementPage.tsx`

**Layout:**

- Header con métricas globales:
  - Total camas sistema
  - Camas ocupadas/disponibles
  - Tasa ocupación promedio
  - Número de alertas activas
- Tabs:
  - "Vista General" → BedCapacityMonitor + resumen
  - "Alertas" → CapacityAlertsPanel
  - "Predicción" → CapacityPredictionChart
  - "Recomendaciones" → PlantOpeningRecommendations
  - "Mapa de Calor" → CapacityHeatmap
- Botón "Actualizar Datos" (refresh manual)
- Indicador "Última actualización: hace X minutos"

### Criterios de Aceptación

- [ ] CapacityManagementPage.tsx creado con todas las tabs
- [ ] Métricas globales calculándose correctamente
- [ ] Navegación por tabs funcional
- [ ] Botón de actualización funcional
- [ ] `npm run build` pasa sin errores

### Commit de Fase 7

```bash
git add .
git commit -m "feat(capacity): Fase 7 - Página Capacity Management

- Creado CapacityManagementPage.tsx con navegación por tabs
- Implementadas métricas globales de capacidad
- Añadido indicador de última actualización
- Página lista para integración en rutas (Fase 9)

Archivos nuevos:
- src/pages/CapacityManagementPage.tsx

```

---

## 📍 FASE 8: SISTEMA DE ALERTAS Y PREDICCIONES

**Duración estimada:** 2 días
**Riesgo:** 🟡 Medio
**Dependencias:** Fases 6 y 7 completadas
**Archivos a crear:** 2
**Archivos a modificar:** 0

### Objetivos

1. Crear servicio de predicción de capacidad
2. Crear servicio de alertas de capacidad
3. Implementar lógica de detección de saturación inminente
4. Implementar generación automática de recomendaciones

### Tareas Detalladas

#### 8.1 Crear `src/services/capacityPredictionService.ts`

**Funciones:**

```typescript
// Predicción de ocupación
predictOccupancy(
  historicalData: BedCapacity[],
  hoursAhead: number
): CapacityPrediction

// Calcular nivel de riesgo
calculateRiskLevel(
  currentOccupancy: number,
  projectedOccupancy: number
): 'low' | 'medium' | 'high' | 'critical'

// Generar recomendación de capacidad
generateCapacityRecommendation(
  riskLevel: string,
  projectedOccupancy: number,
  department: string
): string

// Estimar tiempo hasta saturación
estimateTimeToSaturation(
  currentOccupancy: number,
  avgDailyAdmissions: number,
  avgDailyDischarges: number
): number // horas

// Determinar si necesita apertura de planta
shouldOpenPlant(
  currentOccupancy: number,
  projectedOccupancy: number,
  scheduledSurgeries: number
): boolean
```

#### 8.2 Crear `src/services/capacityAlertService.ts`

**Funciones:**

```typescript
// Verificar umbrales y generar alertas
checkCapacityAlerts(
  capacityData: BedCapacity[]
): CapacityAlert[]

// Priorizar alertas
prioritizeAlerts(
  alerts: CapacityAlert[]
): CapacityAlert[]

// Formatear mensaje de alerta
formatAlertMessage(
  alert: CapacityAlert
): string

// Generar acciones recomendadas
generateRecommendedActions(
  alert: CapacityAlert
): string[]
```

### Lógica de Alertas

```typescript
// Alerta Amarilla (85-90% ocupación):
// - Revisar lista de altas programadas
// - Preparar protocolo de derivación
// - Notificar a dirección médica

// Alerta Roja (>90% ocupación):
// - Activar protocolo de apertura de planta
// - Derivar nuevos ingresos a otros hospitales
// - Acelerar altas médicas posibles
// - Contactar con dirección de guardia
```

### Criterios de Aceptación

- [ ] capacityPredictionService.ts creado y funcional
- [ ] capacityAlertService.ts creado y funcional
- [ ] Predicciones calculándose correctamente
- [ ] Alertas generándose según umbrales
- [ ] Recomendaciones siendo específicas y accionables
- [ ] `npm run build` pasa sin errores

### Commit de Fase 8

```bash
git add .
git commit -m "feat(capacity): Fase 8 - Sistema de alertas y predicciones de capacidad

- Creado capacityPredictionService.ts con predicción de ocupación
- Creado capacityAlertService.ts con generación de alertas
- Implementada lógica de detección de saturación inminente
- Implementado cálculo de tiempo hasta saturación
- Implementada generación de recomendaciones automáticas

Archivos nuevos:
- src/services/capacityPredictionService.ts
- src/services/capacityAlertService.ts

```

---

## 📍 FASE 9: INTEGRACIÓN CON NAVEGACIÓN Y RUTAS

**Duración estimada:** 0.5 días
**Riesgo:** 🟢 Bajo (cambios mínimos en código existente)
**Dependencias:** Fases 5, 7 y 8 completadas
**Archivos a crear:** 0
**Archivos a modificar:** 2

### Objetivos

1. Añadir rutas nuevas a App.tsx
2. Actualizar navegación en sidebar/menú
3. Proteger rutas por rol (admin y gestor tienen acceso)
4. **PUNTO CRÍTICO**: Primera modificación de código existente

### Tareas Detalladas

#### 9.1 Modificar `src/App.tsx`

**Añadir rutas:**

```typescript
// Nuevas rutas (protegidas)
<Route path="/financial" element={<ProtectedRoute><FinancialDashboardPage /></ProtectedRoute>} />
<Route path="/capacity" element={<ProtectedRoute><CapacityManagementPage /></ProtectedRoute>} />
<Route path="/analysis" element={<ProtectedRoute><AnalysisReportsPage /></ProtectedRoute>} />
```

#### 9.2 Actualizar navegación

**Añadir en menú/sidebar:**

- 💰 Gestión Financiera → /financial (admin, gestor)
- 🏥 Capacidad Hospitalaria → /capacity (admin, gestor)
- 📊 Análisis y Reportes → /analysis (admin, gestor)

#### 9.3 Permisos por rol

**Acceso permitido:**

- **admin**: Acceso completo a todas las páginas
- **gestor**: Acceso completo a todas las páginas
- **analista**: Solo lectura (sin acciones)
- **invitado**: Sin acceso (redirigir a dashboard)

### Verificación de Fase 9

```bash
npm run lint
npm run type-check
npm run build
npm test

# Verificar navegación manualmente:
# - Login como admin → acceso a todas las rutas
# - Login como gestor → acceso a todas las rutas
# - Login como invitado → no acceso (redirige)
```

### Criterios de Aceptación

- [ ] Rutas añadidas a App.tsx
- [ ] Navegación actualizada con nuevos items
- [ ] Protección de rutas por rol funcional
- [ ] No hay regresiones en funcionalidad existente
- [ ] `npm run build` pasa sin errores
- [ ] `npm test` pasa sin errores

### Commit de Fase 9

```bash
git add .
git commit -m "feat(navigation): Fase 9 - Integración de nuevas páginas en navegación

- Añadidas rutas /financial, /capacity, /analysis en App.tsx
- Actualizada navegación con nuevos items de menú
- Implementada protección de rutas por rol
- Acceso para admin y gestor, restringido para otros roles

Archivos modificados:
- src/App.tsx
- src/components/layout/Sidebar.tsx (o equivalente)

```

---

## 📍 FASE 10: INTEGRACIÓN CON CHAT AI

**Duración estimada:** 1-2 días
**Riesgo:** 🟡 Medio
**Dependencias:** Fase 9 completada
**Archivos a crear:** 0
**Archivos a modificar:** 1-2

### Objetivos

1. Ampliar contexto del chat con datos financieros
2. Añadir consultas de capacidad hospitalaria
3. Implementar respuestas con datos en tiempo real
4. Añadir botones rápidos para consultas financieras

### Tareas Detalladas

#### 10.1 Modificar `src/services/chatService.ts`

**Añadir contexto financiero:**

```typescript
// Ampliar el contexto del LLM con:
// - KPIs financieros actuales
// - Estado de capacidad hospitalaria
// - Alertas activas
// - Directrices pendientes
```

**Consultas soportadas:**

- "¿Qué departamento tiene mejor ROI?"
- "Dame recomendaciones para reducir costes en Urgencias"
- "Predice el margen neto del próximo trimestre"
- "¿Cuántas camas disponibles hay en UCI?"
- "¿Necesitamos abrir alguna planta?"
- "¿A qué hospital puedo derivar un paciente de cirugía?"

#### 10.2 Actualizar ChatInterface

**Añadir botones rápidos:**

- "📊 KPIs Financieros"
- "🏥 Estado Capacidad"
- "⚠️ Alertas Activas"
- "💡 Recomendaciones"

### Criterios de Aceptación

- [ ] Chat responde consultas financieras correctamente
- [ ] Chat responde consultas de capacidad correctamente
- [ ] Datos en tiempo real incluidos en respuestas
- [ ] Botones rápidos funcionando
- [ ] `npm run build` pasa sin errores

### Commit de Fase 10

```bash
git add .
git commit -m "feat(chat): Fase 10 - Integración de datos financieros y capacidad con Chat AI

- Ampliado contexto del chat con datos financieros
- Añadido soporte para consultas de capacidad hospitalaria
- Implementadas respuestas con datos en tiempo real
- Añadidos botones rápidos para consultas financieras

Archivos modificados:
- src/services/chatService.ts
- src/components/chat/ChatInterface.tsx

```

---

## 📍 FASE 11: TESTING Y AJUSTES FINALES

**Duración estimada:** 1-2 días
**Riesgo:** 🟢 Bajo
**Dependencias:** Todas las fases anteriores completadas
**Archivos a crear:** 3-5
**Archivos a modificar:** 0

### Objetivos

1. Crear tests unitarios para servicios críticos
2. Verificar todas las funcionalidades
3. Corregir bugs encontrados
4. Documentar el módulo

### Tareas Detalladas

#### 11.1 Tests Unitarios

**Crear tests para:**

- `financialAnalysisService.test.ts`
- `predictionService.test.ts`
- `capacityAlertService.test.ts`

#### 11.2 Verificación Manual

**Checklist:**

- [ ] Dashboard financiero carga correctamente
- [ ] Gráficos renderizan con datos
- [ ] Filtros funcionan correctamente
- [ ] Capacidad muestra datos en tiempo real
- [ ] Alertas se generan según umbrales
- [ ] Predicciones son razonables
- [ ] Directrices son específicas y accionables
- [ ] Chat responde consultas financieras
- [ ] Dark mode funciona en todas las páginas
- [ ] Responsive en mobile/tablet/desktop
- [ ] No hay errores en consola

#### 11.3 Documentación

**Actualizar README.md:**

- Sección "Gestión Financiera"
- Listado de nuevos KPIs
- Capturas de pantalla

### Criterios de Aceptación

- [ ] Tests unitarios creados y pasando
- [ ] Todas las funcionalidades verificadas
- [ ] Bugs corregidos
- [ ] Documentación actualizada
- [ ] `npm run build` pasa sin errores
- [ ] `npm test` pasa sin errores

### Commit de Fase 11

```bash
git add .
git commit -m "feat(financial): Fase 11 - Testing y documentación final

- Creados tests unitarios para servicios financieros y capacidad
- Todos los tests pasan correctamente
- Actualizado README.md con documentación del módulo financiero
- Verificadas todas las funcionalidades
- Módulo de Gestión Financiera completado

Archivos nuevos:
- tests/services/financialAnalysisService.test.ts
- tests/services/predictionService.test.ts
- tests/services/capacityAlertService.test.ts

Archivos modificados:
- README.md

```

---

## 📋 CHECKLIST GLOBAL DE PROGRESO

### Datos y Tipos

- [ ] presupuesto_departamentos_malaga.csv
- [ ] kpis_financieros_2025.csv
- [ ] tendencias_historicas_2020_2025.csv
- [ ] analisis_eficiencia_departamental.csv
- [ ] gestion_camas_hospitalarias.csv ⚠️
- [ ] src/types/financial.ts
- [ ] src/types/capacity.ts
- [ ] src/types/analysis.ts

### Stores

- [ ] src/store/financialStore.ts
- [ ] src/store/capacityStore.ts
- [ ] src/store/analysisStore.ts

### Servicios

- [ ] src/services/financialDataService.ts
- [ ] src/services/financialAnalysisService.ts
- [ ] src/services/predictionService.ts
- [ ] src/services/directivesGeneratorService.ts
- [ ] src/services/capacityPredictionService.ts
- [ ] src/services/capacityAlertService.ts

### Componentes Financieros

- [ ] FinancialKPICard.tsx
- [ ] FinancialExecutiveDashboard.tsx
- [ ] DepartmentFinancialAnalysis.tsx
- [ ] HistoricalTrendsChart.tsx
- [ ] BenchmarkingChart.tsx
- [ ] DirectivesPanel.tsx

### Componentes de Análisis

- [ ] TrendAnalysisWidget.tsx
- [ ] AnomalyDetectionPanel.tsx
- [ ] ComparisonInsights.tsx

### Componentes de Capacidad ⚠️

- [ ] BedCapacityMonitor.tsx
- [ ] CapacityAlertsPanel.tsx
- [ ] CapacityPredictionChart.tsx
- [ ] PlantOpeningRecommendations.tsx
- [ ] CapacityHeatmap.tsx

### Páginas

- [ ] FinancialDashboardPage.tsx
- [ ] AnalysisReportsPage.tsx
- [ ] CapacityManagementPage.tsx

### Integración

- [ ] Rutas añadidas a App.tsx
- [ ] Navegación actualizada
- [ ] Chat AI integrado

### Testing

- [ ] financialAnalysisService.test.ts
- [ ] predictionService.test.ts
- [ ] capacityAlertService.test.ts

### Documentación

- [ ] README.md actualizado

---

## 🎯 RESULTADO ESPERADO FINAL

Al completar todas las fases tendrás:

1. **Dashboard Financiero Ejecutivo** con 20 KPIs financieros
2. **Sistema de Gestión de Capacidad** con alertas en tiempo real
3. **Análisis Automático** con generación de directrices
4. **Predicciones** a corto y medio plazo
5. **Chat AI** integrado con datos financieros y capacidad

**Colores del proyecto:** #1FB6C3 (turquesa), #1E3A5F (azul oscuro)

---

**Documento creado:** 15 de enero de 2026
**Última actualización:** 15 de enero de 2026
**Versión:** 1.0
