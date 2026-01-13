# 🏥 Copilot Salud Andalucía

**Sistema de Análisis Sociosanitario de Málaga** - Plataforma web moderna para visualización, análisis y gestión de datos del sistema de salud andaluz.

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Coverage](https://img.shields.io/badge/Coverage-85.82%25-brightgreen.svg)](TESTING.md)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel-black.svg)](https://copilot-salud-react.vercel.app/)
[![Production](https://img.shields.io/badge/Production-Live-success.svg)](https://copilot-salud-react.vercel.app/)

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características Principales](#-características-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Scripts Disponibles](#-scripts-disponibles)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Roles de Usuario](#-roles-de-usuario)
- [Funcionalidades por Módulo](#-funcionalidades-por-módulo)
- [Testing](#-testing)
- [Desarrollo](#-desarrollo)
- [Deployment](#-deployment)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## 🚀 Demo en Vivo

**Aplicación en producción**: [https://copilot-salud-react.vercel.app/](https://copilot-salud-react.vercel.app/)

### Credenciales de Prueba

| Rol              | Usuario    | Contraseña    | Descripción                        |
| ---------------- | ---------- | ------------- | ---------------------------------- |
| 👨‍💼 Administrador | `admin`    | `admin123`    | Acceso completo + gestión usuarios |
| 📋 Gestor        | `gestor`   | `gestor123`   | Vista operativa + exportación      |
| 📈 Analista      | `analista` | `analista123` | Análisis avanzado + comparativas   |
| 👤 Invitado      | `invitado` | `invitado123` | Vista pública limitada             |

---

## 📖 Descripción

**Copilot Salud Andalucía** es una aplicación web desarrollada con React 19 y TypeScript que proporciona una plataforma integral para:

- 📊 **Visualización de KPIs** del sistema sanitario andaluz (26 indicadores)
- 🗺️ **Mapas interactivos** de centros de salud georreferenciados (103 centros)
- 🤖 **Chat AI inteligente** con contexto del sistema sanitario (Groq LLM)
- 📈 **Dashboards personalizados** según roles de usuario
- 📥 **Exportación de datos** a PDF, CSV y Excel
- 🔍 **Búsqueda y filtros avanzados** con persistencia
- 👥 **Gestión de usuarios** con CRUD completo
- 🌙 **Modo oscuro** en toda la aplicación

### Migración desde Streamlit/Python

Este proyecto es una **migración completa** de una aplicación Streamlit/Python a un stack moderno de React/TypeScript, mejorando significativamente:

- ⚡ Performance (lazy loading, code splitting)
- 🎨 UX/UI (responsive, dark mode, animaciones)
- 🔒 Seguridad (validación, sanitización, rate limiting)
- 🧪 Testing (85.82% coverage)

---

## ✨ Características Principales

### 🔐 Autenticación y Autorización

- Sistema de login con 4 roles diferenciados
- Rutas protegidas con React Router
- Persistencia de sesión en localStorage
- Hash de contraseñas con bcryptjs
- Cambio de contraseña desde configuración

### 📊 Dashboard Personalizado

- **4 dashboards específicos por rol**:
  - 👨‍💼 **Admin**: Vista ejecutiva completa + gestión de usuarios
  - 📋 **Gestor**: Vista operativa enfocada en gestión diaria
  - 📈 **Analista**: Vista analítica con comparativas avanzadas
  - 👤 **Invitado**: Vista simplificada de información pública
- 26 KPIs con gráficos Recharts
- Filtros avanzados con persistencia
- Sistema de búsqueda con relevancia

### 🗺️ Mapas Interactivos

- 103 centros de salud georreferenciados
- React-Leaflet con OpenStreetMap
- Filtros por tipo de centro y servicios
- Mapa de calor (heatmap) de densidad
- Búsqueda por nombre y ubicación

### 🤖 Chat AI

- LLM Groq (llama-3.3-70b-versatile)
- Contexto enriquecido con datos reales del sistema
- Respuestas con formato Markdown
- Fallback automático entre modelos
- Historial persistente de conversaciones

### 📥 Exportación de Datos

- Dashboard completo a PDF (jspdf + html2canvas)
- KPIs a CSV/Excel (xlsx)
- Centros de salud con múltiples hojas
- Reportes con portada y metadatos
- Validación por rol

### 👥 Gestión de Usuarios (Admin)

- CRUD completo de usuarios
- Búsqueda y filtros por rol/estado
- Activar/Desactivar usuarios
- Tabla con ordenamiento y paginación
- Validaciones y feedback con toasts

### 🌙 Tema y Personalización

- Modo claro/oscuro con persistencia
- ThemeToggle en todas las páginas
- Transiciones suaves
- Colores con contraste WCAG 2.1

### 🔒 Seguridad

- Validación de inputs (inputValidationService)
- Sanitización de contenido (sanitizationService)
- Rate limiting (rateLimitService)
- Protección XSS y inyección de código
- Auditoría de dependencias

### ⚡ Performance

- Lazy loading de rutas
- Code splitting por página
- Memoization con React.memo
- ErrorBoundary global
- Bundle size optimizado

### 🧪 Testing

- 150+ tests unitarios (Vitest)
- 17 tests E2E (Playwright)
- 85.82% de coverage
- CI/CD ready

---

## 🛠️ Stack Tecnológico

### Core

- **React 19** - UI Library
- **TypeScript 5** - Tipado estático (strict mode)
- **Vite 5** - Build tool y dev server
- **React Router v6** - Routing y navegación

### Estado y Data

- **Zustand** - State management global
- **zustand/middleware** - Persistencia en localStorage

### UI y Estilos

- **Tailwind CSS v3** - Utility-first CSS
- **Recharts** - Gráficos y visualizaciones
- **React-Leaflet** - Mapas interactivos
- **react-markdown** - Rendering de Markdown
- **date-fns** - Manejo de fechas

### AI y LLM

- **Groq SDK** - LLM API (llama-3.3-70b-versatile)

### Exportación

- **jspdf** - Generación de PDFs
- **html2canvas** - Captura de pantalla a PDF
- **xlsx** - Exportación Excel/CSV

### Seguridad

- **bcryptjs** - Hash de contraseñas

### Testing

- **Vitest** - Test runner (unit tests)
- **@testing-library/react** - Testing de componentes
- **Playwright** - E2E testing
- **@vitest/ui** - Interface de testing
- **@vitest/coverage-v8** - Code coverage

### Desarrollo

- **ESLint** - Linter
- **Prettier** - Code formatter
- **TypeScript ESLint** - Linting para TypeScript

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0 (recomendado: 20.x LTS)
- **npm** >= 9.0.0 o **yarn** >= 1.22.0
- **Git** >= 2.30.0

Verificar versiones:

```bash
node --version
npm --version
git --version
```

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/copilot-salud-react.git
cd copilot-salud-react
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Groq API (Chat AI)
VITE_GROQ_API_KEY=tu_api_key_aqui

# Opcional: Configuración de desarrollo
VITE_API_BASE_URL=http://localhost:3000
VITE_ENV=development
```

**⚠️ Importante**:

- El archivo `.env` está en `.gitignore` y NO debe subirse a Git
- Obtén tu API key de Groq en: https://console.groq.com/keys

### 4. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173**

---

## 📜 Scripts Disponibles

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Iniciar con host expuesto (acceso desde red local)
npm run dev -- --host
```

### Build y Preview

```bash
# Build de producción
npm run build

# Preview del build
npm run preview
```

### Linting y Formateo

```bash
# Ejecutar ESLint
npm run lint

# Ejecutar TypeScript type checking
npm run type-check

# Formatear código con Prettier (si está configurado)
npm run format
```

### Testing

```bash
# Tests unitarios (watch mode)
npm test

# Tests unitarios (single run)
npm run test:run

# Tests con UI interactiva
npm run test:ui

# Coverage report
npm run test:coverage

# Tests E2E con Playwright
npm run test:e2e

# Tests E2E con UI
npm run test:e2e:ui

# Tests E2E debug mode
npm run test:e2e:debug

# Ver reporte HTML de tests E2E
npm run test:e2e:report
```

### Análisis

```bash
# Analizar tamaño del bundle
npm run build
# Los chunks se mostrarán en la salida del build
```

---

## ⚙️ Configuración

### Credenciales de Prueba

La aplicación viene con usuarios de prueba para cada rol:

| Rol              | Usuario    | Contraseña    |
| ---------------- | ---------- | ------------- |
| 👨‍💼 Administrador | `admin`    | `admin123`    |
| 📋 Gestor        | `gestor`   | `gestor123`   |
| 📈 Analista      | `analista` | `analista123` |
| 👤 Invitado      | `invitado` | `invitado123` |

### Chat AI (Groq)

Para usar el Chat AI, necesitas una API key de Groq:

1. Regístrate en https://console.groq.com
2. Crea una API key
3. Agrégala al archivo `.env`:
   ```env
   VITE_GROQ_API_KEY=tu_api_key_aqui
   ```

**Modelos disponibles** (con fallback automático):

- `llama-3.3-70b-versatile` (principal)
- `llama-3.1-8b-instant` (fallback 1)
- `mixtral-8x7b-32768` (fallback 2)

### Personalización de Colores

Los colores corporativos se definen en `tailwind.config.js`:

```js
colors: {
  primary: '#FF6B6B',    // Rojo coral
  secondary: '#2C3E50',  // Azul oscuro
  accent: '#4ECDC4',     // Turquesa
}
```

---

## 📁 Estructura del Proyecto

```
copilot-salud-react/
├── .claude/                    # Configuración de Claude Code
│   └── ROADMAP.md             # Roadmap del proyecto
├── public/                     # Archivos estáticos
│   ├── favicon.svg            # Favicon personalizado
│   └── data/                  # Datos JSON
│       ├── kpis.json          # 26 KPIs de salud
│       ├── centers.json       # 103 centros de salud
│       └── users.json         # Usuarios del sistema
├── src/
│   ├── components/            # Componentes React
│   │   ├── common/           # Componentes comunes
│   │   │   ├── Card.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ...
│   │   ├── kpi/              # Componentes de KPIs
│   │   │   ├── KPICard.tsx
│   │   │   ├── KPIChart.tsx
│   │   │   └── KPIComparator.tsx
│   │   ├── filters/          # Componentes de filtros
│   │   │   ├── AdvancedFilters.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── SavedFilters.tsx
│   │   ├── map/              # Componentes del mapa
│   │   │   ├── MapView.tsx
│   │   │   └── MapFilters.tsx
│   │   ├── chat/             # Componentes del chat
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── ChatHeader.tsx
│   │   ├── users/            # Gestión de usuarios
│   │   │   ├── UserManagement.tsx
│   │   │   ├── UserTable.tsx
│   │   │   └── UserForm.tsx
│   │   └── dashboard/        # Componentes del dashboard
│   │       ├── DashboardHeader.tsx
│   │       ├── QuickActions.tsx
│   │       ├── StatsCard.tsx
│   │       └── roles/        # Dashboards por rol
│   │           ├── AdminDashboard.tsx
│   │           ├── GestorDashboard.tsx
│   │           ├── AnalistaDashboard.tsx
│   │           └── InvitadoDashboard.tsx
│   ├── pages/                # Páginas principales
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ChatPage.tsx
│   │   ├── MapPage.tsx
│   │   └── SettingsPage.tsx
│   ├── store/                # Zustand stores
│   │   ├── authStore.ts      # Autenticación
│   │   ├── kpiStore.ts       # KPIs
│   │   ├── mapStore.ts       # Mapas
│   │   ├── chatStore.ts      # Chat AI
│   │   ├── userStore.ts      # Usuarios
│   │   ├── filterStore.ts    # Filtros
│   │   ├── themeStore.ts     # Tema
│   │   └── toastStore.ts     # Notificaciones
│   ├── services/             # Servicios
│   │   ├── authService.ts
│   │   ├── chatService.ts
│   │   ├── exportService.ts
│   │   ├── filterService.ts
│   │   ├── inputValidationService.ts
│   │   ├── sanitizationService.ts
│   │   └── rateLimitService.ts
│   ├── types/                # Definiciones TypeScript
│   │   ├── index.ts
│   │   ├── kpi.ts
│   │   ├── map.ts
│   │   ├── chat.ts
│   │   ├── filters.ts
│   │   └── theme.ts
│   ├── test/                 # Configuración de tests
│   │   ├── setup.ts
│   │   └── mocks/
│   ├── App.tsx               # Componente raíz
│   ├── main.tsx              # Entry point
│   └── index.css             # Estilos globales
├── tests/                     # Tests E2E (Playwright)
│   ├── login.spec.ts
│   ├── dashboard.spec.ts
│   └── navigation.spec.ts
├── .env.example              # Ejemplo de variables de entorno
├── .gitignore
├── eslint.config.js          # Configuración ESLint
├── index.html                # HTML template
├── package.json
├── playwright.config.ts      # Configuración Playwright
├── tailwind.config.js        # Configuración Tailwind
├── tsconfig.json             # Configuración TypeScript
├── vite.config.ts            # Configuración Vite
├── vitest.config.ts          # Configuración Vitest
├── README.md                 # Este archivo
├── TESTING.md                # Documentación de testing
├── SECURITY.md               # Medidas de seguridad
├── PLAN_SETTINGS_EXPANSION.md    # Plan de expansión de Settings
└── PLAN_KPI_REORDERING.md        # Plan de reordenación de KPIs
```

---

## 👥 Roles de Usuario

### 👨‍💼 Administrador

- ✅ Acceso completo a todos los KPIs (26)
- ✅ Gestión de usuarios (CRUD)
- ✅ Vista ejecutiva del sistema
- ✅ Alertas de KPIs críticos
- ✅ Exportación completa
- ✅ Chat AI
- ✅ Mapas interactivos

### 📋 Gestor

- ✅ KPIs prioritarios de gestión
- ✅ Vista operativa
- ✅ Top 5 centros con más servicios
- ✅ Métricas de rendimiento
- ✅ Exportación completa
- ✅ Chat AI
- ✅ Mapas interactivos

### 📈 Analista

- ✅ KPIs con análisis de tendencias
- ✅ Vista analítica avanzada
- ✅ Comparador de KPIs
- ✅ Filtros por categoría
- ✅ Exportación completa
- ✅ Chat AI
- ✅ Mapas interactivos

### 👤 Invitado

- ✅ KPIs de información pública (limitados)
- ✅ Vista simplificada
- ✅ Información de emergencias
- ✅ Mapas interactivos (solo visualización)
- ❌ Sin exportación
- ❌ Sin Chat AI

---

## 🎯 Funcionalidades por Módulo

### Dashboard

- 26 KPIs de salud con gráficos
- Filtros por categoría, provincia, tendencia
- Búsqueda global con relevancia
- Comparador de KPIs
- Estadísticas en tiempo real
- Exportación a PDF/CSV/Excel

### Mapas

- 103 centros de salud georreferenciados
- Filtros por tipo y servicios
- Búsqueda por nombre y ciudad
- Mapa de calor de densidad
- Información detallada de cada centro
- Exportación de datos

### Chat AI

- LLM con contexto del sistema sanitario
- Respuestas en Markdown
- Historial de conversaciones
- Rate limiting inteligente
- Validación y sanitización

### Configuración

- Cambio de contraseña
- Preferencias de tema (claro/oscuro)
- Información de cuenta
- _Próximamente: Perfil y Notificaciones_

### Gestión de Usuarios (Admin)

- Crear, editar, eliminar usuarios
- Búsqueda y filtros
- Activar/Desactivar usuarios
- Validaciones completas
- Feedback con toasts

---

## 🧪 Testing

El proyecto cuenta con una suite completa de testing:

### Tests Unitarios (Vitest)

```bash
npm test          # Watch mode
npm run test:ui   # UI interactiva
```

**Coverage: 85.82%**

- 150+ tests
- Servicios de seguridad
- Stores de Zustand
- Componentes UI

### Tests E2E (Playwright)

```bash
npm run test:e2e       # Headless
npm run test:e2e:ui    # Con UI
```

**17 tests E2E**

- Flujo de login
- Navegación entre páginas
- Dashboard y KPIs
- Rutas protegidas

Ver [TESTING.md](TESTING.md) para más detalles.

---

## 💻 Desarrollo

### Agregar Nuevo KPI

1. Agregar datos en `public/data/kpis.json`:

```json
{
  "id": "kpi_27",
  "name": "Nuevo KPI",
  "value": 85.5,
  "unit": "%",
  "category": "Asistencia Sanitaria",
  "trend": "positive",
  "description": "Descripción del KPI",
  "change": 5.2
}
```

2. El KPI aparecerá automáticamente en el dashboard

### Agregar Nueva Ruta

1. Crear componente en `src/pages/`:

```tsx
// src/pages/NuevaPagina.tsx
function NuevaPagina() {
  return <div>Mi nueva página</div>;
}
export default NuevaPagina;
```

2. Agregar ruta en `App.tsx`:

```tsx
<Route
  path="/nueva-pagina"
  element={
    <ProtectedRoute>
      <NuevaPagina />
    </ProtectedRoute>
  }
/>
```

### Crear Nuevo Store

```tsx
// src/store/miStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MiStore {
  data: any;
  loadData: () => Promise<void>;
}

export const useMiStore = create<MiStore>()(
  persist(
    (set) => ({
      data: null,
      loadData: async () => {
        // Lógica aquí
      },
    }),
    { name: 'mi-storage' }
  )
);
```

### Agregar Componente Común

```tsx
// src/components/common/MiComponente.tsx
interface MiComponenteProps {
  title: string;
}

function MiComponente({ title }: MiComponenteProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
      <h2>{title}</h2>
    </div>
  );
}

export default MiComponente;
```

---

## 🚀 Deployment

### Build de Producción

```bash
npm run build
```

El build se genera en la carpeta `dist/`.

### Desplegar en Vercel (Recomendado)

1. Instalar Vercel CLI:

```bash
npm i -g vercel
```

2. Deploy:

```bash
vercel
```

3. Configurar variables de entorno en Vercel:
   - `VITE_GROQ_API_KEY`
   - Otras variables de `.env`

### Desplegar en Netlify

1. Conectar repositorio en Netlify
2. Configurar build:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Agregar variables de entorno

### Desplegar en otros servicios

La aplicación es compatible con cualquier servicio que soporte sitios estáticos:

- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront
- Firebase Hosting

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código

- **TypeScript estricto**: Sin uso de `any`
- **ESLint**: Código debe pasar linting
- **Tests**: Agregar tests para nuevas funcionalidades
- **Commits**: Usar conventional commits (feat, fix, docs, etc.)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autores

- **Antonio Jesús Padilla** - Desarrollo principal
- **Claude Code** - Asistencia a testear en desarrollo

---

## 🙏 Agradecimientos

- Sistema de salud de Andalucía por los datos
- Comunidad de React y TypeScript
- Groq por el API de LLM
- OpenStreetMap por los mapas

---

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias:

- 🐛 Reportar bugs: [Issues](https://github.com/AntonioJesusPadilla/copilot-salud-react/issues)
- 💬 Discusiones: [Discussions](https://github.com/AntonioJesusPadilla/copilot-salud-react/discussions)
- 📧 Email: antoniojesuspadilla.dev@proton.me

---

## 🗺️ Roadmap

Ver [.claude/ROADMAP.md](.claude/ROADMAP.md) para el roadmap completo del proyecto.

### Próximas Features

- 🔔 Sistema de Notificaciones completo
- 👤 Perfil de Usuario con avatar
- 🔄 Sistema de reordenación de KPIs (drag & drop)
- 🌍 Soporte multi-idioma (i18n)
- 📱 Progressive Web App (PWA)
- 🔌 Integración con backend real

---

**Hecho con ❤️ para el sistema de salud andaluz**
