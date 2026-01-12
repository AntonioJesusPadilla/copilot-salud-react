# 🤝 Guía de Contribución

Gracias por tu interés en contribuir a **Copilot Salud Andalucía**. Esta guía te ayudará a empezar.

---

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Commits y Mensajes](#commits-y-mensajes)
- [Pull Requests](#pull-requests)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Features](#sugerir-features)

---

## 📜 Código de Conducta

Este proyecto sigue un código de conducta que todos los contribuyentes deben respetar:

- **Sé respetuoso**: Trata a todos con respeto y consideración
- **Sé constructivo**: Ofrece críticas constructivas
- **Sé inclusivo**: Fomenta un ambiente acogedor
- **Sé profesional**: Mantén un tono profesional

---

## 🎯 ¿Cómo puedo contribuir?

Hay muchas formas de contribuir:

### 1. 🐛 Reportar Bugs
Ayuda a mejorar la calidad reportando errores que encuentres.

### 2. 💡 Sugerir Features
Propón nuevas funcionalidades que mejoren la aplicación.

### 3. 📝 Mejorar Documentación
La documentación siempre puede mejorar.

### 4. 🧪 Escribir Tests
Aumenta la cobertura de tests.

### 5. 💻 Desarrollar Features
Implementa nuevas funcionalidades.

### 6. 🔧 Corregir Bugs
Ayuda a resolver issues abiertos.

---

## ⚙️ Configuración del Entorno

### Prerequisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git >= 2.30.0

### Setup

1. **Fork el repositorio**
   ```bash
   # Click en "Fork" en GitHub
   ```

2. **Clonar tu fork**
   ```bash
   git clone https://github.com/TU-USUARIO/copilot-salud-react.git
   cd copilot-salud-react
   ```

3. **Agregar upstream**
   ```bash
   git remote add upstream https://github.com/ORIGINAL-USUARIO/copilot-salud-react.git
   ```

4. **Instalar dependencias**
   ```bash
   npm install
   ```

5. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus credenciales
   ```

6. **Iniciar dev server**
   ```bash
   npm run dev
   ```

---

## 🔄 Proceso de Desarrollo

### 1. Crear una Rama

Siempre trabaja en una rama nueva, nunca en `main`:

```bash
# Actualizar main
git checkout main
git pull upstream main

# Crear rama para tu feature/fix
git checkout -b feature/mi-feature
# o
git checkout -b fix/mi-bugfix
```

**Convención de nombres de ramas:**
- `feature/nombre-descriptivo` - Nuevas funcionalidades
- `fix/nombre-descriptivo` - Corrección de bugs
- `docs/nombre-descriptivo` - Mejoras de documentación
- `test/nombre-descriptivo` - Agregar o mejorar tests
- `refactor/nombre-descriptivo` - Refactorización de código
- `style/nombre-descriptivo` - Cambios de estilo/formato

### 2. Desarrollar

- Escribe código limpio y comentado
- Sigue los estándares de código (ver abajo)
- Agrega tests para tu código
- Ejecuta tests regularmente

```bash
# Watch mode para desarrollo
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

### 3. Commit

Haz commits pequeños y frecuentes con mensajes descriptivos:

```bash
git add .
git commit -m "feat: agregar filtro por provincia en KPIs"
```

### 4. Push

```bash
git push origin feature/mi-feature
```

### 5. Pull Request

1. Ve a tu fork en GitHub
2. Click en "Compare & pull request"
3. Completa la plantilla del PR
4. Espera la revisión

---

## 📏 Estándares de Código

### TypeScript

#### ✅ DO

```typescript
// Usar tipos explícitos
interface UserData {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): UserData {
  // ...
}

// Usar const para valores que no cambian
const API_URL = 'https://api.example.com';

// Destructuring para claridad
const { name, email } = user;
```

#### ❌ DON'T

```typescript
// NO usar any
function getData(): any { // ❌
  // ...
}

// NO usar var
var count = 0; // ❌

// NO ignorar tipos
// @ts-ignore // ❌
const data = something();
```

### React

#### ✅ DO

```typescript
// Componentes funcionales con tipos
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// Usar hooks correctamente
function MyComponent() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, [/* dependencies */]);

  return <div>{count}</div>;
}
```

#### ❌ DON'T

```typescript
// NO usar class components (preferir funcionales)
class MyComponent extends React.Component { // ❌
  // ...
}

// NO olvidar dependencias en useEffect
useEffect(() => {
  doSomething(prop);
}, []); // ❌ Missing 'prop' in dependencies
```

### Tailwind CSS

#### ✅ DO

```typescript
// Usar clases de Tailwind
<div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
    Título
  </h2>
</div>

// Usar transition-colors para temas
<button className="transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
  Click
</button>
```

#### ❌ DON'T

```typescript
// NO usar estilos inline (excepto casos muy específicos)
<div style={{ backgroundColor: 'red' }}> // ❌
  Content
</div>

// NO olvidar modo oscuro
<div className="bg-white text-gray-900"> // ❌ Missing dark mode
  Content
</div>
```

### Naming Conventions

```typescript
// Componentes: PascalCase
function UserProfile() { }
const KPICard = () => { };

// Funciones/variables: camelCase
const getUserData = () => { };
let isLoading = false;

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;

// Archivos de componentes: PascalCase.tsx
// UserProfile.tsx
// KPICard.tsx

// Archivos de servicios/stores: camelCase.ts
// authService.ts
// kpiStore.ts

// Tipos/Interfaces: PascalCase
interface User { }
type UserRole = 'admin' | 'gestor';
```

### Imports

```typescript
// Orden de imports:
// 1. React/External
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Stores
import useAuthStore from '../store/authStore';
import useKPIStore from '../store/kpiStore';

// 3. Components
import Card from '../components/common/Card';
import KPICard from '../components/kpi/KPICard';

// 4. Services
import { exportToPDF } from '../services/exportService';

// 5. Types
import type { User, KPI } from '../types';

// 6. Styles (si es necesario)
import './styles.css';
```

---

## 💬 Commits y Mensajes

### Formato de Commits

Usamos **Conventional Commits**:

```
<tipo>(<scope>): <descripción corta>

<descripción larga opcional>

<footer opcional>
```

### Tipos de Commit

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan el código)
- `refactor`: Refactorización de código
- `perf`: Mejoras de performance
- `test`: Agregar o modificar tests
- `build`: Cambios en el sistema de build
- `ci`: Cambios en CI/CD
- `chore`: Tareas de mantenimiento

### Ejemplos

```bash
# Feature
git commit -m "feat: agregar filtro por provincia en dashboard"
git commit -m "feat(kpi): agregar comparador de KPIs"

# Fix
git commit -m "fix: corregir error en carga de mapas"
git commit -m "fix(auth): validar formato de email en login"

# Docs
git commit -m "docs: actualizar README con nuevas instrucciones"
git commit -m "docs(api): documentar endpoints de usuario"

# Refactor
git commit -m "refactor: simplificar lógica de filtros"
git commit -m "refactor(store): optimizar authStore"

# Test
git commit -m "test: agregar tests para userService"
git commit -m "test(e2e): agregar test de flujo de exportación"
```

### Buenas Prácticas

✅ **DO**:
- Usa presente imperativo: "add" no "added"
- Sé conciso pero descriptivo
- Explica el "qué" y el "por qué", no el "cómo"
- Referencia issues: "fix: corregir bug de login (#123)"

❌ **DON'T**:
- "Fixed stuff"
- "WIP"
- "asdfasdf"
- Commits gigantes con muchos cambios

---

## 🔀 Pull Requests

### Antes de Crear el PR

- ✅ Actualiza tu rama con `main`:
  ```bash
  git checkout main
  git pull upstream main
  git checkout feature/mi-feature
  git rebase main
  ```

- ✅ Ejecuta todos los tests:
  ```bash
  npm run test:run
  npm run test:e2e
  ```

- ✅ Pasa el linter:
  ```bash
  npm run lint
  npm run type-check
  ```

- ✅ Verifica que el build funciona:
  ```bash
  npm run build
  ```

### Plantilla de PR

```markdown
## 📝 Descripción

Descripción clara y concisa de los cambios.

## 🎯 Tipo de Cambio

- [ ] 🐛 Bug fix
- [ ] ✨ Nueva funcionalidad
- [ ] 💥 Breaking change
- [ ] 📝 Documentación
- [ ] 🧪 Tests

## 🧪 ¿Cómo se ha probado?

Describe las pruebas que ejecutaste.

- [ ] Tests unitarios
- [ ] Tests E2E
- [ ] Pruebas manuales

## 📸 Screenshots (si aplica)

Agregar screenshots para cambios visuales.

## ✅ Checklist

- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan nuevos warnings
- [ ] He agregado tests que prueban mi fix/feature
- [ ] Los tests unitarios y E2E pasan localmente
- [ ] He actualizado el ROADMAP si es necesario

## 🔗 Issues Relacionados

Closes #123
Related to #456
```

### Durante la Revisión

- Responde a los comentarios de forma constructiva
- Haz los cambios solicitados
- Marca conversaciones como resueltas cuando corresponda
- Sé paciente, las revisiones toman tiempo

---

## 🐛 Reportar Bugs

### Antes de Reportar

1. **Busca** si el bug ya fue reportado
2. **Verifica** que estés usando la última versión
3. **Reproduce** el bug de forma consistente

### Plantilla de Bug Report

```markdown
## 🐛 Descripción del Bug

Descripción clara y concisa del bug.

## 🔄 Pasos para Reproducir

1. Ve a '...'
2. Click en '...'
3. Scroll hasta '...'
4. Ver error

## ✅ Comportamiento Esperado

Qué esperabas que sucediera.

## ❌ Comportamiento Actual

Qué está sucediendo actualmente.

## 📸 Screenshots

Si aplica, agregar screenshots.

## 💻 Entorno

- OS: [e.g. Windows 11, macOS 14.0]
- Navegador: [e.g. Chrome 120, Firefox 121]
- Versión del Proyecto: [e.g. 1.0.0]
- Node.js: [e.g. 20.10.0]

## 📋 Logs

```
Pegar logs relevantes aquí
```

## 🔍 Contexto Adicional

Cualquier otro contexto sobre el problema.
```

---

## 💡 Sugerir Features

### Plantilla de Feature Request

```markdown
## 💡 Descripción del Feature

Descripción clara y concisa del feature propuesto.

## 🎯 Problema que Resuelve

¿Qué problema o necesidad resuelve este feature?

## 💭 Solución Propuesta

Descripción de cómo te gustaría que funcionara.

## 🔀 Alternativas Consideradas

Otras soluciones que consideraste.

## 📸 Mockups (opcional)

Si tienes mockups o diseños, agrégalos aquí.

## 📦 Impacto

- [ ] Breaking change
- [ ] Requiere migración de datos
- [ ] Afecta performance
- [ ] Requiere nuevas dependencias

## ✅ Criterios de Aceptación

- [ ] ...
- [ ] ...
```

---

## ❓ ¿Preguntas?

Si tienes preguntas sobre cómo contribuir:

- 💬 Abre una [Discussion](https://github.com/AntonioJesusPadilla/copilot-salud-react/discussions)
- 📧 Envía un email a: antoniojesuspadilla.dev@proton.me
- 🐛 Revisa [Issues](https://github.com/AntonioJesusPadilla/copilot-salud-react/issues)

---

## 🙏 Agradecimientos

¡Gracias por contribuir a Copilot Salud Andalucía! Cada contribución, sin importar su tamaño, es valiosa para el proyecto.

---

**Happy Coding! 🚀**
