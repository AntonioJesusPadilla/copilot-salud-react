# 🗺️ ROADMAP DE MIGRACIÓN: COPILOT SALUD ANDALUCÍA
## De Streamlit/Python a React/TypeScript

**Fecha de inicio**: 04/01/2026
**Estado actual**: ✅ Subsistema 1 completado

---

## 📋 ÍNDICE DE SUBSISTEMAS

### ✅ FASE 1: INFRAESTRUCTURA (COMPLETADA)
- [x] **Subsistema 1**: Infraestructura Base
  - Configuración Vite + React 19 + TypeScript 5
  - Tailwind CSS v3 con colores corporativos
  - ESLint + Prettier configurados
  - Tipos TypeScript base definidos
  - **Commit**: `feat: Subsistema 1 - Infraestructura base configurada`

### 🔄 FASE 2: AUTENTICACIÓN Y NAVEGACIÓN (PENDIENTE)
- [ ] **Subsistema 2**: Sistema de Autenticación
  - Zustand store para autenticación
  - Componente LoginPage
  - Componente ProtectedRoute
  - Servicio de autenticación (bcryptjs + JWT)
  - Persistencia de sesión
  - **Commit**: `feat: Subsistema 2 - Sistema de autenticación`

- [ ] **Subsistema 3**: Routing y Navegación
  - Configuración de React Router v6
  - Layout principal con Sidebar
  - Navegación por roles
  - Rutas protegidas
  - **Commit**: `feat: Subsistema 3 - Routing y navegación`

### 🔄 FASE 3: SERVICIOS DE DATOS (PENDIENTE)
- [ ] **Subsistema 4**: Carga y Procesamiento de Datos CSV
  - Servicio de lectura de CSVs (papaparse)
  - Parsers de datos (hospitales, demografía, indicadores)
  - Zustand store para datos de salud
  - Tipos TypeScript para datos del dominio
  - **Commit**: `feat: Subsistema 4 - Servicios de datos CSV`

- [ ] **Subsistema 5**: Generadores de KPIs
  - Lógica de cálculo de 26 KPIs
  - Funciones de análisis de tendencias
  - Comparativas entre provincias
  - Utilidades de agregación de datos
  - **Commit**: `feat: Subsistema 5 - Generadores de KPIs`

### 🔄 FASE 4: COMPONENTES VISUALES (PENDIENTE)
- [ ] **Subsistema 6**: Biblioteca de Componentes Comunes
  - Card component
  - KPI Card component
  - LoadingSpinner
  - ErrorBoundary
  - Modal/Dialog
  - Filters/Selectors
  - **Commit**: `feat: Subsistema 6 - Componentes comunes`

- [ ] **Subsistema 7**: Componentes de KPIs (Parte 1)
  - 13 primeros componentes de KPIs
  - Integración con Recharts
  - Componentes reutilizables de gráficos
  - **Commit**: `feat: Subsistema 7 - KPIs parte 1 (1-13)`

- [ ] **Subsistema 8**: Componentes de KPIs (Parte 2)
  - 13 últimos componentes de KPIs
  - Gráficos avanzados (heatmaps, scatter plots)
  - Componentes de comparativa
  - **Commit**: `feat: Subsistema 8 - KPIs parte 2 (14-26)`

### 🔄 FASE 5: MAPAS INTERACTIVOS (PENDIENTE)
- [ ] **Subsistema 9**: Sistema de Mapas
  - Configuración de React-Leaflet
  - Componente MapView base
  - Marcadores interactivos de centros de salud
  - Popups con información detallada
  - Filtros por tipo de centro
  - Heatmap de densidad de servicios
  - **Commit**: `feat: Subsistema 9 - Mapas interactivos`

### 🔄 FASE 6: DASHBOARDS POR ROL (PENDIENTE)
- [ ] **Subsistema 10**: Dashboard Médico
  - Vista personalizada para médicos
  - KPIs relevantes (listas de espera, derivaciones)
  - Gráficos específicos
  - **Commit**: `feat: Subsistema 10 - Dashboard médico`

- [ ] **Subsistema 11**: Dashboard Enfermero
  - Vista personalizada para enfermeros
  - KPIs de atención primaria
  - Seguimiento de pacientes
  - **Commit**: `feat: Subsistema 11 - Dashboard enfermero`

- [ ] **Subsistema 12**: Dashboard Administrador
  - Vista ejecutiva con todos los KPIs
  - Panel de gestión de usuarios
  - Estadísticas del sistema
  - Exportación de reportes
  - **Commit**: `feat: Subsistema 12 - Dashboard administrador`

- [ ] **Subsistema 13**: Dashboard Paciente
  - Vista simplificada para pacientes
  - Información de centros cercanos
  - Accesibilidad y tiempos de espera
  - **Commit**: `feat: Subsistema 13 - Dashboard paciente`

### 🔄 FASE 7: CHAT AI (PENDIENTE)
- [ ] **Subsistema 14**: Sistema de Chat con Claude AI
  - Integración de @anthropic-ai/sdk
  - Componente ChatInterface
  - Gestión de conversaciones
  - Streaming de respuestas
  - Contexto de datos de salud
  - Markdown rendering (react-markdown)
  - **Commit**: `feat: Subsistema 14 - Chat AI con Claude`

### 🔄 FASE 8: FUNCIONALIDADES AVANZADAS (PENDIENTE)
- [ ] **Subsistema 15**: Sistema de Exportación
  - Exportar a PDF (jspdf + html2canvas)
  - Exportar a CSV
  - Exportar gráficos como imágenes
  - **Commit**: `feat: Subsistema 15 - Sistema de exportación`

- [ ] **Subsistema 16**: Filtros y Búsqueda Avanzada
  - Filtros por provincia
  - Búsqueda de centros de salud
  - Filtros temporales (date-fns)
  - Persistencia de filtros
  - **Commit**: `feat: Subsistema 16 - Filtros y búsqueda`

- [ ] **Subsistema 17**: Responsive Design y Accesibilidad
  - Mobile-first CSS
  - Detección de dispositivos
  - ARIA labels
  - Keyboard navigation
  - Dark mode (opcional)
  - **Commit**: `feat: Subsistema 17 - Responsive y accesibilidad`

### 🔄 FASE 9: SEGURIDAD Y PERFORMANCE (PENDIENTE)
- [ ] **Subsistema 18**: Seguridad
  - Encriptación de datos sensibles (crypto-js)
  - Rate limiting en cliente
  - Validación de inputs
  - Sanitización de datos
  - **Commit**: `feat: Subsistema 18 - Seguridad`

- [ ] **Subsistema 19**: Optimización de Performance
  - Lazy loading de componentes (React.lazy)
  - Memoization (React.memo, useMemo)
  - Code splitting
  - Optimización de imágenes
  - Service Worker (opcional)
  - **Commit**: `perf: Subsistema 19 - Optimizaciones`

### 🔄 FASE 10: TESTING (PENDIENTE)
- [ ] **Subsistema 20**: Testing Unitario
  - Configuración de Vitest
  - Tests de componentes (React Testing Library)
  - Tests de servicios
  - Coverage mínimo 70%
  - **Commit**: `test: Subsistema 20 - Tests unitarios`

- [ ] **Subsistema 21**: Testing de Integración
  - Tests E2E (Playwright/Cypress)
  - Tests de flujos de usuario
  - Tests de autenticación
  - **Commit**: `test: Subsistema 21 - Tests integración`

### 🔄 FASE 11: DOCUMENTACIÓN (PENDIENTE)
- [ ] **Subsistema 22**: Documentación Técnica
  - README.md completo
  - Guía de instalación
  - Guía de desarrollo
  - Arquitectura del proyecto
  - **Commit**: `docs: Subsistema 22 - Documentación técnica`

- [ ] **Subsistema 23**: Guía de Usuario
  - Manual de usuario
  - Capturas de pantalla
  - Tutoriales en video (opcional)
  - **Commit**: `docs: Subsistema 23 - Guía de usuario`

### 🔄 FASE 12: DEPLOYMENT (PENDIENTE)
- [ ] **Subsistema 24**: Configuración de Producción
  - Variables de entorno de producción
  - Build optimizado
  - Configuración de CI/CD (GitHub Actions)
  - **Commit**: `build: Subsistema 24 - Config producción`

- [ ] **Subsistema 25**: Deploy a Producción
  - Deploy en Vercel/Netlify
  - Configuración de dominio
  - Monitoreo (Sentry opcional)
  - **Commit**: `deploy: Subsistema 25 - Deploy inicial`

- [ ] **Subsistema 26**: Post-Deploy y Ajustes Finales
  - Testing en producción
  - Ajustes de performance
  - Corrección de bugs críticos
  - **Commit**: `fix: Subsistema 26 - Ajustes post-deploy`

---

## 📊 PROGRESO GENERAL

```
Total de Subsistemas: 26
Completados: 1 (3.8%)
En progreso: 0 (0%)
Pendientes: 25 (96.2%)
```

**Tiempo estimado por subsistema**: Variable (1-3 días por subsistema)
**Duración total estimada**: 2-3 meses

---

## 🎯 HITOS CLAVE

| Hito | Subsistemas | Estado |
|------|-------------|--------|
| **MVP Funcional** | 1-9 | ⏳ En progreso |
| **Dashboards Completos** | 10-13 | ⏳ Pendiente |
| **Funcionalidad Completa** | 14-17 | ⏳ Pendiente |
| **Producción Ready** | 18-21 | ⏳ Pendiente |
| **Lanzamiento** | 22-26 | ⏳ Pendiente |

---

## 📝 NOTAS IMPORTANTES

### Prioridades de Desarrollo
1. ✅ **Infraestructura sólida** - TypeScript estricto, sin `any`
2. ⏳ **Funcionalidad core** - Autenticación, datos, KPIs
3. ⏳ **UX pulida** - Responsive, accesibilidad
4. ⏳ **Performance** - Lazy loading, code splitting
5. ⏳ **Testing** - Coverage > 70%
6. ⏳ **Documentación** - README completo, guías

### Riesgos Identificados
- 🔴 **Complejidad de KPIs**: 26 componentes de KPIs requieren lógica compleja
- 🟡 **Integración de mapas**: React-Leaflet puede tener problemas con SSR
- 🟡 **Chat AI**: Dependencia de API externa (Anthropic)
- 🟢 **Responsive design**: Tailwind facilita el desarrollo mobile-first

### Decisiones Técnicas
- ✅ React 19 (última versión estable)
- ✅ TypeScript modo estricto (sin `any`)
- ✅ Tailwind CSS v3 (v4 aún muy nuevo)
- ✅ Zustand para estado global (más simple que Redux)
- ✅ React Router v6 (estándar de la industria)
- ✅ Recharts para gráficos (más ligero que Plotly)

---

## 🔄 PRÓXIMO PASO

**Subsistema 2: Sistema de Autenticación**
- Crear Zustand store de autenticación
- Implementar LoginPage
- Configurar ProtectedRoute
- Servicio de auth con bcryptjs

---

**Última actualización**: 04/01/2026
**Autor**: Claude Code + Usuario
**Versión del roadmap**: 1.0
