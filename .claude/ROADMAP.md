# 🗺️ ROADMAP DE MIGRACIÓN: COPILOT SALUD ANDALUCÍA
## De Streamlit/Python a React/TypeScript

**Fecha de inicio**: 04/01/2026
**Última actualización**: 09/01/2026
**Estado actual**: ✅ 8 Subsistemas completados (36.4% del proyecto)

---

## 📋 ÍNDICE DE SUBSISTEMAS

### ✅ FASE 1: INFRAESTRUCTURA (COMPLETADA)
- [x] **Subsistema 1**: Infraestructura Base
  - Configuración Vite + React 19 + TypeScript 5
  - Tailwind CSS v3 con colores corporativos
  - ESLint + Prettier configurados
  - Tipos TypeScript base definidos
  - **Commit**: `feat: Subsistema 1 - Infraestructura base configurada`
  - **Estado**: ✅ Completado

### ✅ FASE 2: AUTENTICACIÓN Y NAVEGACIÓN (COMPLETADA)
- [x] **Subsistema 2**: Sistema de Autenticación
  - Zustand store para autenticación
  - Componente LoginPage con 4 roles (médico, enfermero, administrador, paciente)
  - Componente ProtectedRoute
  - Servicio de autenticación (bcryptjs para hashing)
  - Persistencia de sesión con localStorage
  - SettingsPage para cambio de contraseña
  - **Commit**: `feat: Subsistema 2 - Sistema de autenticación completo`
  - **Estado**: ✅ Completado

- [x] **Subsistema 3**: Dashboard y visualización de KPIs
  - React Router v6 configurado
  - DashboardPage con navegación por roles
  - Sistema de 26 KPIs de salud de Andalucía
  - Integración con Recharts para gráficos
  - Zustand store para KPIs
  - Filtros por categoría y nivel de acceso
  - Rutas protegidas por rol
  - **Commit**: `feat: Subsistema 3 - Dashboard y visualización de KPIs`
  - **Estado**: ✅ Completado (combina routing, navegación y KPIs)

### ✅ FASE 3: MAPAS Y DATOS GEOGRÁFICOS (COMPLETADA)
- [x] **Subsistema 4**: Mapas Interactivos
  - Integración de React-Leaflet
  - MapPage con 103 centros de salud georreferenciados
  - Marcadores interactivos con popups informativos
  - Filtros por tipo de centro (hospital, centro de salud, clínica)
  - Filtros por servicios (urgencias, pediatría, etc.)
  - Búsqueda de centros por nombre y ciudad
  - Mapa de calor (heatmap) de densidad de servicios
  - Zustand store para datos del mapa
  - Servicio de procesamiento de datos geográficos
  - **Commit**: `feat: Subsistema 4 - Mapas Interactivos`
  - **Estado**: ✅ Completado

### ✅ FASE 4: CHAT AI (COMPLETADA)
- [x] **Subsistema 5**: Chat AI con Groq
  - Integración de Groq SDK (reemplazo de Anthropic)
  - Sistema de LLM usando llama-3.3-70b-versatile
  - Fallback automático entre modelos (70b → 8b → mixtral)
  - Contexto enriquecido con datos reales del sistema:
    * 15 KPIs principales con valores exactos
    * 10 centros de salud con ubicaciones y servicios
    * Estadísticas completas del sistema sanitario
  - System prompt optimizado para usar datos reales
  - ChatInterface con UI moderna
  - Soporte para Markdown en respuestas (react-markdown)
  - ChatMessage, ChatHeader, ChatInput components
  - Zustand store para chat con persistencia
  - Servicio de contexto para inyectar datos del sistema
  - Logs de debug detallados
  - **Commit**: `feat: Subsistema 5 - Chat AI con Groq y contexto enriquecido`
  - **Estado**: ✅ Completado

### 🔄 FASE 5: COMPONENTES Y REFINAMIENTO (PRÓXIMA)
- [ ] **Subsistema 6**: Biblioteca de Componentes Comunes
  - Card component genérico reutilizable
  - LoadingSpinner mejorado
  - ErrorBoundary para manejo de errores
  - Modal/Dialog system
  - Filters/Selectors avanzados
  - Toast/Notification system
  - **Commit**: `feat: Subsistema 6 - Componentes comunes`
  - **Nota**: Algunos componentes ya implementados parcialmente (KPI Cards, filtros básicos)

### 🔄 FASE 6: DASHBOARDS PERSONALIZADOS POR ROL (PENDIENTE)
- [ ] **Subsistema 7**: Dashboard Médico
  - Vista personalizada para médicos
  - KPIs prioritarios: listas de espera, derivaciones, carga asistencial
  - Gráficos específicos de especialidad
  - Acceso rápido a centros con urgencias
  - **Commit**: `feat: Subsistema 7 - Dashboard médico`

- [ ] **Subsistema 8**: Dashboard Enfermero
  - Vista personalizada para enfermeros
  - KPIs de atención primaria y domiciliaria
  - Seguimiento de pacientes crónicos
  - Indicadores de vacunación
  - **Commit**: `feat: Subsistema 8 - Dashboard enfermero`

- [ ] **Subsistema 9**: Dashboard Administrador
  - Vista ejecutiva con todos los 26 KPIs
  - Panel de gestión de usuarios (CRUD)
  - Estadísticas del sistema en tiempo real
  - Comparativas entre provincias
  - Sistema de alertas
  - **Commit**: `feat: Subsistema 9 - Dashboard administrador`

- [ ] **Subsistema 10**: Dashboard Paciente/Invitado
  - Vista simplificada para pacientes
  - Información de centros cercanos
  - Tiempos de espera estimados
  - Accesibilidad y servicios disponibles
  - FAQ y recursos informativos
  - **Commit**: `feat: Subsistema 10 - Dashboard paciente`

### ✅ FASE 7: FUNCIONALIDADES AVANZADAS (EN PROGRESO)
- [x] **Subsistema 11**: Sistema de Exportación
  - Servicio de exportación completo (exportService.ts)
  - Exportación de dashboard completo a PDF (jspdf + html2canvas)
  - Exportación de KPIs a CSV/Excel (xlsx)
  - Exportación de centros de salud a CSV/Excel con múltiples hojas
  - Exportación de reportes completos con portada y metadatos
  - Componente ExportMenu reutilizable con menú desplegable
  - Integración en DashboardPage con 4 opciones de exportación
  - Integración en MapPage con 3 opciones de exportación
  - Validación de permisos por rol (canExport)
  - Indicadores de carga durante exportación
  - Generación de nombres de archivo con timestamp
  - **Commit**: `feat: Subsistema 11 - Sistema de exportación`
  - **Estado**: ✅ Completado

- [x] **Subsistema 12**: Búsqueda y Filtros Avanzados
  - Búsqueda global en KPIs y centros de salud con relevancia
  - Componente SearchBar con scope configurable (all, kpis, centers)
  - Filtros avanzados combinados (provincia, categoría, tendencia, rango valores)
  - DateRangePicker con presets (7d, 30d, 3m, 6m, 1año, custom)
  - SavedFilters con persistencia en localStorage y favoritos
  - KPIComparator con gráficas de comparación entre períodos
  - Servicio filterService con algoritmo de relevancia
  - Zustand store filterStore con middleware persist
  - Integración completa en DashboardPage y MapPage
  - **Commit**: `feat: Subsistema 12 - Búsqueda y Filtros Avanzados`
  - **Estado**: ✅ Completado

- [x] **Subsistema 13**: Responsive Design y Accesibilidad
  - Sistema de tema con dark mode (types/theme.ts)
  - Zustand store con persistencia para tema (store/themeStore.ts)
  - ThemeToggle component con iconos SVG (sun/moon)
  - Tailwind config actualizado con darkMode: 'class'
  - Breakpoints personalizados (xs: 375px, sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px)
  - Dark mode aplicado a todas las páginas:
    * DashboardPage: Header, stats cards, filters, KPI grid
    * ChatPage: Header, chat interface, info banner
    * MapPage: Header, stats, filters, legend, map container, selected center info
  - Diseño responsive mobile-first en todas las páginas
  - ARIA labels en componentes interactivos (buttons, toggles)
  - Transiciones suaves entre temas (transition-colors)
  - Persistencia de preferencia de tema en localStorage
  - Colores con contraste WCAG 2.1 en dark mode
  - **Commit**: `feat: Subsistemas 12 y 13 - Filtros avanzados + Responsive design`
  - **Estado**: ✅ Completado

### 🔄 FASE 8: SEGURIDAD Y PERFORMANCE (PENDIENTE)
- [ ] **Subsistema 14**: Seguridad
  - Encriptación de datos sensibles (crypto-js)
  - Rate limiting en cliente para API calls
  - Validación robusta de inputs
  - Sanitización de datos del chat AI
  - Protección contra XSS y CSRF
  - Auditoría de dependencias (npm audit)
  - **Commit**: `feat: Subsistema 14 - Seguridad`

- [ ] **Subsistema 15**: Optimización de Performance
  - Lazy loading de rutas y componentes (React.lazy + Suspense)
  - Memoization estratégica (React.memo, useMemo, useCallback)
  - Code splitting automático por rutas
  - Virtualización de listas largas (react-window)
  - Optimización de imágenes y assets
  - Service Worker para cache (opcional)
  - Análisis de bundle size (vite-bundle-visualizer)
  - **Commit**: `perf: Subsistema 15 - Optimizaciones`
  - **Prioridad**: ⭐⭐ Media (mejora percepción de velocidad)

### 🔄 FASE 9: TESTING (PENDIENTE)
- [ ] **Subsistema 16**: Testing Unitario
  - Configuración de Vitest
  - Tests de componentes UI (React Testing Library)
  - Tests de stores Zustand
  - Tests de servicios (chatService, authService, kpiService, mapService)
  - Tests de utilidades y helpers
  - Coverage objetivo: >70%
  - **Commit**: `test: Subsistema 16 - Tests unitarios`
  - **Prioridad**: ⭐ Baja (no crítico para MVP)

- [ ] **Subsistema 17**: Testing de Integración y E2E
  - Configuración de Playwright o Cypress
  - Tests E2E de flujos críticos:
    * Login → Dashboard → Logout
    * Filtrado de KPIs
    * Búsqueda en mapas
    * Conversación con Chat AI
  - Tests de autenticación y autorización
  - Tests de navegación entre roles
  - **Commit**: `test: Subsistema 17 - Tests E2E`
  - **Prioridad**: ⭐ Baja (recomendado para producción)

### 🔄 FASE 10: DOCUMENTACIÓN (PENDIENTE)
- [ ] **Subsistema 18**: Documentación Técnica
  - README.md completo con:
    * Descripción del proyecto
    * Stack tecnológico
    * Guía de instalación paso a paso
    * Scripts disponibles
    * Estructura del proyecto
  - CONTRIBUTING.md
  - Documentación de arquitectura (diagramas)
  - Comentarios JSDoc en funciones críticas
  - **Commit**: `docs: Subsistema 18 - Documentación técnica`

- [ ] **Subsistema 19**: Guía de Usuario
  - Manual de usuario por rol (PDF/Web)
  - Capturas de pantalla actualizadas
  - Videos tutoriales cortos (opcional):
    * Cómo usar el dashboard
    * Cómo filtrar KPIs
    * Cómo usar el chat AI
    * Cómo buscar centros en el mapa
  - FAQ integrado
  - **Commit**: `docs: Subsistema 19 - Guía de usuario`

### 🔄 FASE 11: DEPLOYMENT (PENDIENTE)
- [ ] **Subsistema 20**: Configuración de Producción
  - Variables de entorno de producción (.env.production)
  - Build optimizado (Vite production mode)
  - Configuración de CI/CD con GitHub Actions:
    * Lint y type-check en PRs
    * Tests automáticos
    * Deploy automático a staging
  - Pre-commit hooks (Husky + lint-staged)
  - **Commit**: `build: Subsistema 20 - Config producción`

- [ ] **Subsistema 21**: Deploy a Producción
  - Deploy en Vercel (recomendado para React)
  - Configuración de dominio personalizado
  - SSL/HTTPS automático
  - Configuración de headers de seguridad
  - Monitoreo básico con Vercel Analytics
  - Integración con Sentry para error tracking (opcional)
  - **Commit**: `deploy: Subsistema 21 - Deploy inicial`

- [ ] **Subsistema 22**: Post-Deploy y Monitoreo
  - Smoke testing en producción
  - Ajustes de performance basados en métricas reales
  - Configuración de alertas
  - Corrección de bugs críticos detectados
  - Plan de rollback documentado
  - **Commit**: `fix: Subsistema 22 - Ajustes post-deploy`

---

## 📊 PROGRESO GENERAL

```
Total de Subsistemas: 22 (reorganizado desde 26)
Completados: 8 (36.4%)
En progreso: 0 (0%)
Pendientes: 14 (63.6%)
```

**Progreso por fases**:
- ✅ Fase 1 - Infraestructura: 100% (1/1)
- ✅ Fase 2 - Autenticación: 100% (2/2)
- ✅ Fase 3 - Mapas: 100% (1/1)
- ✅ Fase 4 - Chat AI: 100% (1/1)
- 🔄 Fase 5 - Componentes: 0% (0/1)
- 🔄 Fase 6 - Dashboards por rol: 0% (0/4)
- ✅ Fase 7 - Funcionalidades avanzadas: 100% (3/3) ⭐ COMPLETADA
- 🔄 Fase 8 - Seguridad y performance: 0% (0/2)
- 🔄 Fase 9 - Testing: 0% (0/2)
- 🔄 Fase 10 - Documentación: 0% (0/2)
- 🔄 Fase 11 - Deployment: 0% (0/3)

**Tiempo invertido hasta ahora**: ~4-5 días
**Tiempo estimado restante**: 3-5 semanas
**Velocidad promedio**: 1.2 subsistemas/día

---

## 🎯 HITOS CLAVE

| Hito | Subsistemas | Estado | Progreso |
|------|-------------|--------|----------|
| **✅ MVP Core** | 1-5 | ✅ Completado | 100% |
| **🔄 MVP Mejorado** | 6-10 | 🔄 En espera | 0% |
| **✅ Features Avanzadas** | 11-13 | ✅ Completado | 100% (3/3) ⭐ |
| **🔄 Producción Ready** | 14-17 | 🔄 Pendiente | 0% |
| **🔄 Docs y Deploy** | 18-22 | 🔄 Pendiente | 0% |

---

## 📝 NOTAS IMPORTANTES

### Logros Destacados ✅
- **Infraestructura moderna**: React 19 + TypeScript 5 + Vite
- **Sistema de roles completo**: 4 roles con permisos diferenciados
- **26 KPIs funcionales**: Todos implementados con gráficos Recharts
- **103 centros georreferenciados**: Mapa interactivo completo
- **Chat AI inteligente**: Groq LLM con contexto enriquecido del sistema
- **Sistema de exportación completo**: PDF, CSV, Excel con reportes multipágina
- **Búsqueda y filtros avanzados**: Búsqueda global, filtros combinados, comparador de KPIs
- **Dark mode completo**: Sistema de temas con persistencia en todas las páginas ⭐ NUEVO
- **Responsive design**: Optimizado para todos los dispositivos (375px - 1536px+) ⭐ NUEVO
- **0 dependencias de `any`**: TypeScript estricto en todo el proyecto

### Prioridades Actuales
1. ✅ **Infraestructura sólida** - COMPLETADO
2. ✅ **Funcionalidad core** - COMPLETADO (Auth, KPIs, Mapas, Chat)
3. ✅ **Exportación de datos** - COMPLETADO
4. ✅ **Filtros avanzados** - COMPLETADO
5. ✅ **Responsive design + Dark mode** - COMPLETADO ⭐ NUEVO
6. 🔄 **Dashboards personalizados** - Próximo objetivo recomendado
7. ⏳ **Testing** - Recomendado antes de producción
8. ⏳ **Documentación** - Antes del lanzamiento

### Riesgos Mitigados
- ✅ **Chat AI**: Cambio de Anthropic a Groq exitoso
- ✅ **Integración de mapas**: React-Leaflet funcionando correctamente
- ✅ **26 KPIs**: Todos implementados y funcionando
- ✅ **Responsive design**: Optimizado para todos los dispositivos (375px+) ⭐ NUEVO
- ✅ **Dark mode**: Sistema completo con persistencia y transiciones ⭐ NUEVO
- 🟡 **Performance**: Pendiente de optimización (lazy loading, memoization)

### Decisiones Técnicas Implementadas
- ✅ React 19 con Server Components deshabilitados
- ✅ TypeScript 5 modo estricto (sin `any` en todo el proyecto)
- ✅ Tailwind CSS v3 con colores corporativos personalizados
- ✅ Zustand para estado global (auth, KPIs, maps, chat, filters)
- ✅ Zustand persist middleware para filtros guardados
- ✅ React Router v6 con rutas protegidas
- ✅ Recharts para visualizaciones (26 gráficos + comparador KPIs)
- ✅ React-Leaflet para mapas (103 centros)
- ✅ Groq SDK para Chat AI (llama-3.3-70b-versatile)
- ✅ react-markdown + remark-gfm para mensajes del chat
- ✅ date-fns para manejo de fechas
- ✅ bcryptjs para hashing de contraseñas
- ✅ jspdf + html2canvas para exportación a PDF
- ✅ xlsx para exportación a Excel/CSV
- ✅ Sistema de búsqueda con algoritmo de relevancia personalizado
- ✅ Filtros avanzados con persistencia en localStorage
- ✅ Sistema de temas con dark mode y persistencia (Zustand + localStorage) ⭐ NUEVO
- ✅ Tailwind dark mode con estrategia 'class' ⭐ NUEVO
- ✅ Breakpoints personalizados para responsive design (xs-2xl) ⭐ NUEVO

### Cambios Respecto al Plan Original
- **Aceleración**: Completamos subsistemas 1-5 en 3-4 días (originalmente 5-10 días)
- **Reorganización**: Combinamos "Routing" y "KPIs" en el Subsistema 3
- **Cambio de provider**: Groq en lugar de Anthropic Claude (Subsistema 5)
- **Priorización**: Implementamos exportación (Subsistema 11) antes de dashboards personalizados
- **Anticipación**: Implementamos Chat AI y Exportación antes de lo planeado
- **Reducción**: De 26 a 22 subsistemas (consolidación de duplicados)

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### ✅ **COMPLETADO: Subsistemas 12 y 13 - Filtros Avanzados + Responsive Design** (FASE 7 COMPLETA)
**Estado**: ✅ Completado el 09/01/2026
**Impacto**: ⭐⭐⭐⭐⭐ Muy Alto

**Subsistema 12 - Lo que se implementó**:
- ✅ Componente SearchBar con búsqueda global y relevancia
- ✅ Servicio filterService con algoritmo de scoring
- ✅ Filtros avanzados combinados (AdvancedFilters.tsx)
- ✅ DateRangePicker con 6 presets + custom
- ✅ SavedFilters con persistencia en localStorage
- ✅ KPIComparator con gráficas de Recharts
- ✅ Zustand store con middleware persist
- ✅ Integración en DashboardPage y MapPage
- ✅ Tipos TypeScript completos (filters.ts)

**Subsistema 13 - Lo que se implementó**:
- ✅ Sistema de temas con dark mode (types/theme.ts)
- ✅ Zustand store themeStore con persistencia en localStorage
- ✅ Componente ThemeToggle con iconos SVG (sol/luna)
- ✅ Dark mode aplicado en DashboardPage (header, stats, filters, KPIs)
- ✅ Dark mode aplicado en ChatPage (header, interface, info banner)
- ✅ Dark mode aplicado en MapPage (header, stats, filters, legend, selected center)
- ✅ Tailwind config con darkMode: 'class' y breakpoints personalizados
- ✅ Responsive design mobile-first en todas las páginas
- ✅ ARIA labels en componentes interactivos
- ✅ Transiciones suaves entre temas (transition-colors)
- ✅ Colores con contraste WCAG 2.1

**Resultado**: **FASE 7 COMPLETADA AL 100%**. Sistema completo de filtrado, búsqueda, dark mode y responsive design que proporciona una experiencia de usuario profesional en todos los dispositivos y condiciones de iluminación.

---

### 🥇 **OPCIÓN A: Subsistemas 7-10 - Dashboards Personalizados** (RECOMENDADO)
**Impacto**: ⭐⭐⭐⭐⭐ Muy Alto
**Dificultad**: ⭐⭐⭐⭐ Alta
**Tiempo estimado**: 3-4 días

**Por qué ahora**:
- Con FASE 7 completa (filtros, exportación, responsive, dark mode), tenemos una base sólida
- Mejora significativa de UX por rol: cada usuario ve solo lo relevante
- Reduce ruido visual y aumenta eficiencia
- Aprovecha toda la infraestructura ya construida
- Diferencia clave respecto a un dashboard genérico

**Tareas**:
1. Dashboard Médico (KPIs de listas de espera, derivaciones, carga asistencial)
2. Dashboard Enfermero (atención primaria, vacunación, pacientes crónicos)
3. Dashboard Admin (vista ejecutiva completa, gestión usuarios, alertas)
4. Dashboard Paciente (centros cercanos, tiempos de espera, servicios)

---

### 🥈 **OPCIÓN B: Subsistema 6 - Biblioteca de Componentes Comunes**
**Impacto**: ⭐⭐⭐ Medio
**Dificultad**: ⭐⭐ Baja
**Tiempo estimado**: 1-2 días

**Por qué segundo**:
- Refactorización y DRY (Don't Repeat Yourself)
- Mejora mantenibilidad del código
- Algunos componentes ya existen parcialmente
- Modal/Dialog system muy útil para confirmar acciones
- Toast notifications para feedback instantáneo

**Tareas**:
1. Card component genérico reutilizable
2. LoadingSpinner mejorado con variantes
3. ErrorBoundary para manejo de errores global
4. Modal/Dialog system con animaciones
5. Toast/Notification system

---

### 🥉 **OPCIÓN C: Subsistema 14 - Seguridad**
**Impacto**: ⭐⭐⭐⭐ Alto
**Dificultad**: ⭐⭐⭐ Media
**Tiempo estimado**: 2-3 días

**Por qué tercero**:
- Importante para preparar producción
- Validación robusta de inputs
- Protección contra XSS y CSRF
- Encriptación de datos sensibles
- Rate limiting para API calls

---

## 📋 DECISIÓN REQUERIDA

**¿Qué subsistema implementamos a continuación?**

Opciones:
- **A) Subsistemas 7-10 - Dashboards Personalizados por Rol** ← Recomendado (máximo impacto UX)
- **B) Subsistema 6 - Componentes comunes** (refactorización y DRY)
- **C) Subsistema 14 - Seguridad** (hardening para producción)
- **D) Subsistema 15 - Optimización de Performance** (lazy loading, memoization)
- **E) Otro (especificar)**

**Recomendación**: Con **FASE 7 completada al 100%** (8 subsistemas, 36.4% del proyecto), es momento ideal para implementar **Dashboards Personalizados por Rol** (FASE 6). Tenemos una base técnica sólida (filtros, exportación, responsive, dark mode) que permitirá crear experiencias excepcionales para cada tipo de usuario. Esta diferenciación por rol es el valor agregado clave del sistema.

---

**Última actualización**: 09/01/2026
**Autor**: Antonio Jesús Padilla + Claude Code
**Versión del roadmap**: 5.0 (Actualizado tras completar FASE 7: Subsistemas 12 y 13)
