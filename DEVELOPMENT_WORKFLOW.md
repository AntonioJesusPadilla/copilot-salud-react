# 🚀 Flujo de Desarrollo y Control de Calidad

## 📋 Tabla de Contenidos

- [Flujo de Trabajo](#flujo-de-trabajo)
- [Comandos de Verificación](#comandos-de-verificación)
- [Puntos Críticos](#puntos-críticos)
- [Áreas Sensibles](#áreas-sensibles)
- [Guía de Testing](#guía-de-testing)
- [Configuración Actual](#configuración-actual)
- [Troubleshooting](#troubleshooting)

---

## 🔄 Flujo de Trabajo

### 1. Antes de Empezar Nueva Funcionalidad

```bash
# Crear rama de feature
git checkout -b feature/nombre-descriptivo

# Asegurar dependencias actualizadas
npm install

# Verificar estado inicial
npm audit                    # 0 vulnerabilidades ✅
npm run lint                 # 0 errores/warnings ✅
npm run type-check           # Sin errores de tipos ✅
```

### 2. Durante el Desarrollo

```bash
# Ejecutar en watch mode (desarrollo continuo)
npm run dev                  # Servidor de desarrollo

# En otra terminal: verificación continua
npm run lint                 # Revisar código
npm run type-check           # Verificar tipos TypeScript
npm run test                 # Tests unitarios en watch mode
```

### 3. Antes de Hacer Commit

```bash
# ⚠️ OBLIGATORIO - Ejecutar en orden:

# Paso 1: Linting
npm run lint                 # Debe pasar sin errores

# Paso 2: Type Check
npm run type-check           # Sin errores de TypeScript

# Paso 3: Tests Unitarios
npm run test:run             # Todos los tests deben pasar

# Paso 4: Tests E2E
npm run test:e2e             # 15/15 tests pasando

# Paso 5: Build de Producción
npm run build                # Compilación exitosa

# Paso 6: Security Audit
npm audit                    # 0 vulnerabilidades
```

### 4. Commit y Push

```bash
# Agregar cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: descripción clara del cambio

- Detalle 1
- Detalle 2
- Tests actualizados

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push a rama feature
git push origin feature/nombre-descriptivo
```

### 5. Antes de Merge a Main

```bash
# Actualizar con main
git checkout main
git pull origin main
git checkout feature/nombre-descriptivo
git rebase main

# Verificar todo nuevamente
npm run lint && npm run type-check && npm run test:run && npm run test:e2e && npm run build

# Si todo pasa, crear Pull Request
```

---

## ⚙️ Comandos de Verificación

### Comandos Básicos

| Comando              | Descripción                   | Tiempo Aprox. | Obligatorio |
| -------------------- | ----------------------------- | ------------- | ----------- |
| `npm run lint`       | ESLint - Calidad de código    | 5-10s         | ✅ Sí       |
| `npm run lint:fix`   | Auto-fix de problemas de lint | 10-15s        | 🔧 Útil     |
| `npm run type-check` | TypeScript - Verificar tipos  | 10-15s        | ✅ Sí       |
| `npm run test:run`   | Tests unitarios (Vitest)      | 5-10s         | ✅ Sí       |
| `npm run test:e2e`   | Tests E2E (Playwright)        | 45-60s        | ✅ Sí       |
| `npm run build`      | Build de producción           | 80-120s       | ✅ Sí       |
| `npm audit`          | Vulnerabilidades de seguridad | 2-5s          | ✅ Sí       |

### Comandos de Desarrollo

| Comando                  | Descripción                                    | Uso                 |
| ------------------------ | ---------------------------------------------- | ------------------- |
| `npm run dev`            | Servidor de desarrollo (http://localhost:5173) | Desarrollo diario   |
| `npm run test`           | Tests unitarios en watch mode                  | Durante desarrollo  |
| `npm run test:ui`        | UI interactiva para tests                      | Debugging de tests  |
| `npm run test:coverage`  | Cobertura de tests                             | Verificar cobertura |
| `npm run test:e2e:ui`    | UI de Playwright                               | Debugging E2E       |
| `npm run test:e2e:debug` | Debug paso a paso E2E                          | Debugging complejo  |

### Comandos de Validación Completa

```bash
# Verificación completa antes de commit (1 línea)
npm run lint && npm run type-check && npm run test:run && npm run test:e2e && npm run build && npm audit

# Verificación rápida (sin E2E ni build)
npm run lint && npm run type-check && npm run test:run
```

---

## 🎯 Puntos Críticos

### 1. Tests E2E - Selectores Sensibles

Si modificas las páginas, actualiza los selectores en `/e2e`:

**Login Page:**

```typescript
// ✅ CORRECTO
input#username          // ID específico
input#password          // ID específico
h2                      // Título "Iniciar Sesión"

// ❌ EVITAR
input[placeholder*="nombre de usuario"]  // Placeholder puede cambiar
```

**Dashboard:**

```typescript
// ✅ CORRECTO - Usar .first() para evitar strict mode
page.locator('text=/Dashboard|Panel/i').first();

// ❌ EVITAR - Múltiples coincidencias
page.locator('text=/Dashboard|Panel/i'); // Error: strict mode violation
```

**Navegación:**

```typescript
// ✅ CORRECTO - Timeout aumentado para páginas pesadas
await page.waitForURL('**/map', { timeout: 10000 }).catch(() => {});

// ❌ EVITAR - Timeout corto
await page.waitForURL('**/map', { timeout: 5000 }); // Puede fallar
```

### 2. ESLint - Configuración Estricta

```javascript
// ✅ REGLAS CRÍTICAS
'@typescript-eslint/no-explicit-any': 'error'  // Prohibido usar 'any'
'@typescript-eslint/no-unused-vars': 'warn'    // Alertar variables no usadas

// ✅ Variables no usadas - Prefijo con _
const { password: _password, ...rest } = user;  // Correcto
const { password, ...rest } = user;             // ❌ Warning
```

### 3. Dependencias - Seguridad

```bash
# ⚠️ ANTES de actualizar cualquier dependencia:
npm audit                # Verificar estado actual
npm outdated            # Ver paquetes desactualizados

# Actualizar con cuidado:
npm install package@latest  # Actualizar uno por uno
npm run test:run           # Verificar que todo funciona
npm run test:e2e           # Verificar E2E
npm audit                  # Verificar seguridad
```

**Dependencia Especial - xlsx:**

```json
// ⚠️ IMPORTANTE: No actualizar desde npm
"xlsx": "https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz"

// Motivo: Versión npm (0.18.5) tiene vulnerabilidades HIGH
// Usar siempre CDN oficial de SheetJS
```

### 4. Build Size - Warning de Chunks

```bash
# ⚠️ Actual: exportService-*.js es ~943 KB (289 KB gzipped)
# Si supera 1 MB gzipped, considerar:
- Code splitting con dynamic import()
- Lazy loading de componentes pesados
- Tree shaking de dependencias no usadas
```

---

## 🔒 Áreas Sensibles del Proyecto

### Alta Prioridad (Revisar cambios con cuidado)

```
src/services/
├── authService.ts           ⚠️ Autenticación - CRÍTICO
├── filterService.ts         ⚠️ Lógica de filtros KPI
├── kpiService.ts           ⚠️ Datos de salud
└── security/
    ├── rateLimitService.ts  ⚠️ Protección rate limiting
    └── sanitizationService.ts ⚠️ Sanitización de inputs

src/store/
├── authStore.ts            ⚠️ Estado de autenticación
├── userStore.ts            ⚠️ Gestión de usuarios
└── kpiStore.ts            ⚠️ Estado global KPIs

src/pages/
└── LoginPage.tsx           ⚠️ Punto de entrada - autenticación

.github/workflows/
└── ci.yml                  ⚠️ Pipeline CI/CD - deployment
```

### Media Prioridad (Revisar cambios)

```
src/components/
├── filters/                🔸 Filtros avanzados
├── kpi/                   🔸 Visualización de KPIs
└── user/                  🔸 Gestión de usuarios

e2e/                       🔸 Tests E2E - actualizar si cambias UI
├── login.spec.ts
├── dashboard.spec.ts
└── navigation.spec.ts
```

### Baja Prioridad (Cambios seguros)

```
src/components/common/      ✅ Componentes UI genéricos
src/types/                 ✅ Definiciones de tipos
docs/                      ✅ Documentación
```

---

## 🧪 Guía de Testing

### Tests Unitarios (Vitest)

**Ubicación:** `src/**/*.test.ts` o `src/**/*.spec.ts`

```typescript
// Ejemplo de test unitario
import { describe, it, expect } from 'vitest';
import { filterKPIs } from './filterService';

describe('filterService', () => {
  it('should filter KPIs by category', () => {
    const kpis = [
      /* ... */
    ];
    const result = filterKPIs(kpis, { categories: ['Atención Primaria'] });
    expect(result).toHaveLength(5);
  });
});
```

**Ejecutar:**

```bash
npm run test           # Watch mode
npm run test:run       # Una vez
npm run test:coverage  # Con cobertura
```

### Tests E2E (Playwright)

**Ubicación:** `e2e/*.spec.ts`

```typescript
// Ejemplo de test E2E
import { test, expect } from '@playwright/test';

test('should login successfully', async ({ page }) => {
  await page.goto('/');
  await page.fill('input#username', 'admin');
  await page.fill('input#password', 'admin123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard', { timeout: 5000 });
  expect(page.url()).toContain('/dashboard');
});
```

**Ejecutar:**

```bash
npm run test:e2e        # Headless
npm run test:e2e:ui     # Con UI
npm run test:e2e:debug  # Debug paso a paso
```

**Buenas Prácticas E2E:**

1. **Usar IDs o roles específicos:**

   ```typescript
   // ✅ Mejor
   page.locator('input#username');
   page.getByRole('button', { name: 'Submit' });

   // ❌ Evitar
   page.locator('input[placeholder="Usuario"]'); // Frágil
   ```

2. **Timeouts apropiados:**

   ```typescript
   // ✅ Páginas pesadas (mapa, chat)
   await page.waitForURL('**/map', { timeout: 10000 });

   // ✅ Páginas ligeras (dashboard, login)
   await page.waitForURL('**/dashboard', { timeout: 5000 });
   ```

3. **Manejo de errores:**

   ```typescript
   // ✅ Navegación opcional
   await page.waitForURL('**/map', { timeout: 10000 }).catch(() => {});

   // ✅ Verificar elemento visible
   if (await button.isVisible().catch(() => false)) {
     await button.click();
   }
   ```

4. **Evitar strict mode violations:**

   ```typescript
   // ✅ Usar .first() cuando hay múltiples elementos
   await page.locator('text=/Dashboard/i').first().click();

   // ❌ Error si hay múltiples coincidencias
   await page.locator('text=/Dashboard/i').click();
   ```

---

## ⚙️ Configuración Actual

### Stack Tecnológico

```yaml
Runtime:
  - Node.js: 20.x
  - Package Manager: npm

Frontend:
  - React: 19.2.3
  - TypeScript: 5.6.2
  - Vite: 6.0.3
  - React Router: 7.11.0
  - Zustand: 5.0.9 (State Management)

UI/Styling:
  - Tailwind CSS: 3.4.19
  - Lucide React: 0.562.0 (Icons)

Librerías Principales:
  - Leaflet: 1.9.4 (Mapas)
  - Recharts: 3.6.0 (Gráficos)
  - xlsx: 0.20.3 (Excel - desde CDN SheetJS)
  - Groq SDK: 0.37.0 (AI Chat)

Testing:
  - Vitest: 4.0.16 (Unit Tests)
  - Playwright: 1.57.0 (E2E Tests)
  - Testing Library: 16.3.1

Linting/Formatting:
  - ESLint: 9.15.0 (Flat Config)
  - Prettier: 3.7.4
  - TypeScript ESLint: 8.53.0

CI/CD:
  - GitHub Actions
  - Vercel (Deployment)
```

### Scripts Disponibles

```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "build:prod": "NODE_ENV=production npm run build",
  "lint": "eslint . --report-unused-disable-directives --max-warnings 0",
  "lint:fix": "eslint . --fix",
  "preview": "vite preview",
  "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
  "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\"",
  "type-check": "tsc --noEmit",
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:debug": "playwright test --debug",
  "test:e2e:report": "playwright show-report"
}
```

### Configuración de ESLint 9.x

**Archivo:** `eslint.config.js`

```javascript
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage', 'playwright-report'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'error', // ⚠️ ESTRICTO
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  }
);
```

### Configuración de Playwright

**Archivo:** `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

---

## 🔧 Troubleshooting

### Problema: Tests E2E Fallan con Timeout

**Síntomas:**

```
Error: page.waitForURL: Timeout 5000ms exceeded
```

**Soluciones:**

1. Aumentar timeout para páginas pesadas (mapa, chat):

   ```typescript
   await page.waitForURL('**/map', { timeout: 10000 });
   ```

2. Agregar manejo de errores:

   ```typescript
   await page.waitForURL('**/map', { timeout: 10000 }).catch(() => {});
   ```

3. Verificar que el servidor de desarrollo está corriendo

### Problema: ESLint Falla con "no-explicit-any"

**Síntomas:**

```
error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
```

**Soluciones:**

1. Definir tipos específicos:

   ```typescript
   // ❌ Error
   const data: any = payload;

   // ✅ Correcto
   const data: TooltipPayload = payload;
   ```

2. Si realmente necesitas `any`, usa `unknown`:
   ```typescript
   const data: unknown = payload;
   // Luego valida el tipo antes de usar
   ```

### Problema: npm audit Reporta Vulnerabilidades

**Síntomas:**

```
found 1 high severity vulnerability
```

**Soluciones:**

1. Verificar detalles:

   ```bash
   npm audit --json
   ```

2. Actualizar dependencia afectada:

   ```bash
   npm install package@latest
   npm audit
   ```

3. Si es `xlsx`, usar CDN oficial:
   ```bash
   npm uninstall xlsx
   npm install https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
   ```

### Problema: Build Falla con Errores de TypeScript

**Síntomas:**

```
error TS2339: Property 'x' does not exist on type 'Y'
```

**Soluciones:**

1. Ejecutar type-check primero:

   ```bash
   npm run type-check
   ```

2. Verificar tipos en archivos afectados

3. Revisar imports y exports

### Problema: CI/CD Falla en GitHub Actions

**Síntomas:**

```
Error: Resource not accessible by integration
```

**Solución:**
Verificar permisos en `.github/workflows/ci.yml`:

```yaml
permissions:
  contents: write # ✅ Necesario para comentarios
  pull-requests: write
```

### Problema: Tests Unitarios Fallan Localmente

**Soluciones:**

1. Limpiar cache:

   ```bash
   npm run test -- --clearCache
   ```

2. Reinstalar dependencias:

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Verificar versión de Node:
   ```bash
   node --version  # Debe ser 20.x
   ```

---

## 📊 Métricas de Calidad Actuales

```yaml
Código:
  - ESLint: 0 errores, 0 warnings ✅
  - TypeScript: 0 errores de tipos ✅
  - Líneas de código: ~15,000
  - Archivos TypeScript: ~80

Tests:
  - Tests Unitarios: Pendiente implementar más cobertura
  - Tests E2E: 15/15 pasando ✅ (48.5s)
  - Cobertura: Pendiente objetivo 80%

Build:
  - Tiempo de compilación: 1m 20s
  - Bundle size (gzipped): ~290 KB
  - Chunks grandes: 1 warning (exportService: 943 KB)

Seguridad:
  - npm audit: 0 vulnerabilidades ✅
  - Última actualización: xlsx 0.20.3

CI/CD:
  - Pipeline: 7 jobs
  - Tiempo total: ~3-4 minutos
  - Deploy: Automático en push a main
```

---

## 📚 Referencias Útiles

### Documentación Oficial

- [React 19 Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Playwright Docs](https://playwright.dev/)
- [Vitest Guide](https://vitest.dev/guide/)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Recursos del Proyecto

- Producción: `https://copilot-salud-andalucia.vercel.app`
- Repositorio: GitHub
- CI/CD: GitHub Actions + Vercel

---

## ✅ Checklist Pre-Commit

Copia y pega esto antes de cada commit:

```markdown
- [ ] `npm run lint` - Pasa sin errores
- [ ] `npm run type-check` - Sin errores de tipos
- [ ] `npm run test:run` - Todos los tests unitarios pasan
- [ ] `npm run test:e2e` - 15/15 tests E2E pasan
- [ ] `npm run build` - Compilación exitosa
- [ ] `npm audit` - 0 vulnerabilidades
- [ ] Código revisado manualmente
- [ ] Tests actualizados si es necesario
- [ ] Documentación actualizada si aplica
```

---

**Última actualización:** 14/01/2026
**Versión del proyecto:** 0.0.0
**Mantenedor:** Antonio J. Padilla
