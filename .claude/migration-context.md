# CONTEXTO DE MIGRACIÓN: COPILOT SALUD ANDALUCÍA

## RUTAS DEL PROYECTO
- **Windows**: C:\Users\Lenovo\Documents\GitHub\
- **Origen**: ..\copilot-salud-andalucia\
- **Destino**: .\ (copilot-salud-react)

## SOBRE EL PROYECTO ORIGINAL
- **Nombre**: Copilot Salud Andalucía
- **Descripción**: Dashboard de análisis de datos de salud con 26 KPIs
- **Stack actual**: Python + Streamlit
- **Características**:
  - Sistema de autenticación con 4 roles: admin, gestor, analista, invitado
  - 26 KPIs de salud de Andalucía
  - Mapas interactivos con Folium
  - Chat AI con Claude (Anthropic API)
  - Datos reales de centros de salud de Andalucía
  - Sistema de cambio de contraseñas (admin puede cambiar todas, usuarios pueden cambiar la suya)

## STACK OBJETIVO
- **Frontend**: Vite + React 18 + TypeScript 5
- **Estilos**: Tailwind CSS
- **Routing**: React Router v6
- **Estado**: Zustand (con persist)
- **Gráficos**: Recharts (equivalente a Plotly/Altair)
- **Mapas**: React-Leaflet (equivalente a Folium)
- **Chat AI**: @anthropic-ai/sdk
- **Utilidades**: date-fns, papaparse, lucide-react

## PALETA DE COLORES CORPORATIVA
```javascript
colors: {
  // Identidad corporativa Sector Cocinas
  primary: '#1FB6C3',        // Turquesa principal
  secondary: '#1E3A5F',      // Azul oscuro corporativo

  // Salud
  accent: '#20B2AA',         // Turquesa salud

  // Roles (para dashboards)
  admin: '#FF6B6B',          // Rojo - Administrador
  gestor: '#4A90E2',         // Azul - Gestor
  analista: '#7B68EE',       // Púrpura - Analista
  invitado: '#9CA3AF'        // Gris - Invitado
}
```

## ROLES Y CREDENCIALES DE PRUEBA
**Usuarios predeterminados para testing:**
1. **Administrador**: `admin` / `admin123`
   - Acceso completo
   - Puede gestionar usuarios y cambiar contraseñas
   - Puede ver todos los dashboards y exportar datos

2. **Gestor**: `gestor.malaga` / `gestor123`
   - Gestión sanitaria
   - Acceso a dashboards operativos
   - Puede exportar datos

3. **Analista**: `analista.datos` / `analista123`
   - Análisis de datos
   - Acceso a KPIs y estadísticas
   - No acceso a mapas

4. **Invitado**: `demo` / `demo123`
   - Vista pública limitada
   - Solo puede ver información básica
   - Acceso a mapas pero no a datos sensibles

## REGLAS DE CÓDIGO
1. **TypeScript estricto**: No usar `any`, todos los tipos explícitos
2. **Componentes funcionales**: Solo hooks, no class components
3. **Nombres**:
   - Variables de negocio en español (ej: `nombrePaciente`, `centroSalud`)
   - Funciones y componentes en inglés (ej: `fetchData`, `UserCard`)
   - Comentarios en español
4. **Estructura de props**: Siempre con interface TypeScript
5. **Mobile-first**: Responsive design desde el inicio
6. **Accesibilidad**: Semantic HTML, ARIA labels cuando sea necesario
7. **Performance**: Lazy loading de componentes, memoization donde aplique

## ESTRUCTURA DE ARCHIVOS
```
src/
├── components/
│   ├── kpis/           # 26 componentes de KPIs
│   ├── maps/           # Componentes de mapas
│   ├── chat/           # Sistema de chat AI
│   ├── auth/           # Login, ProtectedRoute
│   └── common/         # Componentes reutilizables
├── pages/              # Páginas principales
│   ├── LoginPage.tsx
│   ├── MedicoDashboard.tsx
│   ├── EnfermeroDashboard.tsx
│   ├── AdministradorDashboard.tsx
│   ├── PacienteDashboard.tsx
│   ├── MapPage.tsx
│   └── ChatPage.tsx
├── hooks/              # Custom hooks
├── services/           # API calls, lógica de negocio
├── store/              # Zustand stores
├── types/              # Tipos TypeScript globales
├── utils/              # Funciones helper
└── data/               # Datos mock si necesario
```

## AL MIGRAR CÓDIGO
1. **SIEMPRE** consultar el archivo original en `..\copilot-salud-andalucia\`
2. Identificar funcionalidad y dependencias
3. Traducir lógica Python → TypeScript
4. Mantener mismos nombres de funciones cuando sea posible
5. Documentar cambios significativos en comentarios
6. Priorizar mantener TODA la funcionalidad existente

## PRIORIDADES
1. ✅ Mantener 100% de funcionalidad original
2. ✅ Mejorar UX y performance
3. ✅ Código limpio y mantenible
4. ✅ Type-safety completo (sin `any`)
5. ✅ Responsive design
6. ✅ Accesibilidad básica

## REFERENCIAS DE ARCHIVOS ORIGEN (Rutas relativas)
- Autenticación: `..\copilot-salud-andalucia\app.py`
- Dashboards: `..\copilot-salud-andalucia\pages\*.py`
- KPIs: `..\copilot-salud-andalucia\healthcare_kpis.md`
- Datos: `..\copilot-salud-andalucia\data\*.csv`
- Dependencias: `..\copilot-salud-andalucia\requirements.txt`

## DATOS DISPONIBLES
**Archivos CSV en public/data/raw/**:
- accesibilidad_sanitaria_2025.csv
- demografia_malaga_2025.csv
- hospitales_malaga_2025.csv
- indicadores_salud_2025.csv
- servicios_sanitarios_2025.csv

**Archivos adicionales en public/data/**:
- users.json (sistema de usuarios)
- .encryption_key (seguridad)
