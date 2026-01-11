# 🧪 Estrategia de Testing - Copilot Salud Andalucía

## Índice

- [Visión General](#visión-general)
- [Tests Unitarios](#tests-unitarios)
- [Tests E2E](#tests-e2e)
- [Cobertura de Código](#cobertura-de-código)
- [Ejecutar Tests](#ejecutar-tests)
- [Mejores Prácticas](#mejores-prácticas)

## Visión General

El proyecto implementa una estrategia de testing completa en tres niveles:

1. **Tests Unitarios** (Vitest + Testing Library)
2. **Tests de Integración** (Vitest)
3. **Tests E2E** (Playwright)

### Stack de Testing

- **Vitest**: Test runner para tests unitarios e integración
- **@testing-library/react**: Testing utilities para componentes React
- **@testing-library/jest-dom**: Matchers personalizados para DOM
- **Playwright**: Framework E2E para tests de navegador

### Cobertura Actual

```
Overall Coverage: 85.82%
├── Statements: 85.82%
├── Branches: 80.84%
├── Functions: 90.9%
└── Lines: 85.55%
```

**Objetivo**: Mantener >70% de cobertura en todos los aspectos

---

## Tests Unitarios

### Estructura

```
src/
├── components/
│   ├── common/
│   │   ├── Card.tsx
│   │   ├── Card.test.tsx ✅
│   │   ├── LoadingSpinner.tsx
│   │   └── LoadingSpinner.test.tsx ✅
│   └── dashboard/
│       ├── StatsCard.tsx
│       └── StatsCard.test.tsx ✅
├── services/
│   └── security/
│       ├── inputValidationService.ts
│       ├── inputValidationService.test.ts ✅
│       ├── sanitizationService.ts
│       └── sanitizationService.test.ts ✅
└── store/
    ├── authStore.ts
    ├── authStore.test.ts ✅
    ├── kpiStore.ts
    └── kpiStore.test.ts ✅
```

### Tests de Servicios

#### `inputValidationService.test.ts` (41 tests)

Valida todas las funciones de validación de inputs:

- ✅ Validación de emails
- ✅ Validación de nombres de usuario
- ✅ Validación de contraseñas
- ✅ Validación de strings seguros
- ✅ Validación de mensajes de chat
- ✅ Validación de URLs
- ✅ Validación de enteros
- ✅ Validación de nombres de archivo
- ✅ Escape de HTML

**Cobertura**: 76.28% (statements)

#### `sanitizationService.test.ts` (39 tests)

Valida todas las funciones de sanitización:

- ✅ Sanitización de HTML
- ✅ Sanitización de markdown
- ✅ Sanitización de objetos (prototype pollution)
- ✅ Sanitización de búsquedas
- ✅ Sanitización de nombres de archivo
- ✅ Sanitización de JSON
- ✅ Detección de código peligroso
- ✅ Sanitización de respuestas del Chat AI

**Cobertura**: 84.84% (statements)

### Tests de Stores (Zustand)

#### `authStore.test.ts` (12 tests)

- ✅ Estado inicial
- ✅ Login exitoso y fallido
- ✅ Manejo de estados de carga
- ✅ Logout
- ✅ Setters y error handling
- ✅ Verificación de autenticación

**Cobertura**: 100% (statements)

#### `kpiStore.test.ts` (11 tests)

- ✅ Estado inicial
- ✅ Carga de KPIs
- ✅ Aplicación de filtros
- ✅ Selección de KPIs
- ✅ Refresco de datos
- ✅ Manejo de errores

**Cobertura**: 100% (statements)

### Tests de Componentes

#### `Card.test.tsx` (19 tests)

- ✅ Renderizado de contenido
- ✅ Variantes (default, outlined, elevated)
- ✅ Props opcionales (title, subtitle, footer, actions)
- ✅ Eventos (onClick, hoverable)
- ✅ Clases CSS personalizadas
- ✅ Dark mode

**Cobertura**: 100%

#### `LoadingSpinner.test.tsx` (21 tests)

- ✅ 4 variantes (spinner, dots, pulse, ring)
- ✅ 4 tamaños (sm, md, lg, xl)
- ✅ Texto opcional
- ✅ Colores personalizados
- ✅ Modo fullscreen
- ✅ Overlay
- ✅ Animaciones

**Cobertura**: 100%

#### `StatsCard.test.tsx` (7 tests)

- ✅ Renderizado de título e icono
- ✅ Renderizado de stats
- ✅ Subtítulos opcionales
- ✅ Colores personalizados
- ✅ Arrays vacíos
- ✅ Valores string y numéricos
- ✅ Dark mode

**Cobertura**: 100%

---

## Tests E2E

### Configuración

Playwright está configurado para ejecutar tests E2E en navegador Chromium.

**Archivo**: `playwright.config.ts`

```typescript
{
  testDir: './e2e',
  baseURL: 'http://localhost:5173',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
  }
}
```

### Tests Implementados

#### `login.spec.ts` (6 tests)

- ✅ Muestra la página de login
- ✅ Validación de campos vacíos
- ✅ Login exitoso con credenciales válidas
- ✅ Error con credenciales inválidas
- ✅ Elementos accesibles
- ✅ Funcionalidad completa del formulario

#### `dashboard.spec.ts` (7 tests)

- ✅ Muestra dashboard después del login
- ✅ Muestra KPIs en el dashboard
- ✅ Navegación a página de mapas
- ✅ Navegación a página de chat
- ✅ Funcionalidad de logout
- ✅ Diseño responsive (móvil y desktop)

#### `navigation.spec.ts` (4 tests)

- ✅ Protección de rutas no autenticadas
- ✅ Navegación entre páginas
- ✅ Persistencia de estado
- ✅ Botón de retroceso del navegador

---

## Cobertura de Código

### Configuración de Coverage

**Archivo**: `vitest.config.ts`

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  thresholds: {
    lines: 70,
    functions: 70,
    branches: 70,
    statements: 70,
  },
}
```

### Archivos Excluidos

- `node_modules/**`
- `src/test/**`
- `**/*.d.ts`
- `**/*.config.*`
- `**/mockData/**`
- `dist/**`
- `src/main.tsx`
- `src/vite-env.d.ts`

### Reporte de Coverage Actual

| Archivo                      | Statements | Branches | Functions | Lines  |
| ---------------------------- | ---------- | -------- | --------- | ------ |
| **components/common**        | 100%       | 100%     | 100%      | 100%   |
| - Card.tsx                   | 100%       | 100%     | 100%      | 100%   |
| - LoadingSpinner.tsx         | 100%       | 100%     | 100%      | 100%   |
| **components/dashboard**     | 100%       | 100%     | 100%      | 100%   |
| - StatsCard.tsx              | 100%       | 100%     | 100%      | 100%   |
| **services/security**        | 80.61%     | 76.12%   | 83.33%    | 80.2%  |
| - inputValidationService.ts  | 76.28%     | 76.04%   | 81.81%    | 76.28% |
| - sanitizationService.ts     | 84.84%     | 76.27%   | 84.21%    | 84.21% |
| **store**                    | 100%       | 75%      | 100%      | 100%   |
| - authStore.ts               | 100%       | 83.33%   | 100%      | 100%   |
| - kpiStore.ts                | 100%       | 50%      | 100%      | 100%   |
| **TOTAL**                    | **85.82%** | **80.84%** | **90.9%** | **85.55%** |

---

## Ejecutar Tests

### Tests Unitarios

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test

# Ejecutar tests una vez (CI mode)
npm run test:run

# Ejecutar tests con UI
npm run test:ui

# Ejecutar con coverage
npm run test:coverage
```

### Tests E2E

```bash
# Ejecutar tests E2E
npm run test:e2e

# Ejecutar con UI interactiva
npm run test:e2e:ui

# Ejecutar en modo debug
npm run test:e2e:debug

# Ver reporte de resultados
npm run test:e2e:report
```

### Ejecutar Tests Específicos

```bash
# Tests de servicios
npm run test:run -- src/services

# Tests de stores
npm run test:run -- src/store

# Tests de componentes
npm run test:run -- src/components

# Tests de seguridad
npm run test:run -- src/services/security
```

---

## Mejores Prácticas

### 1. Estructura de Tests

```typescript
describe('ComponentName or ServiceName', () => {
  describe('specific feature or method', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = functionToTest(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### 2. Naming Conventions

- Usar nombres descriptivos: `should validate email format`
- Evitar nombres técnicos: ❌ `test1`, `testEmail`
- Describir el comportamiento esperado
- Usar "should" para describir la expectativa

### 3. Tests de Componentes

```typescript
import { render, screen } from '@testing-library/react';
import Component from './Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component prop="value" />);

    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### 4. Mocking

```typescript
import { vi } from 'vitest';

// Mock de servicios
vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}));

// Mock de módulos
vi.mocked(authService.login).mockResolvedValue(mockResponse);
```

### 5. Cleanup

```typescript
beforeEach(() => {
  // Reset state
  useStore.setState(initialState);

  // Clear mocks
  vi.clearAllMocks();

  // Clear storage
  localStorage.clear();
});
```

### 6. Tests E2E

```typescript
test('should complete user flow', async ({ page }) => {
  // Navigate
  await page.goto('/');

  // Interact
  await page.fill('input[name="username"]', 'test');
  await page.click('button[type="submit"]');

  // Assert
  await expect(page).toHaveURL('/dashboard');
});
```

### 7. Coverage Goals

- **Servicios críticos**: >80%
- **Componentes UI**: >70%
- **Stores**: >90%
- **Utilities**: >90%

### 8. Test Isolation

- Cada test debe ser independiente
- No depender del orden de ejecución
- Limpiar estado entre tests
- No compartir datos mutables

---

## Roadmap de Testing

### ✅ Completado (Subsistema 16)

- Configuración de Vitest
- Tests de servicios de seguridad (80 tests)
- Tests de stores Zustand (23 tests)
- Tests de componentes comunes (47 tests)
- Coverage > 70% objetivo alcanzado

### ✅ Completado (Subsistema 17)

- Configuración de Playwright
- Tests E2E de Login (6 tests)
- Tests E2E de Dashboard (7 tests)
- Tests E2E de Navegación (4 tests)

### 🔄 Próximos Pasos

1. Ampliar tests de componentes (KPICard, ChatInterface, MapPage)
2. Tests de servicios adicionales (chatService, kpiService, mapService)
3. Tests de hooks personalizados (si existen)
4. Tests de utilidades y helpers
5. Ampliar tests E2E (Mapas, Chat AI, Filtros, Exportación)
6. Integración con CI/CD (GitHub Actions)

---

## Scripts Disponibles

### Vitest (Tests Unitarios)

| Script              | Descripción                          |
| ------------------- | ------------------------------------ |
| `npm test`          | Ejecutar tests en modo watch         |
| `npm run test:ui`   | Ejecutar con interfaz visual         |
| `npm run test:run`  | Ejecutar una vez (CI mode)           |
| `npm run test:coverage` | Ejecutar con reporte de cobertura |

### Playwright (Tests E2E)

| Script                  | Descripción                       |
| ----------------------- | --------------------------------- |
| `npm run test:e2e`      | Ejecutar tests E2E                |
| `npm run test:e2e:ui`   | Ejecutar con interfaz interactiva |
| `npm run test:e2e:debug` | Ejecutar en modo debug            |
| `npm run test:e2e:report` | Ver reporte HTML                 |

---

## Recursos

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Zustand Testing](https://docs.pmnd.rs/zustand/guides/testing)

---

## Contribuir

Para agregar nuevos tests:

1. Crear archivo `*.test.ts` o `*.test.tsx` junto al archivo original
2. Seguir las convenciones de naming
3. Ejecutar tests localmente antes de commit
4. Verificar que coverage no disminuya

```bash
# Antes de commit
npm run test:run
npm run test:coverage
```

---

**Última actualización**: 11/01/2026
**Versión**: 1.0
**Coverage objetivo**: >70% ✅
**Tests totales**: 150+ tests unitarios + 17 tests E2E
